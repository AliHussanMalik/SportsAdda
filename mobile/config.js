import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Dynamically resolves the API Base URL for SportsAdda Mobile App.
 * - If using Expo Tunnel (--tunnel): uses public API tunnel (https://sportsadda-api-v1.loca.lt/api)
 *   so the mobile app can reach backend from any Wi-Fi, 4G/5G, or isolated router.
 * - If in Android Emulator: uses 10.0.2.2:5000
 * - If on local LAN: uses 192.168.1.14:5000
 */
const getApiBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);

    // If connected via Expo LAN IP mode
    if (isIp && host !== '127.0.0.1') {
      return `http://${host}:5000/api`;
    }

    // If connected via Expo Tunnel (--tunnel)
    if (host.includes('exp.direct') || host.includes('ngrok') || !isIp) {
      return 'https://sportsadda-api-v1.loca.lt/api';
    }
  }

  // Fallback for Android Emulator
  if (Platform.OS === 'android' && !Constants.isDevice) {
    return 'http://10.0.2.2:5000/api';
  }

  // Primary public tunnel fallback for Expo Tunnel mode & physical phones
  return 'https://sportsadda-api-v1.loca.lt/api';
};

export const API_BASE = getApiBaseUrl();
console.log('SportsAdda Mobile connected to API Base:', API_BASE);
