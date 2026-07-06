import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  HelperText,
  Switch,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '../../store';
import { updateInspection } from '../../slices/inspection';
import { Inspection, InspectionItemResult, InspectionStatus } from '../../models/inspection';
import { RootStackScreenProps } from '../../types';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';

const statusColors: Record<InspectionStatus, string> = {
  PENDING: '#FFA319',
  IN_PROGRESS: '#52b788',
  COMPLETED: '#57CA22',
  FAILED: '#FF1943'
};

export default function InspectionDetailsScreen({
  navigation,
  route
}: RootStackScreenProps<'InspectionDetails'>) {
  const { id, inspectionProp } = route.params;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { currentInspection } = useSelector((s) => s.inspections);
  const inspection: Inspection = currentInspection?.id === id ? currentInspection : inspectionProp;
  const [results, setResults] = useState<InspectionItemResult[]>(inspection?.results ?? []);
  const [notes, setNotes] = useState(inspection?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const isCompleted = inspection?.status === 'COMPLETED' || inspection?.status === 'FAILED';

  useEffect(() => {
    navigation.setOptions({ title: inspection?.template?.name ?? t('inspection') });
    if (inspection?.results) setResults(inspection.results);
  }, [inspection]);

  const getResultForItem = (itemId: number) =>
    results.find((r) => r.item.id === itemId);

  const updateResult = (itemId: number, patch: Partial<InspectionItemResult>) => {
    setResults((prev) => {
      const existing = prev.find((r) => r.item.id === itemId);
      if (existing) {
        return prev.map((r) => (r.item.id === itemId ? { ...r, ...patch } : r));
      }
      const item = inspection.template.items.find((i) => i.id === itemId)!;
      return [...prev, { item, ...patch }];
    });
  };

  const handleSave = (status: InspectionStatus) => {
    setSaving(true);
    dispatch(updateInspection(id, { results, notes, status }))
      .then(() => {
        showSnackBar(t('inspection_saved'), 'success');
        navigation.goBack();
      })
      .catch(() => showSnackBar(t('error_save'), 'error'))
      .finally(() => setSaving(false));
  };

  if (!inspection) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Card style={{ margin: 8 }}>
        <Card.Content>
          <View style={styles.row}>
            <Text variant="titleMedium">{t('status')}:</Text>
            <Chip
              style={{ backgroundColor: statusColors[inspection.status] + '33' }}
              textStyle={{ color: statusColors[inspection.status] }}
            >
              {t(inspection.status)}
            </Chip>
          </View>
          {inspection.asset && (
            <Text variant="bodyMedium" style={{ marginTop: 4 }}>
              {t('asset')}: {inspection.asset.name}
            </Text>
          )}
          {inspection.dueDate && (
            <Text variant="bodySmall" style={{ opacity: 0.6, marginTop: 2 }}>
              {t('due')}: {new Date(inspection.dueDate).toLocaleDateString()}
            </Text>
          )}
        </Card.Content>
      </Card>

      {inspection.template.items
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((item) => {
          const result = getResultForItem(item.id);
          return (
            <Card key={item.id} style={{ margin: 8 }}>
              <Card.Content>
                <Text variant="titleSmall">
                  {item.label}{item.required ? ' *' : ''}
                </Text>
                {item.description && (
                  <Text variant="bodySmall" style={{ opacity: 0.6 }}>{item.description}</Text>
                )}
                <Divider style={{ marginVertical: 8 }} />

                {item.itemType === 'PASS_FAIL' && (
                  <View style={styles.row}>
                    <Button
                      mode={result?.passed === true ? 'contained' : 'outlined'}
                      onPress={() => !isCompleted && updateResult(item.id, { passed: true })}
                      buttonColor={result?.passed === true ? '#57CA22' : undefined}
                      style={{ marginRight: 8 }}
                    >
                      {t('pass')}
                    </Button>
                    <Button
                      mode={result?.passed === false ? 'contained' : 'outlined'}
                      onPress={() => !isCompleted && updateResult(item.id, { passed: false })}
                      buttonColor={result?.passed === false ? '#FF1943' : undefined}
                    >
                      {t('fail')}
                    </Button>
                  </View>
                )}

                {item.itemType === 'CHECKBOX' && (
                  <View style={styles.row}>
                    <Checkbox
                      status={result?.value === 'true' ? 'checked' : 'unchecked'}
                      onPress={() => !isCompleted && updateResult(item.id, { value: result?.value === 'true' ? 'false' : 'true' })}
                    />
                    <Text>{result?.value === 'true' ? t('checked') : t('unchecked')}</Text>
                  </View>
                )}

                {(item.itemType === 'TEXT' || item.itemType === 'NUMBER' || item.itemType === 'DATE') && (
                  <TextInput
                    mode="outlined"
                    value={result?.value ?? ''}
                    onChangeText={(v) => !isCompleted && updateResult(item.id, { value: v })}
                    keyboardType={item.itemType === 'NUMBER' ? 'numeric' : 'default'}
                    placeholder={item.itemType === 'DATE' ? 'YYYY-MM-DD' : ''}
                    disabled={isCompleted}
                  />
                )}

                <TextInput
                  mode="outlined"
                  label={t('notes')}
                  value={result?.notes ?? ''}
                  onChangeText={(v) => !isCompleted && updateResult(item.id, { notes: v })}
                  style={{ marginTop: 8 }}
                  disabled={isCompleted}
                  multiline
                />
              </Card.Content>
            </Card>
          );
        })}

      <Card style={{ margin: 8 }}>
        <Card.Content>
          <TextInput
            mode="outlined"
            label={t('general_notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            disabled={isCompleted}
          />
        </Card.Content>
      </Card>

      {!isCompleted && (
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => handleSave('IN_PROGRESS')}
            loading={saving}
            disabled={saving}
            style={{ marginRight: 8, flex: 1 }}
          >
            {t('save_progress')}
          </Button>
          <Button
            mode="contained"
            onPress={() => handleSave('COMPLETED')}
            loading={saving}
            disabled={saving}
            buttonColor="#57CA22"
            style={{ flex: 1 }}
          >
            {t('complete')}
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  actions: { flexDirection: 'row', margin: 16, marginTop: 8 }
});
