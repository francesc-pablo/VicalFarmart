import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vicalfarmart.app',
  appName: 'Vical Farmart',
  webDir: '.next',
  server: {
    url: 'https://vicalfarmart.com',
    cleartext: true,
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '318375487368-r1tu57apceaum6q2sevc8rf81jl5rjsm.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;