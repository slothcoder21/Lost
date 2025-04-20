import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTestUserProfile } from '../services/testProfileService';

export default function UserProfilePage() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  
  const [userData, setUserData] = useState(null);
  const [karmaScore, setKarmaScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!userId) {
          setError('No user ID provided');
          return;
        }
        
        // Get test user profile directly - skip Firebase
        const testProfile = await getTestUserProfile(userId);
        
        if (testProfile) {
          setUserData(testProfile);
          setKarmaScore(testProfile.karmaScore || 0);
        } else {
          throw new Error('User profile not found');
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [userId]);

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#8AD3A3" style={styles.loader} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : userData ? (
            <>
              {/* Profile Picture Section */}
              <View style={styles.profilePictureSection}>
                <Image 
                  source={
                    typeof userData.photoURL === 'string'
                      ? { uri: userData.photoURL }
                      : userData.photoURL || require('../assets/profile-placeholder.png')
                  }
                  style={styles.profilePicture}
                />
                <Text style={styles.userName}>
                  {userData.firstName && userData.lastName 
                    ? `${userData.firstName} ${userData.lastName}`
                    : 'User'}
                </Text>
                {userData.pronouns && (
                  <Text style={styles.pronouns}>{userData.pronouns}</Text>
                )}
              </View>

              {/* Karma Score Section */}
              <View style={styles.karmaSection}>
                <Text style={styles.karmaTitleText}>Karma Score</Text>
                <View style={styles.karmaScoreContainer}>
                  <Text style={styles.karmaScoreText}>{karmaScore}</Text>
                </View>
                <Text style={styles.karmaDescriptionText}>
                  Karma increases when users help reconnect people with lost items
                </Text>
              </View>

              {/* Contact Information */}
              <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                
                {userData.email && (
                  <View style={styles.contactRow}>
                    <Ionicons name="mail-outline" size={20} color="#666" />
                    <Text style={styles.contactText}>{userData.email}</Text>
                  </View>
                )}
                
                {userData.phoneNumber && (
                  <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={20} color="#666" />
                    <Text style={styles.contactText}>{userData.phoneNumber}</Text>
                  </View>
                )}
              </View>

              {/* Contact Button - Only show if viewing someone else's profile */}
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => router.push(`/chat?userId=${userId}`)}
              >
                <Text style={styles.contactButtonText}>Contact User</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>User not found</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  loader: {
    marginTop: 50,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pronouns: {
    fontSize: 16,
    color: '#666',
  },
  karmaSection: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  karmaTitleText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  karmaScoreContainer: {
    backgroundColor: '#8AD3A3',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  karmaScoreText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  karmaDescriptionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  contactSection: {
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 12,
  },
  contactButton: {
    backgroundColor: '#8AD3A3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 