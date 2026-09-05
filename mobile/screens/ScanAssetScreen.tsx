/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 · contrast: pass · responsive: pass */
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { Button, Card, Icon, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect } from 'react';
import { RootStackScreenProps } from '../types';
import { useDispatch } from '../store';
import { getLicenseValidity } from '../slices/license';
import { useLicenseEntitlement } from '../hooks/useLicenseEntitlement';
import { CustomSnackBarContext } from '../contexts/CustomSnackBarContext';
import { useAppTheme } from '../custom-theme';
import useAuth from '../hooks/useAuth';
import { PermissionEntity } from '../models/role';
import api from '../utils/api';
import { AssetDTO } from '../models/asset';

export default function ScanAssetScreen({ navigation }: RootStackScreenProps<'ScanAsset'>) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, hasCreatePermission } = useAuth();
  const hasBarcodeNfcEntitlement = useLicenseEntitlement('NFC_BARCODE');
  const isNfcEnabled = Platform.select({ ios: false, default: true });
  const isRequester = user?.role.code === 'REQUESTER';
  const canCreateAssets = !isRequester && hasCreatePermission(PermissionEntity.ASSETS);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  useEffect(() => {
    dispatch(getLicenseValidity());
  }, [dispatch]);

  const showLicenseError = () => showSnackBar(t('you_need_a_license'), 'error');
  const handleNotFound = (message: string, identifiers: { nfcId?: string; barCode?: string }) => {
    const actions: any[] = [{ text: t('no'), onPress: () => navigation.goBack() }];
    if (canCreateAssets) actions.push({ text: t('yes'), onPress: () => navigation.replace('AddAsset', identifiers) });
    Alert.alert(t('error'), message, actions);
  };
  const openAsset = (asset: AssetDTO) => navigation.replace('ScannedAsset', { asset });

  const startBarcodeScan = () => {
    if (!hasBarcodeNfcEntitlement) return showLicenseError();
    navigation.navigate('SelectBarcode', {
      onChange: (barCode) => api.get<AssetDTO>(`assets/barcode?data=${encodeURIComponent(barCode)}`)
        .then(openAsset)
        .catch(() => handleNotFound(t('no_asset_found_barcode'), { barCode }))
    });
  };

  const startNfcScan = () => {
    if (!hasBarcodeNfcEntitlement) return showLicenseError();
    navigation.navigate('SelectNfc', {
      onChange: (nfcId) => api.get<AssetDTO>(`assets/nfc?nfcId=${encodeURIComponent(nfcId)}`)
        .then(openAsset)
        .catch(() => handleNotFound(t('no_asset_found_nfc'), { nfcId }))
    });
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.hero, { backgroundColor: theme.colors.chassis }]}>
        <View style={[styles.datum, { backgroundColor: theme.colors.seasonal }]} />
        <Text style={[styles.eyebrow, { color: theme.colors.seasonal }]}>{t('asset_lookup')}</Text>
        <Text variant="headlineMedium" style={[styles.heroTitle, { color: theme.colors.paper }]}>{t('scan_asset')}</Text>
        <Text style={[styles.heroCopy, { color: theme.colors.outlineVariant }]}>{isRequester ? t('scan_requester_help') : t('scan_technician_help')}</Text>
      </View>
      <View style={styles.content}>
        <Card style={[styles.scanCard, { backgroundColor: theme.colors.paper, borderColor: theme.colors.rule }]}>
          <Card.Content style={styles.cardContent}>
            <View style={[styles.iconPlate, { backgroundColor: theme.colors.surfaceVariant }]}><Icon source="barcode-scan" size={25} color={theme.colors.primaryAlt} /></View>
            <View style={styles.cardText}>
              <Text variant="titleLarge" style={styles.cardTitle}>{t('barcode')}</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('barcode_scan_help')}</Text>
            </View>
            <Button mode="contained" icon="barcode-scan" onPress={startBarcodeScan}>{t('scan')}</Button>
          </Card.Content>
        </Card>
        {isNfcEnabled && (
          <Card style={[styles.scanCard, { backgroundColor: theme.colors.paper, borderColor: theme.colors.rule }]}>
            <Card.Content style={styles.cardContent}>
              <View style={[styles.iconPlate, { backgroundColor: theme.colors.surfaceVariant }]}><Icon source="nfc" size={25} color={theme.colors.primaryAlt} /></View>
              <View style={styles.cardText}>
                <Text variant="titleLarge" style={styles.cardTitle}>{t('NFC')}</Text>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('nfc_scan_help')}</Text>
              </View>
              <Button mode="outlined" icon="nfc" onPress={startNfcScan}>{t('scan')}</Button>
            </Card.Content>
          </Card>
        )}
        <View style={[styles.note, { borderColor: theme.colors.rule }]}>
          <Text style={[styles.noteLabel, { color: theme.colors.primary }]}>{t('what_happens_next')}</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>{isRequester ? t('requester_scan_next') : t('technician_scan_next')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingTop: 26, paddingBottom: 30, position: 'relative', overflow: 'hidden' },
  datum: { position: 'absolute', width: 7, height: 88, right: 24, top: 20, borderRadius: 4, transform: [{ rotate: '12deg' }] },
  eyebrow: { fontWeight: '800', fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle: { fontWeight: '800', letterSpacing: -0.5 },
  heroCopy: { marginTop: 8, maxWidth: 330, lineHeight: 20 },
  content: { padding: 16, gap: 12 },
  scanCard: { borderWidth: 1, borderRadius: 14, elevation: 0 },
  cardContent: { gap: 12 },
  iconPlate: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardText: { gap: 3 },
  cardTitle: { fontWeight: '700' },
  note: { marginTop: 6, borderTopWidth: 1, paddingTop: 15, gap: 5 },
  noteLabel: { fontWeight: '800', fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' }
});
