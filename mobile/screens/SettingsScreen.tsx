import { Platform, ScrollView, StyleSheet } from 'react-native';
import { View } from '../components/Themed';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Chip,
  Dialog,
  Divider,
  IconButton,
  List,
  Portal,
  Text,
  useTheme
} from 'react-native-paper';
import useAuth from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/i18n';
import { getUserInitials } from '../utils/displayers';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { RootStackScreenProps } from '../types';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { showMessage } from 'react-native-flash-message';
import { CustomSnackBarContext } from '../contexts/CustomSnackBarContext';
import tr from '../i18n/translations/tr';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

type AndroidUpdate = {
  version: string;
  versionCode: number;
  apkUrl: string;
  releaseNotes?: string;
  publishedAt?: string;
};

const UPDATE_MANIFEST_URL = Constants.expoConfig?.extra
  ?.UPDATE_MANIFEST_URL as string | undefined;

const isNewerVersion = (available: string, current: string) => {
  const availableParts = available.split('.').map(Number);
  const currentParts = current.split('.').map(Number);
  const length = Math.max(availableParts.length, currentParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (availableParts[index] || 0) - (currentParts[index] || 0);
    if (difference !== 0) return difference > 0;
  }
  return false;
};

export default function SettingsScreen({
                                         navigation
                                       }: RootStackScreenProps<'Settings'>) {
  const theme = useTheme();
  const { user, switchAccount, logout } = useAuth();
  const [switchingAccount, setSwitchingAccount] = useState<boolean>(false);
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState<string>(i18n.language || 'en');
  const [versionPressCount, setVersionPressCount] = useState<number>(0);
  const [openLogout, setOpenLogout] = useState<boolean>(false);
  const [openDevInfo, setOpenDevInfo] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [devMode, setDevMode] = useState<boolean>(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [downloadingUpdate, setDownloadingUpdate] = useState(false);
  const [availableUpdate, setAvailableUpdate] = useState<AndroidUpdate | null>(null);
  const [updateChecked, setUpdateChecked] = useState(false);
  const currentVersion = Constants.expoConfig?.version || '1.1.6';

  const checkForUpdate = async () => {
    if (!UPDATE_MANIFEST_URL) {
      showSnackBar(t('update_check_failure'), 'error');
      return;
    }
    setCheckingUpdate(true);
    try {
      const response = await fetch(`${UPDATE_MANIFEST_URL}?t=${Date.now()}`);
      if (!response.ok) throw new Error(`Update server returned ${response.status}`);
      const update = (await response.json()) as AndroidUpdate;
      if (!update.version || !update.apkUrl) throw new Error('Invalid update information');
      setAvailableUpdate(
        isNewerVersion(update.version, currentVersion) ? update : null
      );
      setUpdateChecked(true);
    } catch (error) {
      setUpdateChecked(false);
      showSnackBar(t('update_check_failure'), 'error');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const downloadAndInstallUpdate = async () => {
    if (!availableUpdate || Platform.OS !== 'android') return;
    setDownloadingUpdate(true);
    try {
      const destination = `${FileSystem.cacheDirectory}Bay-Baby-Maintenance-${availableUpdate.version}.apk`;
      await FileSystem.deleteAsync(destination, { idempotent: true });
      const result = await FileSystem.downloadAsync(availableUpdate.apkUrl, destination);
      if (result.status !== 200) throw new Error(`Download failed with ${result.status}`);
      const contentUri = await FileSystem.getContentUriAsync(result.uri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        type: 'application/vnd.android.package-archive',
        flags: 268435457
      });
    } catch (error) {
      showSnackBar(t('update_download_failure'), 'error');
    } finally {
      setDownloadingUpdate(false);
    }
  };
  useEffect(() => {
    if (versionPressCount > 2 && versionPressCount < 6) {
      showSnackBar(`Dev mode in ${6 - versionPressCount}`, 'info');
    } else if (versionPressCount === 6) {
      setOpenDevInfo(true);
      setDevMode(true);
      setVersionPressCount(0);
    }
  }, [versionPressCount]);
  const renderConfirmLogout = () => {
    return (
      <Portal theme={theme}>
        <Dialog visible={openLogout} onDismiss={() => setOpenLogout(false)}>
          <Dialog.Title>{t('confirmation')}</Dialog.Title>
          <Dialog.Content>
            <Text variant='bodyMedium'>{t('confirm_logout')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpenLogout(false)}>{t('cancel')}</Button>
            <Button onPress={logout}>{t('Sign out')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };
  const renderDevInfo = () => {
    return (
      <Portal theme={theme}>
        <Dialog visible={openDevInfo} onDismiss={() => setOpenDevInfo(false)}>
          <Dialog.Title>{t('Dev Info')}</Dialog.Title>
          <Dialog.Content>
            <Text variant='titleMedium'>{t('Build ID')}</Text>
            <Text variant='bodyMedium'>{Updates.updateId}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpenDevInfo(false)}>{t('cancel')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {renderConfirmLogout()}
      {renderDevInfo()}
      <ScrollView contentContainerStyle={styles.content}>
        <List.Item
          style={{ paddingHorizontal: 20 }}
          left={(props) =>
            user.image ? (
              <Avatar.Image source={{ uri: user.image.url }} />
            ) : (
              <Avatar.Text size={50} label={getUserInitials(user)} />
            )
          }
          title={user.email}
          description={t('update_profile')}
          onPress={() => navigation.navigate('UserProfile')}
        />
        {user.parentSuperAccount && <List.Item
          style={{ paddingHorizontal: 20 }}
          left={(props) => <IconButton icon={'swap-horizontal'} />}
          title={t('switch_to_super_user')}
          right={(props) => switchingAccount && <ActivityIndicator />}
          onPress={() => {
            setSwitchingAccount(true);
            switchAccount(user.parentSuperAccount.superUserId)
              .finally(() => setSwitchingAccount(false));
          }}
        />}
        <List.Item
          style={{ paddingHorizontal: 20 }}
          left={(props) => (
            <IconButton iconColor={theme.colors.error} icon={'logout'} />
          )}
          title={t('Sign out')}
          titleStyle={{ color: theme.colors.error }}
          onPress={() => setOpenLogout(true)}
        />
        <List.Item
          onPress={() => {
            if (devMode) {
              setOpenDevInfo(true);
            } else {
              setVersionPressCount(state => state + 1);
            }
          }}
          style={{ paddingHorizontal: 20 }}
          left={(props) => <IconButton icon={'information-outline'} />}
          title={t('Version')}
          description={Constants.expoConfig.version}
        />
        {Platform.OS === 'android' && (
          <View style={[styles.updateCard, { borderColor: theme.colors.outlineVariant }]}>
            <View style={styles.updateHeading}>
              <View style={[styles.updateIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                <IconButton icon="cellphone-arrow-down" iconColor={theme.colors.primary} />
              </View>
              <View style={styles.updateCopy}>
                <Text variant="titleMedium">{t('app_updates')}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {availableUpdate
                    ? t('update_available', { version: availableUpdate.version })
                    : updateChecked
                      ? t('app_is_up_to_date')
                      : t('check_updates_description')}
                </Text>
              </View>
            </View>
            {availableUpdate?.releaseNotes ? (
              <Text variant="bodySmall" style={styles.releaseNotes}>
                {availableUpdate.releaseNotes}
              </Text>
            ) : null}
            <Button
              mode={availableUpdate ? 'contained' : 'outlined'}
              icon={availableUpdate ? 'download' : 'refresh'}
              loading={checkingUpdate || downloadingUpdate}
              disabled={checkingUpdate || downloadingUpdate}
              onPress={availableUpdate ? downloadAndInstallUpdate : checkForUpdate}
              style={styles.updateButton}
            >
              {downloadingUpdate
                ? t('downloading_update')
                : availableUpdate
                  ? t('download_and_install')
                  : t('check_for_updates')}
            </Button>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {t('current_version', { version: currentVersion })}
            </Text>
          </View>
        )}
        <Divider />
        <List.Item
          style={{ paddingHorizontal: 20 }}
          left={(props) => <IconButton icon={'translate'} />}
          title={t('language')}
          description={() => (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, backgroundColor: 'transparent' }}>
              <Chip
                selected={currentLang === 'en'}
                onPress={() => { i18n.changeLanguage('en'); setCurrentLang('en'); }}
                icon="flag"
                style={{ backgroundColor: currentLang === 'en' ? theme.colors.primaryContainer : undefined }}
              >
                🇺🇸 English
              </Chip>
              <Chip
                selected={currentLang === 'es'}
                onPress={() => { i18n.changeLanguage('es'); setCurrentLang('es'); }}
                icon="flag"
                style={{ backgroundColor: currentLang === 'es' ? theme.colors.primaryContainer : undefined }}
              >
                🇪🇸 Español
              </Chip>
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32
  },
  updateCard: {
    borderWidth: 1,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16
  },
  updateHeading: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  updateIcon: {
    borderRadius: 14,
    marginRight: 12
  },
  updateCopy: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  releaseNotes: {
    marginTop: 14,
    lineHeight: 18
  },
  updateButton: {
    marginTop: 16,
    marginBottom: 8
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
});
