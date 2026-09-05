import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

const apiUrl = process.env.API_URL;
const googleServicesJson = process.env.GOOGLE_SERVICES_JSON;
const easProjectId = process.env.EAS_PROJECT_ID;

const appName = 'Bay Baby Maintenance';
const appVersion = '1.1.5';
const androidPackage = 'com.baybabyproduce.maintenance';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug: 'bay-baby-maintenance',
  version: appVersion,
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'baybabymaintenance',
  userInterfaceStyle: 'automatic',
  newArchEnabled: false,
  notification: {
    icon: './assets/images/notification.png'
  },
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  ios: {
    bundleIdentifier: 'com.cmms.atlas',
    buildNumber: '9',
    jsEngine: 'hermes',
    supportsTablet: false,
    runtimeVersion: appVersion,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    versionCode: 7,
    package: androidPackage,
    jsEngine: 'hermes',
    permissions: [
      'android.permission.CAMERA',
      'android.permission.INTERNET',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.NFC',
      'android.permission.RECORD_AUDIO',
      'android.permission.REQUEST_INSTALL_PACKAGES',
      'android.permission.VIBRATE'
    ],
    blockedPermissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.WRITE_EXTERNAL_STORAGE'
    ],
    ...(googleServicesJson
      ? { googleServicesFile: googleServicesJson }
      : {}),
    runtimeVersion: appVersion
  },
  web: {
    favicon: './assets/images/favicon.png'
  },
  extra: {
    API_URL: apiUrl,
    UPDATE_MANIFEST_URL:
      process.env.UPDATE_MANIFEST_URL ||
      'http://192.168.1.122:3000/downloads/android-update.json',
    ...(easProjectId ? { eas: { projectId: easProjectId } } : {})
  },
  plugins: [
    'react-native-nfc-manager',
    '@react-native-community/datetimepicker',
    'expo-asset',
    'expo-audio',
    'expo-font',
    'expo-notifications',
    'expo-web-browser',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow Atlas to access camera.'
      }
    ],
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
          deploymentTarget: '15.1'
        },
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          buildToolsVersion: '36.0.0',
          // The privately hosted Atlas API currently uses HTTP over the secured
          // company network/Tailscale connection.
          usesCleartextTraffic: true
        }
      }
    ]
  ]
});
