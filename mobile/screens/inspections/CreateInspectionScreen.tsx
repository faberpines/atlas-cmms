import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  HelperText,
  List,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '../../store';
import { createInspection, getTemplates } from '../../slices/inspection';
import { getAssetsMini } from '../../slices/asset';
import { RootStackScreenProps } from '../../types';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { InspectionTemplate } from '../../models/inspection';
import { AssetMiniDTO } from '../../models/asset';

export default function CreateInspectionScreen({
  navigation,
  route
}: RootStackScreenProps<'CreateInspection'>) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { templates } = useSelector((s) => s.inspections);
  const { assetsMini } = useSelector((s) => s.assets);
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetMiniDTO | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ template?: string; asset?: string }>({});

  useEffect(() => {
    dispatch(getTemplates());
    dispatch(getAssetsMini());
  }, []);

  useEffect(() => {
    if (route.params?.assetId && assetsMini.length) {
      const found = assetsMini.find((a) => a.id === route.params.assetId);
      if (found) setSelectedAsset(found);
    }
  }, [assetsMini]);

  const validate = () => {
    const e: typeof errors = {};
    if (!selectedTemplate) e.template = t('required');
    if (!selectedAsset) e.asset = t('asset_required');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    setSaving(true);
    dispatch(createInspection({
      template: { id: selectedTemplate!.id } as any,
      asset: { id: selectedAsset!.id } as any,
      dueDate: dueDate || undefined,
      notes: notes || undefined,
      status: 'PENDING'
    }))
      .then((inspection: any) => {
        showSnackBar(t('inspection_created'), 'success');
        navigation.replace('InspectionDetails', { id: inspection.id, inspectionProp: inspection });
      })
      .catch(() => showSnackBar(t('error_create'), 'error'))
      .finally(() => setSaving(false));
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Card style={{ margin: 8 }}>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 4 }}>
            {t('inspection_template')} *
          </Text>
          <List.Item
            title={selectedTemplate?.name ?? t('select_template')}
            description={selectedTemplate?.category}
            left={(p) => <List.Icon {...p} icon="clipboard-list-outline" />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() =>
              navigation.navigate('SelectInspectionTemplate', {
                onChange: (tpl: InspectionTemplate) => {
                  setSelectedTemplate(tpl);
                  setErrors((e) => ({ ...e, template: undefined }));
                }
              })
            }
            style={{
              borderWidth: 1,
              borderColor: errors.template ? theme.colors.error : theme.colors.secondary,
              borderRadius: 4
            }}
          />
          {errors.template && <HelperText type="error">{errors.template}</HelperText>}

          <Text variant="titleMedium" style={{ marginTop: 16, marginBottom: 4 }}>
            {t('asset')} *
          </Text>
          <List.Item
            title={selectedAsset?.name ?? t('select_asset')}
            left={(p) => <List.Icon {...p} icon="package-variant-closed" />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() =>
              navigation.navigate('SelectAssets', {
                onChange: (assets: any[]) => {
                  if (assets && assets.length > 0) {
                    setSelectedAsset(assets[0]);
                    setErrors((e) => ({ ...e, asset: undefined }));
                  }
                },
                selected: selectedAsset ? [selectedAsset.id] : [],
                multiple: false,
                locationId: null
              })
            }
            style={{
              borderWidth: 1,
              borderColor: errors.asset ? theme.colors.error : theme.colors.secondary,
              borderRadius: 4
            }}
          />
          {errors.asset && <HelperText type="error">{errors.asset}</HelperText>}

          <TextInput
            mode="outlined"
            label={t('due_date') + ' (YYYY-MM-DD)'}
            value={dueDate}
            onChangeText={setDueDate}
            style={{ marginTop: 16 }}
          />

          <TextInput
            mode="outlined"
            label={t('notes')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ marginTop: 12 }}
          />
        </Card.Content>
      </Card>

      <View style={{ margin: 16 }}>
        <Button
          mode="contained"
          onPress={handleCreate}
          loading={saving}
          disabled={saving}
        >
          {t('create_inspection')}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
