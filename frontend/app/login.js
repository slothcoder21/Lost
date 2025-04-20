import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { signInWithEmail, signInWithFacebook, signInWithGoogle, signInWithApple } from '../services/firebaseAuthService';
import SocialAuthButtons from '../components/SocialAuthButtons';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeProvider, setActiveProvider] = useState(null);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        router.replace('/home');
      }
    };
    
    checkAuth();
  }, []);

  const handleSignIn = async () => {
    // Form validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setEmailLoading(true);
      setError('');
      
      // Use Firebase login service
      const userCredential = await signInWithEmail(email, password);
      
      console.log('Successfully logged in with email', userCredential.user);
      
      // Navigate to home
      router.replace('/home');
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      // Extract specific error messages
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Try again later.';
          break;
        default:
          // Use the generic message
          break;
      }
      
      setError(errorMessage);
      console.error('Email login error:', error.code, error.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleCreateAccount = () => {
    router.push('/register');
  };

  const handleSocialSignIn = async (provider) => {
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
        console.log(`Successfully logged in with ${provider}`, userCredential.user);
        
        // Check if user is new or existing
        const isNewUser = userCredential.additionalUserInfo?.isNewUser;
        
        if (isNewUser) {
          // New user - go to profile setup
          router.replace('/setup-profile');
        } else {
          // Existing user - go to home
          router.replace('/home');
        }
      } else {
        // User cancelled the login flow
        console.log(`${provider} login cancelled`);
      }
    } catch (error) {
      let errorMessage = `Error signing in with ${provider}. Please try again.`;
      console.error(`${provider} login error:`, error.code, error.message);
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
          <Text style={styles.title}>LOST</Text>
          
          {/* Login form */}
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
            
            <TouchableOpacity 
              style={[styles.signInButton, emailLoading && styles.disabledButton]} 
              onPress={handleSignIn}
              disabled={emailLoading}
            >
              {emailLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
          
          {/* Social login section */}
          <View style={styles.socialSection}>
            <Text style={styles.socialText}>or sign in with</Text>
            <SocialAuthButtons 
              onPressFacebook={() => handleSocialSignIn('Facebook')}
              onPressGoogle={() => handleSocialSignIn('Google')}
              onPressApple={() => handleSocialSignIn('Apple')}
              loading={loading}
              activeProvider={activeProvider}
            />
          </View>
          
          {/* Create account link */}
          <View style={styles.createAccountSection}>
            <Text style={styles.createAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleCreateAccount}>
              <Text style={styles.createAccountLink}>Create Account</Text>
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
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 30,
    letterSpacing: 4,
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
  signInButton: {
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
  createAccountSection: {
    flexDirection: 'row',
    marginTop: 30,
  },
  createAccountText: {
    fontSize: 14,
    color: '#666',
  },
  createAccountLink: {
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