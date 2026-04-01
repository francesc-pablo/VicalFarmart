
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vicalfarmart.app',
  appName: 'Vical Farmart',
  /* Use a minimal local folder to satisfy Capacitor requirements without bloating the AAB size */
  webDir: 'www',
  server: {
    url: 'https://vicalfarmart.com',
    cleartext: true,
  },
  plugins: {
    // Native auth plugins removed to prevent Android build conflicts
  }
};

export default config;
