
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vicalfarmart.app',
  appName: 'Vical Farmart',
  webDir: '.next',
  server: {
    url: 'https://your-live-nextjs-app.com',
    cleartext: true,
  },
};

export default config;
