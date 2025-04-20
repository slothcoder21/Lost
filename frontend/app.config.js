import 'dotenv/config';

export default {
  name: "Lost",
  slug: "lost",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/logo.png",
  scheme: "myapp",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/logo.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    infoPlist: {
      UIStatusBarHidden: false
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/logo.png",
      backgroundColor: "#ffffff"
    },
    softwareKeyboardLayoutMode: "resize",
    navigationBarColor: "#ffffff",
    statusBar: {
      backgroundColor: "#ffffff",
      translucent: false
    }
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.ico"
  },
  plugins: [
    "expo-router"
  ],
  experiments: {
    typedRoutes: true
  },
  // Configuration for EAS (Expo Application Services)
  extra: {
    eas: {
      projectId: "your-eas-project-id" // Update this with your actual EAS project ID if using EAS
    },
    // Firebase configuration
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
  }
}; 