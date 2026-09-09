/* Hallmark · genre: modern-minimal · macrostructure: Field log · design-system: design.md · designed-as-app */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  Divider,
  SegmentedButtons,
  Text,
  TextInput
} from 'react-native-paper';
import api from '../utils/api';
import useAuth from '../hooks/useAuth';
import { useAppTheme } from '../custom-theme';
import { CustomSnackBarContext } from '../contexts/CustomSnackBarContext';
import { WashTankReading, WashTankShift } from '../models/washTank';

const today = () => new Date().toISOString().slice(0, 10);
const shiftNames: Record<WashTankShift, string> = {
  SHIFT_1: 'Shift 1 · 6 AM',
  SHIFT_2: 'Shift 2 · 10 AM',
  SHIFT_3: 'Shift 3 · 2 PM',
  SHIFT_4: 'Shift 4 · 6 PM'
};

export default function WashTankScreen() {
  const theme = useAppTheme();
  const { user } = useAuth();
  const { showSnackBar } = React.useContext(CustomSnackBarContext);
  const [readings, setReadings] = useState<WashTankReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tankNumber, setTankNumber] = useState<1 | 2>(1);
  const [readingDate, setReadingDate] = useState(today());
  const [shift, setShift] = useState<WashTankShift>('SHIFT_1');
  const [turbidity, setTurbidity] = useState<'PASS' | 'FAIL' | ''>('');
  const [chemicalPpm, setChemicalPpm] = useState('');
  const [toteLevel, setToteLevel] = useState('');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReadings(await api.get<WashTankReading[]>('wash-tank-readings'));
    } catch (error) {
      showSnackBar(api.getErrorMessage(error, 'Could not load wash tank readings'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackBar]);

  useEffect(() => { void load(); }, [load]);

  const latest = useMemo(
    () => readings.filter((reading) => reading.tankNumber === tankNumber).slice(0, 12),
    [readings, tankNumber]
  );

  const save = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(readingDate)) {
      showSnackBar('Enter the date as YYYY-MM-DD', 'error');
      return;
    }
    const ppm = chemicalPpm.trim() === '' ? null : Number(chemicalPpm);
    const tote = toteLevel.trim() === '' ? null : Number(toteLevel);
    if (ppm !== null && (!Number.isFinite(ppm) || ppm < 0)) {
      showSnackBar('Enter a valid chemical PPM reading', 'error');
      return;
    }
    if (tote !== null && (!Number.isFinite(tote) || tote < 0)) {
      showSnackBar('Enter a valid tote level', 'error');
      return;
    }

    setSaving(true);
    try {
      const created = await api.post<WashTankReading>('wash-tank-readings', {
        tankNumber,
        readingDate,
        shift,
        turbidityPass: turbidity === '' ? null : turbidity === 'PASS',
        chemicalPpm: ppm,
        toteLevelGallons: tote,
        notes: notes.trim() || null,
        recordedBy: user?.id ? { id: user.id } : undefined
      });
      setReadings((current) => [created, ...current]);
      setChemicalPpm('');
      setToteLevel('');
      setNotes('');
      setTurbidity('');
      showSnackBar('Wash tank reading saved', 'success');
    } catch (error) {
      showSnackBar(api.getErrorMessage(error, 'Could not save the reading'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <View style={[styles.hero, { backgroundColor: theme.colors.chassis }]}>
        <Text style={[styles.eyebrow, { color: theme.colors.seasonal }]}>WATER QUALITY</Text>
        <Text variant="headlineSmall" style={styles.heroTitle}>Wash Tank Readings</Text>
        <Text style={{ color: theme.colors.outlineVariant }}>Record turbidity, chemical concentration, and tote levels from the floor.</Text>
      </View>

      <Card style={[styles.card, { backgroundColor: theme.colors.paper, borderColor: theme.colors.rule }]}>
        <Card.Content style={styles.form}>
          <View style={styles.sectionHeading}>
            <Text variant="titleLarge" style={styles.title}>New reading</Text>
            <Chip compact icon="water">Tank {tankNumber}</Chip>
          </View>
          <SegmentedButtons
            value={String(tankNumber)}
            onValueChange={(value) => setTankNumber(Number(value) as 1 | 2)}
            buttons={[{ value: '1', label: 'Wash Tank 1' }, { value: '2', label: 'Wash Tank 2' }]}
          />
          <TextInput mode="outlined" label="Reading date" value={readingDate} onChangeText={setReadingDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
          <Text variant="labelLarge">Shift</Text>
          <SegmentedButtons
            value={shift}
            onValueChange={(value) => setShift(value as WashTankShift)}
            buttons={(['SHIFT_1', 'SHIFT_2', 'SHIFT_3', 'SHIFT_4'] as WashTankShift[]).map((value, index) => ({ value, label: `S${index + 1}` }))}
          />
          <Text style={{ color: theme.colors.onSurfaceVariant }}>{shiftNames[shift]}</Text>
          <Text variant="labelLarge">Turbidity</Text>
          <SegmentedButtons
            value={turbidity}
            onValueChange={(value) => setTurbidity(value as 'PASS' | 'FAIL')}
            buttons={[{ value: 'PASS', label: 'Pass', icon: 'check-circle-outline' }, { value: 'FAIL', label: 'Fail', icon: 'alert-circle-outline' }]}
          />
          <View style={styles.inputRow}>
            <TextInput style={styles.flex} mode="outlined" label="Chemical PPM" value={chemicalPpm} onChangeText={setChemicalPpm} keyboardType="decimal-pad" />
            <TextInput style={styles.flex} mode="outlined" label="Tote level (gal)" value={toteLevel} onChangeText={setToteLevel} keyboardType="decimal-pad" />
          </View>
          <TextInput mode="outlined" label="Notes (optional)" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
          <Button mode="contained" icon="content-save-outline" loading={saving} disabled={saving} onPress={save} contentStyle={styles.saveButton}>Save reading</Button>
        </Card.Content>
      </Card>

      <View style={styles.sectionHeading}>
        <Text variant="titleLarge" style={styles.title}>Recent Tank {tankNumber} readings</Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>{latest.length}</Text>
      </View>
      {latest.length === 0 && !loading ? (
        <View style={[styles.empty, { borderColor: theme.colors.rule }]}><Text>No readings recorded for this tank yet.</Text></View>
      ) : latest.map((reading) => (
        <Card key={reading.id} style={[styles.readingCard, { backgroundColor: theme.colors.paper, borderColor: theme.colors.rule }]}>
          <Card.Content style={styles.readingContent}>
            <View style={styles.sectionHeading}>
              <View>
                <Text variant="titleMedium" style={styles.title}>{reading.readingDate}</Text>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>{shiftNames[reading.shift]}</Text>
              </View>
              {reading.turbidityPass != null && <Chip compact icon={reading.turbidityPass ? 'check' : 'alert'} style={{ backgroundColor: reading.turbidityPass ? '#dff2d8' : '#ffdadd' }}>{reading.turbidityPass ? 'PASS' : 'FAIL'}</Chip>}
            </View>
            <Divider />
            <View style={styles.metrics}>
              <Text style={styles.flex}><Text style={styles.metricValue}>{reading.chemicalPpm ?? '—'}</Text>{'\n'}Chemical PPM</Text>
              <Text style={styles.flex}><Text style={styles.metricValue}>{reading.toteLevelGallons ?? '—'}</Text>{'\n'}Tote gallons</Text>
            </View>
            {!!reading.notes && <Text>{reading.notes}</Text>}
            {!!reading.recordedBy && <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Recorded by {reading.recordedBy.firstName} {reading.recordedBy.lastName}</Text>}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 12, paddingBottom: 110 },
  hero: { borderRadius: 16, padding: 18, gap: 5 },
  heroTitle: { color: '#fbfcf8', fontWeight: '800' },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  card: { borderWidth: 1, borderRadius: 16, elevation: 0 },
  form: { gap: 14 },
  title: { fontWeight: '700' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  inputRow: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  saveButton: { minHeight: 50 },
  empty: { borderWidth: 1, borderRadius: 12, padding: 22 },
  readingCard: { borderWidth: 1, borderRadius: 12, elevation: 0 },
  readingContent: { gap: 10 },
  metrics: { flexDirection: 'row', gap: 12 },
  metricValue: { fontSize: 20, fontWeight: '800' }
});
