/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 · contrast: pass · responsive: pass */
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { VehicleUsageLog } from '../../models/vehicle';
import { useAppTheme } from '../../custom-theme';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';

export default function LogVehicleUsageScreen({ route }: any) {
  const { vehicle } = route.params;
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { showSnackBar } = React.useContext(CustomSnackBarContext);
  const [logs, setLogs] = useState<VehicleUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekOf, setWeekOf] = useState(new Date().toISOString().slice(0, 10));
  const [unitType, setUnitType] = useState<'MILES' | 'HOURS'>(vehicle.usageUnit || 'MILES');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLogs(await api.get<VehicleUsageLog[]>(`fleet/vehicles/${vehicle.id}/usage-logs`));
    } catch {
      showSnackBar(t('something_went_wrong'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackBar, t, vehicle.id]);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    const numericValue = Number(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekOf)) return showSnackBar(t('usage_date_required'), 'error');
    if (!Number.isFinite(numericValue) || numericValue <= 0) return showSnackBar(t('usage_value_required'), 'error');
    setSaving(true);
    try {
      const created = await api.post<VehicleUsageLog>(`fleet/vehicles/${vehicle.id}/usage-logs`, {
        weekOf,
        unitType,
        value: numericValue,
        notes: notes.trim()
      });
      setLogs((current) => [created, ...current]);
      setValue('');
      setNotes('');
      showSnackBar(t('usage_logged'), 'success');
    } catch {
      showSnackBar(t('usage_save_failure'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = (log: VehicleUsageLog) => Alert.alert(t('delete'), t('delete_usage_log'), [
    { text: t('cancel'), style: 'cancel' },
    { text: t('delete'), style: 'destructive', onPress: async () => {
      try {
        await api.deletes(`fleet/vehicles/${vehicle.id}/usage-logs/${log.id}`);
        setLogs((current) => current.filter((entry) => entry.id !== log.id));
        showSnackBar(t('usage_log_deleted'), 'success');
      } catch {
        showSnackBar(t('something_went_wrong'), 'error');
      }
    }}
  ]);

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <View style={[styles.header, { backgroundColor: theme.colors.chassis }]}>
        <Text style={[styles.eyebrow, { color: theme.colors.seasonal }]}>{t('fleet_management')}</Text>
        <Text variant="headlineSmall" style={{ color: theme.colors.paper, fontWeight: '800' }}>{vehicle.name}</Text>
        {!!vehicle.assetNumber && <Text style={{ color: theme.colors.outlineVariant }}>{vehicle.assetNumber}</Text>}
      </View>
      <Card style={[styles.card, { backgroundColor: theme.colors.paper, borderColor: theme.colors.rule }]}>
        <Card.Content style={styles.form}>
          <Text variant="titleLarge" style={styles.title}>{t('log_usage')}</Text>
          <SegmentedButtons
            value={unitType}
            onValueChange={(next) => setUnitType(next as 'MILES' | 'HOURS')}
            buttons={[
              { value: 'MILES', label: t('usage_unit_miles'), icon: 'road-variant' },
              { value: 'HOURS', label: t('usage_unit_hours'), icon: 'clock-outline' }
            ]}
          />
          <TextInput mode="outlined" label={t('week_of')} value={weekOf} onChangeText={setWeekOf} placeholder="YYYY-MM-DD" autoCapitalize="none" />
          <TextInput mode="outlined" label={`${t('usage_value')} (${unitType === 'MILES' ? t('usage_unit_miles') : t('usage_unit_hours')})`} value={value} onChangeText={setValue} keyboardType="decimal-pad" />
          <TextInput mode="outlined" label={t('notes')} value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
          <Button mode="contained" icon="speedometer" loading={saving} disabled={saving || !value} onPress={save} contentStyle={styles.saveButton}>{t('log_usage')}</Button>
        </Card.Content>
      </Card>
      <View style={styles.historyHeader}>
        <Text variant="titleLarge" style={styles.title}>{t('usage_log_history')}</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>{logs.length}</Text>
      </View>
      {loading ? <Text>{t('loading')}</Text> : logs.length === 0 ? (
        <View style={[styles.empty, { borderColor: theme.colors.rule }]}><Text style={{ color: theme.colors.onSurfaceVariant }}>{t('no_usage_logs')}</Text></View>
      ) : logs.map((log) => (
        <Card key={log.id} style={[styles.logCard, { backgroundColor: theme.colors.paper, borderColor: theme.colors.rule }]}>
          <Card.Content style={styles.logRow}>
            <View style={styles.logBody}>
              <Text variant="titleMedium" style={styles.title}>{log.value.toLocaleString()} {log.unitType === 'MILES' ? t('usage_unit_miles') : t('usage_unit_hours')}</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('week_of')}: {log.weekOf}</Text>
              {!!log.notes && <Text>{log.notes}</Text>}
            </View>
            <IconButton icon="delete-outline" accessibilityLabel={t('delete')} onPress={() => remove(log)} />
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 12, paddingBottom: 32 },
  header: { borderRadius: 14, padding: 18, gap: 4 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  card: { borderWidth: 1, borderRadius: 14, elevation: 0 },
  form: { gap: 14 },
  title: { fontWeight: '700' },
  saveButton: { minHeight: 48 },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  empty: { padding: 22, borderWidth: 1, borderRadius: 12 },
  logCard: { borderWidth: 1, borderRadius: 12, elevation: 0 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logBody: { flex: 1, gap: 3 }
});
