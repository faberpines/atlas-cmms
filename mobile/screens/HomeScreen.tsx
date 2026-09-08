/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
import * as React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { RootTabScreenProps } from '../types';
import useAuth from '../hooks/useAuth';
import { PermissionEntity } from '../models/role';
import { useAppTheme } from '../custom-theme';

type Destination = {
  title: string;
  eyebrow: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress: () => void;
  visible: boolean;
  featured?: boolean;
};

export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const { hasViewPermission, user } = useAuth();
  const isRequester = user.role.code === 'REQUESTER';

  const destinations: Destination[] = isRequester
    ? [
        {
          title: t('scan'),
          eyebrow: 'FIND EQUIPMENT',
          icon: 'barcode-scan',
          onPress: () => navigation.navigate('Scan'),
          visible: true,
          featured: true
        },
        {
          title: t('requests'),
          eyebrow: 'MY REQUESTS',
          icon: 'clipboard-text-outline',
          onPress: () => navigation.navigate('Requests'),
          visible: true
        }
      ]
    : [
        {
          title: t('work_orders'),
          eyebrow: 'MAINTENANCE',
          icon: 'clipboard-text-outline',
          onPress: () =>
            navigation.navigate('WorkOrders', { filterFields: [] }),
          visible: hasViewPermission(PermissionEntity.WORK_ORDERS),
          featured: true
        },
        {
          title: 'Warehouse Equipment',
          eyebrow: 'EQUIPMENT',
          icon: 'warehouse',
          onPress: () =>
            navigation.navigate('Assets', {
              equipmentType: 'WAREHOUSE_EQUIPMENT'
            }),
          visible: hasViewPermission(PermissionEntity.ASSETS)
        },
        {
          title: 'Tractors / Vehicles',
          eyebrow: 'FLEET',
          icon: 'tractor-variant',
          onPress: () => navigation.navigate('Fleet'),
          visible: hasViewPermission(PermissionEntity.FLEET)
        },
        {
          title: 'Trailers',
          eyebrow: 'EQUIPMENT',
          icon: 'truck-trailer',
          onPress: () =>
            navigation.navigate('Assets', { equipmentType: 'TRAILER' }),
          visible: hasViewPermission(PermissionEntity.ASSETS)
        },
        {
          title: 'Farm Implements',
          eyebrow: 'EQUIPMENT',
          icon: 'tractor',
          onPress: () =>
            navigation.navigate('Assets', { equipmentType: 'FARM_IMPLEMENT' }),
          visible: hasViewPermission(PermissionEntity.ASSETS)
        },
        {
          title: t('parts'),
          eyebrow: 'INVENTORY',
          icon: 'cube-outline',
          onPress: () => navigation.navigate('Parts'),
          visible: hasViewPermission(PermissionEntity.PARTS_AND_MULTIPARTS)
        },
        {
          title: t('tagout'),
          eyebrow: 'SAFETY',
          icon: 'lock-alert-outline',
          onPress: () => navigation.navigate('Tagout'),
          visible: hasViewPermission(PermissionEntity.LOTO)
        }
      ];

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.screen, { backgroundColor: theme.colors.chassis }]}
    >
      <View style={[styles.hero, { backgroundColor: theme.colors.chassis }]}>
        <View
          style={[styles.datum, { backgroundColor: theme.colors.seasonal }]}
        />
        <Text style={[styles.kicker, { color: theme.colors.seasonal }]}>
          BAY BABY PRODUCE
        </Text>
        <Text style={[styles.title, { color: theme.colors.paper }]}>
          Maintenance Workbench
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.outline }]}>
          Choose an area to inspect, update, or create records.
        </Text>
        <View style={styles.utilities}>
          {!isRequester && (
            <TouchableOpacity
              accessibilityLabel="Work order dashboard"
              onPress={() => navigation.navigate('WorkOrderStats')}
              style={[
                styles.utilityButton,
                { borderColor: theme.colors.primary }
              ]}
            >
              <MaterialCommunityIcons
                name="chart-box-outline"
                size={20}
                color={theme.colors.paper}
              />
              <Text
                style={[styles.utilityLabel, { color: theme.colors.paper }]}
              >
                Dashboard
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            accessibilityLabel="Notifications"
            onPress={() => navigation.navigate('Notifications')}
            style={[
              styles.utilityButton,
              { borderColor: theme.colors.primary }
            ]}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={20}
              color={theme.colors.paper}
            />
            <Text style={[styles.utilityLabel, { color: theme.colors.paper }]}>
              Alerts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Settings"
            onPress={() => navigation.navigate('Settings')}
            style={[
              styles.utilityButton,
              { borderColor: theme.colors.primary }
            ]}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={20}
              color={theme.colors.paper}
            />
            <Text style={[styles.utilityLabel, { color: theme.colors.paper }]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeading}>
          <View>
            <Text
              style={[styles.sectionEyebrow, { color: theme.colors.primary }]}
            >
              OPERATIONS
            </Text>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Where are you working?
            </Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Scan an asset barcode"
            onPress={() => navigation.navigate('Scan')}
            style={[
              styles.scanButton,
              { backgroundColor: theme.colors.primary }
            ]}
          >
            <MaterialCommunityIcons
              name="barcode-scan"
              size={23}
              color={theme.colors.paper}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {destinations
            .filter((item) => item.visible)
            .map((item) => (
              <TouchableOpacity
                key={item.title}
                accessibilityRole="button"
                onPress={item.onPress}
                activeOpacity={0.78}
                style={[
                  styles.card,
                  item.featured && styles.featuredCard,
                  {
                    backgroundColor: item.featured
                      ? theme.colors.chassisRaised
                      : theme.colors.paper,
                    borderColor: item.featured
                      ? theme.colors.chassisRaised
                      : theme.colors.rule
                  }
                ]}
              >
                <View
                  style={[
                    styles.iconWell,
                    {
                      backgroundColor: item.featured
                        ? theme.colors.primary
                        : theme.colors.paperMuted
                    }
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={28}
                    color={
                      item.featured ? theme.colors.paper : theme.colors.primary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.cardEyebrow,
                    {
                      color: item.featured
                        ? theme.colors.seasonal
                        : theme.colors.onSurfaceVariant
                    }
                  ]}
                >
                  {item.eyebrow}
                </Text>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: item.featured
                        ? theme.colors.paper
                        : theme.colors.onSurface
                    }
                  ]}
                >
                  {item.title}
                </Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color={
                    item.featured ? theme.colors.paper : theme.colors.primary
                  }
                  style={styles.arrow}
                />
              </TouchableOpacity>
            ))}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Scan')}
          style={[
            styles.scanStrip,
            {
              backgroundColor: theme.colors.paper,
              borderColor: theme.colors.rule
            }
          ]}
        >
          <View
            style={[
              styles.scanStripIcon,
              { backgroundColor: theme.colors.primary }
            ]}
          >
            <MaterialCommunityIcons
              name="barcode-scan"
              size={25}
              color={theme.colors.paper}
            />
          </View>
          <View style={styles.scanCopy}>
            <Text style={[styles.scanTitle, { color: theme.colors.onSurface }]}>
              Scan equipment barcode
            </Text>
            <Text
              style={[
                styles.scanSubtitle,
                { color: theme.colors.onSurfaceVariant }
              ]}
            >
              Open the asset record and start work immediately.
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={25}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 25 },
  datum: { width: 44, height: 4, borderRadius: 2, marginBottom: 16 },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6
  },
  title: {
    fontFamily: 'serif',
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '700'
  },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 7, maxWidth: 330 },
  utilities: { flexDirection: 'row', gap: 8, marginTop: 18 },
  utilityButton: {
    minHeight: 44,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderRadius: 7,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center'
  },
  utilityLabel: { fontSize: 12, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 110 },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sectionEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '48.5%',
    minHeight: 160,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14
  },
  featuredCard: { width: '100%', minHeight: 148 },
  iconWell: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18
  },
  cardEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  cardTitle: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    paddingRight: 24,
    marginTop: 3
  },
  arrow: { position: 'absolute', right: 13, bottom: 14 },
  scanStrip: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  scanStripIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scanCopy: { flex: 1, paddingHorizontal: 12 },
  scanTitle: { fontSize: 15, fontWeight: '700' },
  scanSubtitle: { fontSize: 12, lineHeight: 17, marginTop: 2 }
});
