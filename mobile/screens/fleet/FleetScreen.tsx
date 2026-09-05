/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Card, FAB, Searchbar, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Vehicle from '../../models/vehicle';
import useAuth from '../../hooks/useAuth';
import { PermissionEntity } from '../../models/role';
import { useAppTheme } from '../../custom-theme';

export default function FleetScreen({ navigation }: any) {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { hasCreatePermission } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setVehicles(await api.get<Vehicle[]>('fleet/vehicles'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => void load(), [load]));
  const shown = vehicles.filter((vehicle) =>
    [vehicle.name, vehicle.assetNumber, vehicle.licensePlate, vehicle.vin]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder={t('search_fleet')}
        value={query}
        onChangeText={setQuery}
        style={{ backgroundColor: theme.colors.paperMuted }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {shown.map((vehicle) => (
          <Card key={vehicle.id} style={[styles.card, { backgroundColor: theme.colors.paper, borderColor: theme.colors.rule }]}>
            <Card.Content>
              <View style={styles.cardTop}>
                <Text variant="titleMedium" style={styles.title}>{vehicle.name}</Text>
                <Text variant="labelMedium" style={{ color: theme.colors.primary }}>{t(vehicle.status)}</Text>
              </View>
              {!![vehicle.year, vehicle.make, vehicle.model].filter(Boolean).length && (
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')}
                </Text>
              )}
              {!!vehicle.licensePlate && <Text>{t('license_plate')}: {vehicle.licensePlate}</Text>}
              {!!vehicle.assetNumber && <Text>{t('asset_number')}: {vehicle.assetNumber}</Text>}
            </Card.Content>
            <Card.Actions>
                <Button icon="speedometer" onPress={() => navigation.navigate('LogVehicleUsage', { vehicle })}>
                  {t('log_usage')}
                </Button>
              {!!vehicle.asset && (
                <Button icon="clipboard-plus-outline" onPress={() => navigation.navigate('AddWorkOrder', { asset: vehicle.asset })}>
                  {t('work_order')}
                </Button>
              )}
            </Card.Actions>
          </Card>
        ))}
        {!loading && !shown.length && (
          <View style={[styles.empty, { backgroundColor: theme.colors.paper }]}>
            <Text variant="titleMedium">{t('no_vehicles')}</Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('no_vehicles_hint')}</Text>
          </View>
        )}
      </ScrollView>
      {hasCreatePermission(PermissionEntity.FLEET) && (
        <FAB icon="plus" label={t('add_vehicle')} style={[styles.fab, { backgroundColor: theme.colors.primary }]} color={theme.colors.paper} onPress={() => navigation.navigate('AddVehicle')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 8 },
  content: { gap: 10, paddingTop: 8, paddingBottom: 112 },
  card: { borderWidth: 1, borderRadius: 12, elevation: 0 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontWeight: '700' },
  empty: { padding: 24, borderRadius: 12, gap: 6 },
  fab: { position: 'absolute', right: 18, bottom: 96, borderRadius: 8 }
});
