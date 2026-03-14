import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vicalfarmart.app',
  appName: 'Vical Farmart',
  webDir: 'out',
  server: {
    url: 'https://vicalfarmart.com',
    cleartext: true,
  },
  plugins: {
    // Standard plugins configuration
  }
};

export default config;