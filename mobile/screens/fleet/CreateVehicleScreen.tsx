import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import { useAppTheme } from '../../custom-theme';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';

export default function CreateVehicleScreen({ navigation }: any) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { showSnackBar } = React.useContext(CustomSnackBarContext);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', assetNumber: '', vin: '', make: '', model: '', year: '', licensePlate: '', mileage: '', notes: '' });
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!form.name.trim()) return showSnackBar(t('required_vehicle_name'), 'error');
    setSaving(true);
    try {
      await api.post('fleet/vehicles', {
        ...form,
        name: form.name.trim(),
        year: form.year ? Number(form.year) : null,
        mileage: form.mileage ? Number(form.mileage) : null,
        status: 'ACTIVE',
        fuelType: 'GASOLINE',
        usageUnit: 'MILES'
      });
      showSnackBar(t('vehicle_created'), 'success');
      navigation.goBack();
    } catch (error) {
      showSnackBar(t('vehicle_create_failure'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <TextInput label={t('vehicle_name')} value={form.name} onChangeText={(v) => set('name', v)} mode="outlined" />
        <TextInput label={t('asset_number')} value={form.assetNumber} onChangeText={(v) => set('assetNumber', v)} mode="outlined" />
        <TextInput label="VIN" value={form.vin} onChangeText={(v) => set('vin', v)} mode="outlined" autoCapitalize="characters" />
        <TextInput label={t('make')} value={form.make} onChangeText={(v) => set('make', v)} mode="outlined" />
        <TextInput label={t('model')} value={form.model} onChangeText={(v) => set('model', v)} mode="outlined" />
        <TextInput label={t('year')} value={form.year} onChangeText={(v) => set('year', v)} mode="outlined" keyboardType="number-pad" />
        <TextInput label={t('license_plate')} value={form.licensePlate} onChangeText={(v) => set('licensePlate', v)} mode="outlined" autoCapitalize="characters" />
        <TextInput label={t('mileage')} value={form.mileage} onChangeText={(v) => set('mileage', v)} mode="outlined" keyboardType="number-pad" />
        <TextInput label={t('notes')} value={form.notes} onChangeText={(v) => set('notes', v)} mode="outlined" multiline numberOfLines={4} />
        <Button mode="contained" onPress={save} loading={saving} disabled={saving} contentStyle={styles.button}>{t('add_vehicle')}</Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({ form: { padding: 16, gap: 12, paddingBottom: 40 }, button: { minHeight: 48 } });
