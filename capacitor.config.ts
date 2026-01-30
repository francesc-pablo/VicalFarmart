
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vicalfarmart.app',
  appName: 'Vical Farmart',
  webDir: '.next',
  server: {
    url: 'http://localhost:9002',
    cleartext: true,
  },
};

export default config;
