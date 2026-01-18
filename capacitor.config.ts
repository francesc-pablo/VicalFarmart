
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vicalfarmart.app',
  appName: 'Vical Farmart',
  webDir: '.next',
  server: {
    // For local development, you may need to use your machine's IP address
    // instead of 'localhost' to connect from a physical device.
    url: 'http://localhost:9002',
    cleartext: true, // Required for HTTP traffic on Android for local development
  },
};

export default config;
