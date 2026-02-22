# Vical Farmart - Mobile & Web

This is a Next.js 15 application integrated with Firebase and Capacitor for native Android/iOS support.

## 🚀 Android Native Setup (CRITICAL for Google Sign-In)

If you are building an APK and Google Sign-In is failing, you must register your Android app in Firebase.

### 1. Register Android App in Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click on the **Gear Icon (Project Settings)**.
3. In the **General** tab, scroll down to **Your apps**.
4. Click **Add app** and select the **Android icon**.
5. **Android package name**: Enter `com.vicalfarmart.app` (This must match the `appId` in your `capacitor.config.ts`).
6. Click **Register app**.

### 2. Download and Place google-services.json
1. Download the `google-services.json` file provided by Firebase.
2. Move this file into your project at: **`android/app/google-services.json`**.

### 3. Add SHA-1 Fingerprint
Once the app is registered, you will see the **Add fingerprint** button in the Android app settings in Firebase Console.
1. Open a terminal in your project's `android` folder.
2. Run this command to get your debug key:
   ```bash
   ./gradlew signingReport
   ```
3. Look for the `SHA1` string under the `debug` variant.
4. Copy that string, go back to Firebase Console, click **Add fingerprint**, and paste it.
5. Click **Save**.

### 4. Update Web Client ID
Ensure the `serverClientId` in `capacitor.config.ts` and the `server_client_id` in `android/app/src/main/res/values/strings.xml` match the **Web Client ID** found in your Firebase Console (Authentication > Sign-in method > Google > Web SDK configuration).

## 🛠 Development Commands

- `npm run dev`: Start web development server.
- `npm run build`: Build the web project for production.
- `npx cap sync`: Sync web assets to native platforms.
- `npx cap open android`: Open the Android project in Android Studio.
- `npx cap run android`: Build and run the app directly on a connected device.

## 📁 Project Structure
- `src/app`: Next.js App Router pages.
- `src/components`: Reusable UI and layout components.
- `src/services`: Firebase data and auth services.
- `android/`: Native Android project files.
- `capacitor.config.ts`: Capacitor configuration.
