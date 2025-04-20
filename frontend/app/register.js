import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { registerWithEmail, signInWithFacebook, signInWithGoogle, signInWithApple } from '../services/firebaseAuthService';
import SocialAuthButtons from '../components/SocialAuthButtons';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeProvider, setActiveProvider] = useState(null);

  const handleRegister = async () => {
    // Form validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setEmailLoading(true);
      setError('');
      
      // Use Firebase registration service
      const userCredential = await registerWithEmail(email, password);
      
      console.log('Successfully registered with email', userCredential.user);
      
      // Navigate to profile setup
      router.replace('/setup-profile');
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      // Extract specific error messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Try logging in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Choose a stronger password.';
          break;
        default:
          // Use the generic message
          break;
      }
      
      setError(errorMessage);
      console.error('Email registration error:', error.code, error.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSocialRegister = async (provider) => {
    try {
      setLoading(true);
      setError('');
      setActiveProvider(provider);
      
      let userCredential;
      
      // Call the appropriate auth function
      switch(provider) {
        case 'Facebook':
          userCredential = await signInWithFacebook();
          break;
        case 'Google':
          userCredential = await signInWithGoogle();
          break;
        case 'Apple':
          userCredential = await signInWithApple();
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
      
      if (userCredential) {
        console.log(`Successfully registered with ${provider}`, userCredential.user);
        
        // Navigate to profile setup
        router.replace('/setup-profile');
      } else {
        // User cancelled the registration flow
        console.log(`${provider} registration cancelled`);
      }
    } catch (error) {
      let errorMessage = `Error registering with ${provider}. Please try again.`;
      console.error(`${provider} registration error:`, error.code, error.message);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setActiveProvider(null);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo and title */}
          <Image 
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create Account</Text>
          
          {/* Registration form */}
          <View style={styles.form}>
            <TextInput 
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput 
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput 
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            
            <TouchableOpacity 
              style={[styles.registerButton, emailLoading && styles.disabledButton]} 
              onPress={handleRegister}
              disabled={emailLoading}
            >
              {emailLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
          
          {/* Social login section */}
          <View style={styles.socialSection}>
            <Text style={styles.socialText}>or register with</Text>
            <SocialAuthButtons 
              onPressFacebook={() => handleSocialRegister('Facebook')}
              onPressGoogle={() => handleSocialRegister('Google')}
              onPressApple={() => handleSocialRegister('Apple')}
              loading={loading}
              activeProvider={activeProvider}
            />
          </View>
          
          {/* Sign in link */}
          <View style={styles.signInSection}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 30,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#8AD3A3',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  socialSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  socialText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  signInSection: {
    flexDirection: 'row',
    marginTop: 30,
  },
  signInText: {
    fontSize: 14,
    color: '#666',
  },
  signInLink: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  }
}); 