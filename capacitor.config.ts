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
    FirebaseAuthentication: {
      providers: ['google.com'],
      skipNativeAuth: false,
    },
  },
};

export default config;