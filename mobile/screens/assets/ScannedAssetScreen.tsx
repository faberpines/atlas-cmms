/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import { useAppTheme } from '../../custom-theme';

export default function ScannedAssetScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { user, hasCreatePermission, hasViewPermission } = useAuth();
  const asset = route.params.asset;
  const isRequester = user.role.code === 'REQUESTER';

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <Card style={[styles.card, { backgroundColor: theme.colors.paper, borderColor: theme.colors.rule }]}>
        <Card.Content style={styles.cardContent}>
          <Image style={styles.image} source={asset.image?.url ? { uri: asset.image.url } : require('../../assets/images/no-image.png')} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="headlineSmall" style={{ fontWeight: '700' }}>{asset.name}</Text>
            {!!asset.barCode && <Text>{t('barcode')}: {asset.barCode}</Text>}
            {!!asset.serialNumber && <Text>{t('serial_number')}: {asset.serialNumber}</Text>}
            {!!asset.location && <Text>{t('location')}: {asset.location.name}</Text>}
            {!!asset.status && <Text style={{ color: theme.colors.primary }}>{t(asset.status)}</Text>}
          </View>
        </Card.Content>
      </Card>
      <View style={styles.actions}>
        {isRequester ? (
          <Button mode="contained" icon="inbox-arrow-down-outline" onPress={() => navigation.navigate('AddRequest', { asset })} contentStyle={styles.button}>
            {t('submit_request_for_asset')}
          </Button>
        ) : hasCreatePermission(PermissionEntity.WORK_ORDERS) ? (
          <Button mode="contained" icon="clipboard-plus-outline" onPress={() => navigation.navigate('AddWorkOrder', { asset })} contentStyle={styles.button}>
            {t('create_work_order_for_asset')}
          </Button>
        ) : null}
        {hasViewPermission(PermissionEntity.ASSETS) && (
          <Button mode="outlined" icon="information-outline" onPress={() => navigation.replace('AssetDetails', { id: asset.id, assetProp: asset })} contentStyle={styles.button}>
            {t('view_asset_details')}
          </Button>
        )}
        <Button mode="text" icon="barcode-scan" onPress={() => navigation.replace('ScanAsset')}>{t('scan_another_asset')}</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  card: { borderWidth: 1, borderRadius: 12, elevation: 0 },
  cardContent: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  image: { width: 88, height: 88, borderRadius: 10 },
  actions: { gap: 10 },
  button: { minHeight: 48 }
});
