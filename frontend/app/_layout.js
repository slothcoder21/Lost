import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from 'expo-router';
import * as Font from 'expo-font';
import { AuthProvider } from '../contexts/AuthContext';
import { setupTestProfiles } from '../services/testProfileService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = Font.useFonts({
    // You can add custom fonts here if needed
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Once fonts are loaded (or if there's an error), hide the splash screen
      SplashScreen.hideAsync();
      
      // Set up test profiles for demo purposes
      setupTestProfiles().catch(err => console.error('Error setting up test profiles:', err));
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="setup-profile" />
        <Stack.Screen 
          name="home" 
          options={{
            gestureEnabled: false, // Disable swipe back gesture
            // Reset the navigation stack to prevent going back
            animation: 'fade',
          }}
        />
        <Stack.Screen name="chats" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="user-profile" />
      </Stack>
    </AuthProvider>
  );
} 