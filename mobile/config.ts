import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const googleMapsConfig = {
  apiKey: process.env.GOOGLE_KEY
};

// Default API URL from Expo config
const defaultApiUrl = Constants.expoConfig?.extra?.API_URL as
  | string
  | undefined;
export const IS_LOCALHOST = false;

// Function to get the API URL (either custom or default)
export const getApiUrl = async (): Promise<string> => {
  try {
    // Try to get custom URL from AsyncStorage
    const customUrl = await AsyncStorage.getItem('customApiUrl');

    // Use custom URL if available, otherwise use default
    const rawApiUrl = customUrl || defaultApiUrl;
    if (!rawApiUrl) {
      throw new Error(
        'No CMMS server is configured. Set API_URL or choose a custom server.'
      );
    }
    return rawApiUrl.endsWith('/') ? rawApiUrl : rawApiUrl + '/';
  } catch (error) {
    if (!defaultApiUrl) throw error;
    return defaultApiUrl.endsWith('/') ? defaultApiUrl : defaultApiUrl + '/';
  }
};
