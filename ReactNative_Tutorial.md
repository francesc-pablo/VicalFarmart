
# Tutorial: Building a React Native App for Vical Farmart

This guide will walk you through the process of creating a React Native mobile app that connects to your existing Vical Farmart backend (Firebase and Genkit AI). We will use the **Expo Go** workflow, which is the fastest way to get started.

---

### Step 1: Set Up Your Development Environment

First, you need to set up the React Native development environment on your computer.

1.  **Install Node.js**: If you don't have it, download and install the LTS version from [nodejs.org](https://nodejs.org/).
2.  **Install Expo Go App**: On your physical phone (iOS or Android), go to the App Store or Google Play Store and install the **Expo Go** app. This will allow you to run the mobile app on your phone without needing Xcode or Android Studio.
3.  **Install Expo CLI**: Open your terminal or command prompt and run the following command to install the Expo command-line tool:
    ```bash
    npm install -g expo-cli
    ```

---

### Step 2: Create the React Native Project

Now, let's create a new React Native project. Navigate to a directory where you want to create your app (outside of your current web project) and run:

```bash
npx create-expo-app VicalFarmartMobile
```

When prompted, choose the **"Blank (TypeScript)"** template. This will create a new folder named `VicalFarmartMobile` with a basic app structure.

Navigate into your new project directory:

```bash
cd VicalFarmartMobile
```

---

### Step 3: Install Necessary Libraries

We need to add Firebase and other libraries to our new mobile app project.

```bash
npm install firebase @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

---

### Step 4: Connect to Firebase

Your backend is already configured. We just need to add your Firebase credentials to the mobile app.

1.  **Create a Firebase Config File**: Inside the `VicalFarmartMobile` folder, create a new file named `firebase.ts`.

2.  **Add Your Credentials**: Copy the `firebaseConfig` object from your web project's `src/lib/firebase.ts` file and paste it into the new `firebase.ts` file. It should look like this:

    ```typescript
    // firebase.ts
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";

    // IMPORTANT: Copy these values from your web project's .env.local file
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID"
    };

    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    export const auth = getAuth(app);
    export const db = getFirestore(app);
    ```
    **Crucially, replace the placeholder values with your actual Firebase project credentials.**

---

### Step 5: Implement a Basic Login Screen

Let's create a simple login screen to test our Firebase connection.

Replace the contents of `App.tsx` with the following code. This code sets up basic navigation and a login form.

```tsx
// App.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; // Import from our new firebase.ts file

// A simple screen to show after login
function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Vical Farmart!</Text>
      <Text>You are logged in.</Text>
      <Button title="Sign Out" onPress={() => auth.signOut()} />
    </View>
  );
}

// Our Login Screen component
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Email and password cannot be empty.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will automatically handle the switch to the HomeScreen
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vical Farmart Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<any>(null);

  // Listen for authentication state changes
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authenticatedUser) => {
      setUser(authenticatedUser);
    });
    return unsubscribe; // Unsubscribe on unmount
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // If user is logged in, show the HomeScreen
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }}/>
        ) : (
          // If user is not logged in, show the LoginScreen
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Basic styles for our components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
});
```

---

### Step 6: Run the Mobile App

1.  **Start the Metro Bundler**: In your terminal, inside the `VicalFarmartMobile` directory, run:
    ```bash
    npm start
    ```
2.  **Scan the QR Code**: A QR code will appear in your terminal. Open the **Expo Go** app on your phone and scan this QR code.
3.  **View the App**: The app will load on your phone. You should see the login screen you just created. Try logging in with a user account from your Vical Farmart database!

---

### Step 7: Calling your Genkit AI API

To call a Genkit flow (like `sendWelcomeEmail`), you will use the `fetch` API. Your Next.js server acts as the API backend for your mobile app.

Here is an example of how you could call the `sendContactFormEmail` flow from your mobile app. You would add this function to a `services/emailService.ts` file in your mobile project.

```typescript
// services/emailService.ts

// IMPORTANT: Replace this with the URL of your deployed Next.js application
const API_BASE_URL = 'https://your-vical-farmart-web-app.com/api/genkit/flow';

interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(data: ContactFormInput): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/sendContactFormEmailFlow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // The response body might contain a useful error message from the server
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email.');
    }

    // The flow returns void, so we just check for a successful status
    console.log('Contact form email sent successfully!');

  } catch (error) {
    console.error('Error sending contact email:', error);
    throw error; // Re-throw to be handled by the UI
  }
}
```

This tutorial provides the foundation for building your mobile app. From here, you can create more screens, fetch products from Firestore, and build out all the features from your web app using React Native components. Good luck!
