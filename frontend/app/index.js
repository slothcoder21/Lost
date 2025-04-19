import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Dimensions, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import ActionButton from '../components/ActionButton';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  const handleStart = () => {
    // Navigate to the login screen
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topContent}>
          {/* Magnifying glass icon */}
          <Image 
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          {/* App name */}
          <Text style={styles.title}>LOST</Text>
          
          {/* Description text */}
          <Text style={styles.description}>
            Lost your belongings? Lost may be able to help you find it!
          </Text>
        </View>
        
        <View style={styles.bottomContent}>
          {/* Start button */}
          <ActionButton 
            title="Start looking for your stuff!" 
            onPress={handleStart}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  topContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  bottomContent: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 60, // Increased bottom padding
    paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 30,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
    letterSpacing: 4,
  },
  description: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
    maxWidth: 340,
    lineHeight: 28,
  },
}); 