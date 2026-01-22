
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vicalfarmart.app',
  appName: 'Vical Farmart',
  webDir: 'out',
  server: {
    // =================================================================
    // IMPORTANT FOR LOCAL DEVELOPMENT!
    // =================================================================
    // To connect from a physical device or an Android emulator, you MUST
    // replace 'localhost' with your computer's local IP address.
    //
    // HOW TO FIND YOUR IP ADDRESS:
    //   - On Windows: Open Command Prompt and type `ipconfig`. Look for the "IPv4 Address".
    //   - On macOS: Open System Settings > Network > Wi-Fi. Your IP is shown there.
    //
    // Example: If your IP is 192.168.1.100, the line should be:
    // url: 'http://192.168.1.100:9002',
    // =================================================================
    url: 'http://localhost:9002',
    cleartext: true, // Required for HTTP traffic on Android for local development
  },
};

export default config;
