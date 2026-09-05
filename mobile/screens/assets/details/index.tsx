import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';

import { View } from '../../../components/Themed';
import { RootStackScreenProps } from '../../../types';
import { useDispatch, useSelector } from '../../../store';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  IconButton,
  Portal,
  Text
} from 'react-native-paper';
import { SheetManager } from 'react-native-actions-sheet';
import { deleteAsset, getAssetDetails } from '../../../slices/asset';
import LoadingDialog from '../../../components/LoadingDialog';
import AssetDetails from './AssetDetails';
import { TabBar, TabView } from 'react-native-tab-view';
import AssetWorkOrders from './AssetWorkOrders';
import AssetFiles from './AssetFiles';
import AssetParts from './AssetParts';
import AssetInspections from './AssetInspections';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import useAuth from '../../../hooks/useAuth';
import { PermissionEntity } from '../../../models/role';
import { useAppTheme } from '../../../custom-theme';

export default function AssetDetailsHome({
                                           navigation,
                                           route
                                         }: RootStackScreenProps<'AssetDetails'>) {
  const { id, assetProp } = route.params;

  const { t } = useTranslation();
  const { assetInfos, loadingGet } = useSelector((state) => state.assets);
  const asset = assetInfos[id]?.asset ?? assetProp;
  const dispatch = useDispatch();
  const theme = useAppTheme();
  const layout = useWindowDimensions();
  const [tabIndex, setTabIndex] = useState(0);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { hasCreatePermission } = useAuth();
  const [tabs] = useState([
    { key: 'details', title: t('details') },
    { key: 'work-orders', title: t('work_orders') },
    { key: 'files', title: t('files') },
    { key: 'parts', title: t('parts') },
    { key: 'inspections', title: t('inspections') }
  ]);
  const renderScene = ({ route, jumpTo }) => {
    switch (route.key) {
      case 'details':
        return <AssetDetails asset={asset} navigation={navigation} />;
      case 'work-orders':
        return <AssetWorkOrders asset={asset} navigation={navigation} />;
      case 'files':
        return <AssetFiles asset={asset} />;
      case 'parts':
        return <AssetParts asset={asset} navigation={navigation} />;
      case 'inspections':
        return <AssetInspections asset={asset} navigation={navigation} />;
    }
  };
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      scrollEnabled
      indicatorStyle={{ backgroundColor: theme.colors.seasonal, height: 3 }}
      style={{ backgroundColor: theme.colors.chassisRaised }}
      activeColor={theme.colors.paper}
      inactiveColor={theme.colors.outline}
    />
  );

  useEffect(() => {
    if (!assetProp)
      dispatch(getAssetDetails(id));
  }, [assetProp]);
  useEffect(() => {
    navigation.setOptions({
      title: asset?.name ?? t('loading'),
      headerRight: () => (
        <View style={styles.headerActions}>
          {hasCreatePermission(PermissionEntity.WORK_ORDERS) && (
            <IconButton
              icon="clipboard-plus-outline"
              iconColor={theme.colors.onPrimary}
              accessibilityLabel={t('create_work_order')}
              onPress={() => navigation.push('AddWorkOrder', { asset })}
            />
          )}
          <Pressable
            onPress={() => {
              SheetManager.show('asset-details-sheet', {
                payload: {
                  onEdit: () => navigation.navigate('EditAsset', { asset }),
                  onDelete: () => setOpenDelete(true),
                  onCreateWorkOrder: () =>
                    navigation.push('AddWorkOrder', { asset }),
                  onCreateChildAsset: () =>
                    navigation.push('AddAsset', { parentAsset: asset }),
                  asset
                }
              });
            }}
          >
            <IconButton
              icon="dots-vertical"
              iconColor={theme.colors.onPrimary}
              accessibilityLabel={t('more')}
            />
          </Pressable>
        </View>
      )
    });
  }, [asset]);

  const onDeleteSuccess = () => {
    showSnackBar(t('asset_remove_success'), 'success');
    navigation.goBack();
  };
  const onDeleteFailure = (err) =>
    showSnackBar(t('asset_remove_failure'), 'error');

  const handleDelete = () => {
    dispatch(deleteAsset(asset?.id))
      .then(onDeleteSuccess)
      .catch(onDeleteFailure);
    setOpenDelete(false);
  };
  const renderConfirmDelete = () => {
    return (
      <Portal>
        <Dialog visible={openDelete} onDismiss={() => setOpenDelete(false)}>
          <Dialog.Title>{t('confirmation')}</Dialog.Title>
          <Dialog.Content>
            <Text variant='bodyMedium'>{t('confirm_delete_asset')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpenDelete(false)}>{t('cancel')}</Button>
            <Button onPress={handleDelete}>{t('to_delete')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };
  if (asset)
    return (
      <View style={styles.container}>
        {renderConfirmDelete()}
        <TabView
          renderTabBar={renderTabBar}
          navigationState={{ index: tabIndex, routes: tabs }}
          renderScene={renderScene}
          onIndexChange={setTabIndex}
          initialLayout={{ width: layout.width }}
        />
      </View>
    );
  else return <LoadingDialog visible={true} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent'
  }
});
