import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Image
} from 'react-native';
import { useDispatch, useSelector } from '../../store';
import * as React from 'react';
import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import { getAssetChildren, getAssets, getMoreAssets } from '../../slices/asset';
import { FilterField, SearchCriteria } from '../../models/page';
import {
  Button,
  Card,
  FAB,
  Searchbar,
  SegmentedButtons,
  Text
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import {
  AssetDTO,
  AssetRow,
  EquipmentType,
  assetStatuses,
  getAssetStatusConfig
} from '../../models/asset';
import { isCloseToBottom, onSearchQueryChange } from '../../utils/overall';
import { RootStackScreenProps } from '../../types';
import Tag from '../../components/Tag';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { IconWithLabel } from '../../components/IconWithLabel';
import { Asset } from 'expo-asset';
import { useAppTheme } from '../../custom-theme';

const AssetCard = ({
  asset,
  navigation,
  showChildrenButton = false,
  onViewChildren
}: {
  asset: AssetDTO;
  navigation: RootStackScreenProps<'Assets'>['navigation'];
  showChildrenButton?: boolean;
  onViewChildren?: () => void;
}) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { hasCreatePermission } = useAuth();

  return (
    <Card
      style={{
        marginVertical: 6,
        backgroundColor: theme.colors.paper,
        borderColor: theme.colors.rule,
        borderWidth: 1
      }}
      key={asset.id}
      onPress={() =>
        navigation.push('AssetDetails', {
          id: asset.id,
          assetProp: asset
        })
      }
    >
      <Card.Content>
        <View style={{ ...styles.row, justifyContent: 'flex-end' }}>
          <View style={styles.row}>
            <Tag
              text={t(asset?.status)}
              backgroundColor={getAssetStatusConfig(asset?.status).color(theme)}
              color={theme.colors.paper}
            />
          </View>
        </View>
        <View style={{ ...styles.row, marginTop: 5 }}>
          <Image
            style={{ height: 70, width: 70, borderRadius: 35, marginRight: 10 }}
            source={
              asset.image
                ? {
                    uri: asset.image.url
                  }
                : require('../../assets/images/no-image.png')
            }
          />
          <Text
            variant="titleMedium"
            style={{
              color: theme.colors.onSurface,
              fontWeight: '700',
              flex: 1
            }}
          >
            {asset.name}
          </Text>
        </View>
        <View style={{ marginBottom: 10 }}>
          {!!asset.barCode && (
            <IconWithLabel
              label={`${t('barcode')}: ${asset.barCode}`}
              icon="barcode-scan"
            />
          )}
          {asset.location && (
            <IconWithLabel
              label={asset.location.name}
              icon="map-marker-outline"
            />
          )}
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        {showChildrenButton && asset.hasChildren && (
          <Button onPress={onViewChildren}>{t('view_children')}</Button>
        )}
        {hasCreatePermission(PermissionEntity.WORK_ORDERS) && (
          <Button
            mode="contained-tonal"
            icon="clipboard-plus-outline"
            onPress={() => navigation.push('AddWorkOrder', { asset })}
          >
            {t('work_order')}
          </Button>
        )}
      </Card.Actions>
    </Card>
  );
};

export default function AssetsScreen({
  navigation,
  route
}: RootStackScreenProps<'Assets'>) {
  const { t } = useTranslation();
  const [startedSearch, setStartedSearch] = useState<boolean>(false);
  const { assets, assetsHierarchy, loadingGet, currentPageNum, lastPage } =
    useSelector((state) => state.assets);
  const theme = useAppTheme();
  const [equipmentType, setEquipmentType] = useState<EquipmentType>(
    'WAREHOUSE_EQUIPMENT'
  );
  const [view, setView] = useState<'hierarchy' | 'list'>('hierarchy');
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const { hasViewPermission, hasCreatePermission } = useAuth();
  const defaultFilterFields: FilterField[] = [
    { field: 'equipmentType', operation: 'eq', value: equipmentType }
  ];
  const getCriteriaFromFilterFields = (filterFields: FilterField[]) => {
    const initialCriteria: SearchCriteria = {
      filterFields: defaultFilterFields,
      pageSize: 10,
      pageNum: 0,
      direction: 'DESC'
    };
    let newFilterFields = [...initialCriteria.filterFields];
    filterFields.forEach(
      (filterField) =>
        (newFilterFields = newFilterFields.filter(
          (ff) => ff.field != filterField.field
        ))
    );
    return {
      ...initialCriteria,
      filterFields: [...newFilterFields, ...filterFields]
    };
  };
  const [criteria, setCriteria] = useState<SearchCriteria>(
    getCriteriaFromFilterFields([])
  );
  useEffect(() => {
    if (hasViewPermission(PermissionEntity.ASSETS) && view === 'list') {
      dispatch(
        getAssets({ ...criteria, pageSize: 10, pageNum: 0, direction: 'DESC' })
      );
    }
  }, [criteria]);
  useEffect(() => {
    setCriteria(getCriteriaFromFilterFields([]));
  }, [equipmentType]);
  const [currentAssets, setCurrentAssets] = useState<AssetRow[]>([]);
  useEffect(() => {
    if (
      route.params?.id &&
      assetsHierarchy.some(
        (asset) =>
          asset.hierarchy.includes(route.params.id) &&
          asset.id !== route.params.id
      )
    ) {
      return;
    }
    dispatch(
      getAssetChildren(route.params?.id ?? 0, route.params?.hierarchy ?? [])
    );
  }, [route]);

  const onRefresh = () => {
    setCriteria(getCriteriaFromFilterFields([]));
  };

  const onQueryChange = (query) => {
    onSearchQueryChange<AssetDTO>(
      query,
      criteria,
      setCriteria,
      setSearchQuery,
      ['name', 'barCode', 'model', 'description', 'additionalInfos']
    );
    setView('list');
  };
  useDebouncedEffect(
    () => {
      if (startedSearch) onQueryChange(searchQuery);
    },
    [searchQuery],
    1000
  );

  useEffect(() => {
    let result = [];
    if (route.params?.id) {
      result = assetsHierarchy.filter((asset, index) => {
        return (
          asset.hierarchy[asset.hierarchy.length - 2] === route.params.id &&
          asset.id !== route.params.id &&
          asset.equipmentType === equipmentType
        );
      });
    } else
      result = assetsHierarchy.filter(
        (asset) =>
          asset.hierarchy.length === 1 && asset.equipmentType === equipmentType
      );
    setCurrentAssets(result);
  }, [assetsHierarchy, equipmentType]);

  const handleViewChildren = (asset) => {
    navigation.push('Assets', {
      id: asset.id,
      hierarchy: asset.hierarchy
    });
  };

  return (
    <View
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <Searchbar
        placeholder={t('search')}
        onFocus={() => setStartedSearch(true)}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ backgroundColor: theme.colors.paperMuted }}
      />
      <SegmentedButtons
        value={equipmentType}
        onValueChange={(value) => setEquipmentType(value as EquipmentType)}
        buttons={[
          {
            value: 'WAREHOUSE_EQUIPMENT',
            label: t('warehouse_short'),
            icon: 'warehouse'
          },
          { value: 'TRAILER', label: t('trailers'), icon: 'truck-trailer' },
          {
            value: 'FARM_IMPLEMENT',
            label: t('farm_short'),
            icon: 'tractor'
          }
        ]}
        style={styles.sections}
      />
      {view === 'list' ? (
        <ScrollView
          style={styles.scrollView}
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              if (!loadingGet && !lastPage)
                dispatch(getMoreAssets(criteria, currentPageNum + 1));
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={loadingGet}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          scrollEventThrottle={400}
        >
          {!!assets.content.length ? (
            assets.content.map((asset) => (
              <AssetCard key={asset.id} asset={asset} navigation={navigation} />
            ))
          ) : loadingGet ? null : (
            <View
              style={{
                backgroundColor: theme.colors.paper,
                padding: 20,
                borderRadius: 10
              }}
            >
              <Text variant={'titleLarge'}>
                {t('no_element_match_criteria')}
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={loadingGet}
              colors={[theme.colors.primary]}
            />
          }
        >
          {!!currentAssets.length &&
            currentAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                navigation={navigation}
                showChildrenButton={true}
                onViewChildren={() => handleViewChildren(asset)}
              />
            ))}
        </ScrollView>
      )}
      {hasCreatePermission(PermissionEntity.ASSETS) && (
        <FAB
          icon="plus"
          label={t('create')}
          color={theme.colors.paper}
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('AddAsset', { equipmentType })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  scrollView: {
    width: '100%',
    height: '100%',
    padding: 5
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  sections: { marginHorizontal: 6, marginTop: 10 },
  cardActions: {
    minHeight: 52,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 10
  },
  fab: { position: 'absolute', right: 18, bottom: 96, borderRadius: 8 }
});
