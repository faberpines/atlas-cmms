import * as React from 'react';
import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '../../../store';
import { getInspectionsByAsset } from '../../../slices/inspection';
import { AssetDTO } from '../../../models/asset';
import { InspectionStatus } from '../../../models/inspection';

const statusColors: Record<InspectionStatus, string> = {
  PENDING: '#FFA319',
  IN_PROGRESS: '#52b788',
  COMPLETED: '#57CA22',
  FAILED: '#FF1943'
};

interface Props {
  asset: AssetDTO;
  navigation: any;
}

export default function AssetInspections({ asset, navigation }: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { inspectionsByAsset, loadingGet } = useSelector((s) => s.inspections);
  const inspections = inspectionsByAsset[asset?.id] ?? [];

  useEffect(() => {
    if (asset?.id) dispatch(getInspectionsByAsset(asset.id));
  }, [asset?.id]);

  if (loadingGet) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {inspections.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 40, opacity: 0.5 }}>
          {t('no_inspections')}
        </Text>
      )}
      {inspections.map((item) => (
        <Card
          key={item.id}
          style={{ margin: 8 }}
          onPress={() => navigation.navigate('InspectionDetails', { id: item.id, inspectionProp: item })}
        >
          <Card.Title
            title={item.template?.name ?? t('inspection')}
            subtitle={item.completedAt ? new Date(item.completedAt).toLocaleDateString() : item.dueDate ? `${t('due')}: ${new Date(item.dueDate).toLocaleDateString()}` : ''}
          />
          <Card.Content>
            <Chip
              style={{ alignSelf: 'flex-start', backgroundColor: statusColors[item.status] + '33' }}
              textStyle={{ color: statusColors[item.status] }}
            >
              {t(item.status)}
            </Chip>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}
