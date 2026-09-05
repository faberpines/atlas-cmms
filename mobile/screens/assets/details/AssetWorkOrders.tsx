import * as React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from '../../../store';
import { useTranslation } from 'react-i18next';
import { AssetDTO } from '../../../models/asset';
import { getAssetWorkOrders } from '../../../slices/asset';
import {
  RefreshControl,
  ScrollView,
  StyleSheet
} from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { View } from '../../../components/Themed';
import Tag from '../../../components/Tag';
import { getStatusColor } from '../../../utils/overall';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/role';

export default function AssetWorkOrders({
                                          asset,
                                          navigation
                                        }: {
  asset: AssetDTO;
  navigation: any;
}) {
  const { t }: { t: any } = useTranslation();
  const { assetInfos, loadingWorkOrders } = useSelector(
    (state) => state.assets
  );
  const workOrders = assetInfos[asset?.id]?.workOrders ?? [];
  const dispatch = useDispatch();
  const theme = useTheme();
  const { hasCreatePermission } = useAuth();

  useEffect(() => {
    if (asset) dispatch(getAssetWorkOrders(asset.id));
  }, [asset]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (asset) dispatch(getAssetWorkOrders(asset.id));
    });
    return unsubscribe;
  }, [asset, navigation]);

  return (
    <ScrollView
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
      refreshControl={
        <RefreshControl
          refreshing={loadingWorkOrders}
          colors={[theme.colors.primary]}
          onRefresh={() => dispatch(getAssetWorkOrders(asset.id))}
        />
      }
    >
      {workOrders.map((workOrder) => (
        <Card
          key={workOrder.id}
          style={styles.workOrderCard}
          onPress={() => navigation.push('WODetails', { id: workOrder.id })}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Text style={{ fontWeight: 'bold', marginRight: 5, flexShrink: 1 }}>
              {workOrder.title}
            </Text>
            <Tag
              text={t(workOrder.status)}
              color='white'
              backgroundColor={getStatusColor(workOrder.status, theme)}
            />
          </View>
        </Card>
      ))}
      {!loadingWorkOrders && workOrders.length === 0 && (
        <View style={styles.emptyState}>
          <Text variant={'titleLarge'} style={styles.emptyTitle}>
            {t('no_wo_linked_asset')}
          </Text>
          {hasCreatePermission(PermissionEntity.WORK_ORDERS) && (
            <Button
              mode="contained"
              icon="clipboard-plus-outline"
              onPress={() => navigation.push('AddWorkOrder', { asset })}
            >
              {t('create_work_order')}
            </Button>
          )}
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12
  },
  workOrderCard: {
    marginBottom: 8,
    borderRadius: 12
  },
  emptyState: {
    padding: 24,
    gap: 16,
    alignItems: 'flex-start'
  },
  emptyTitle: {
    fontWeight: '700'
  }
});
