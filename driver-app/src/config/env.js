import { Platform } from 'react-native';

// Development LAN API URL configuration
// For Physical Mobile Phones running Expo Go, set LAN_IP to your laptop's Wi-Fi IP address (e.g., '192.168.1.5')
const LAN_IP = '192.168.1.100'; 

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  if (Platform.OS === 'android' && !LAN_IP) {
    return 'http://10.0.2.2:8000/api'; // Android Emulator default
  }
  
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api';
  }

  // Physical Phone / Default LAN URL
  return `http://${LAN_IP}:8000/api`;
};

export const API_BASE_URL = getApiBaseUrl();
export const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');

export const APP_CONFIG = {
  APP_NAME: 'RevRoute AI Driver',
  MOTTO: 'Detect. Analyze. Recover.',
  VERSION: '1.0.0',
  MAX_FILE_SIZE_MB: 10,
};
