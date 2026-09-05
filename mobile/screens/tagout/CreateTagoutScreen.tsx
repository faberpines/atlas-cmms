import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, SegmentedButtons, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { EnergyType } from '../../models/loto';
import { useAppTheme } from '../../custom-theme';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';

export default function CreateTagoutScreen({ navigation }: any) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { showSnackBar } = React.useContext(CustomSnackBarContext);
  const [saving, setSaving] = useState(false);
  const [energyType, setEnergyType] = useState<EnergyType>('ELECTRICAL');
  const [form, setForm] = useState({ title: '', isolationPoint: '', reason: '', procedure: '', notes: '' });
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!form.title.trim() || !form.isolationPoint.trim()) return showSnackBar(t('tagout_required'), 'error');
    setSaving(true);
    try {
      await api.post('loto', { ...form, energyType, status: 'ACTIVE' });
      showSnackBar(t('tagout_created'), 'success');
      navigation.goBack();
    } catch (error) {
      showSnackBar(t('tagout_create_failure'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <TextInput label={t('tagout_title')} value={form.title} onChangeText={(v) => set('title', v)} mode="outlined" />
        <TextInput label={t('isolation_point')} value={form.isolationPoint} onChangeText={(v) => set('isolationPoint', v)} mode="outlined" />
        <SegmentedButtons value={energyType} onValueChange={(value) => setEnergyType(value as EnergyType)} buttons={[
          { value: 'ELECTRICAL', label: t('electrical_short') },
          { value: 'HYDRAULIC', label: t('hydraulic_short') },
          { value: 'MECHANICAL', label: t('mechanical_short') }
        ]} />
        <TextInput label={t('reason')} value={form.reason} onChangeText={(v) => set('reason', v)} mode="outlined" multiline numberOfLines={3} />
        <TextInput label={t('isolation_procedure')} value={form.procedure} onChangeText={(v) => set('procedure', v)} mode="outlined" multiline numberOfLines={5} />
        <TextInput label={t('notes')} value={form.notes} onChangeText={(v) => set('notes', v)} mode="outlined" multiline numberOfLines={3} />
        <Button mode="contained" onPress={save} loading={saving} disabled={saving} contentStyle={styles.button}>{t('add_tagout')}</Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({ form: { padding: 16, gap: 12, paddingBottom: 40 }, button: { minHeight: 48 } });
