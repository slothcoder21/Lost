import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Switch,
  Alert,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function ProfilePage() {
  const router = useRouter();
  
  // State for user data
  const [userData, setUserData] = useState({
    name: 'Adrian Lam',
    email: 'test@example.com',
    pronouns: 'he/him',
    notifications: true,
    location: 'Davis, CA',
    karmaScore: 0,
    profileImage: null
  });

  // State for form fields
  const [name, setName] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [phone, setPhone] = useState(userData.phone);
  const [pronouns, setPronouns] = useState(userData.pronouns);
  const [notificationsEnabled, setNotificationsEnabled] = useState(userData.notifications);
  const [karmaScore, setKarmaScore] = useState(userData.karmaScore);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from AsyncStorage when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        // Try to get profile data from AsyncStorage
        const storedProfile = await AsyncStorage.getItem('userProfile');
        
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setUserData(profile);
          
          setName(profile.name);
          setEmail(profile.email);
          setPhone(profile.phone);
          setPronouns(profile.pronouns);
          setNotificationsEnabled(profile.notifications);
          setKarmaScore(profile.karmaScore);
          setProfileImage(profile.profileImage);
        }
      } catch (error) {
        console.error('Error loading user data from storage:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const handleSave = async () => {
    try {
      // Create updated profile data
      const updatedProfile = {
        name,
        email,
        phone,
        pronouns,
        notifications: notificationsEnabled,
        location: userData.location,
        karmaScore: karmaScore,
        profileImage
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // Update state
      setUserData(updatedProfile);
      
      // Show success message
      Alert.alert('Success', 'Your profile has been updated!');
    } catch (error) {
      console.error('Error saving profile data:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              // Clear local profile data
              await AsyncStorage.removeItem('userProfile');
              router.replace('/login');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const goBack = () => {
    router.back();
  };

  const handleChangeProfilePicture = async () => {
    try {
      // Request permission to access the photo library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
        return;
      }
      
      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Set the selected image URI
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error changing profile picture:', error);
      Alert.alert('Error', 'Failed to change profile picture. Please try again.');
    }
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
          <Text style={styles.headerTitle}>Profile Settings</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile Picture Section */}
          <View style={styles.profilePictureSection}>
            <Image 
              source={profileImage ? { uri: profileImage } : require('../assets/profile-placeholder.png')}
              style={styles.profilePicture}
            />
            <TouchableOpacity onPress={handleChangeProfilePicture} style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Change Profile Picture</Text>
            </TouchableOpacity>
          </View>

          {/* Karma Score Section */}
          <View style={styles.karmaSection}>
            <Text style={styles.karmaTitleText}>Karma Score</Text>
            <View style={styles.karmaScoreContainer}>
              <Text style={styles.karmaScoreText}>{karmaScore}</Text>
            </View>
            <Text style={styles.karmaDescriptionText}>
              Your karma increases when you help reconnect people with their lost items
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
            />
            
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Your Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Pronouns</Text>
            <TextInput
              style={styles.input}
              value={pronouns}
              onChangeText={setPronouns}
              placeholder="Your Pronouns"
            />
          </View>

          {/* Settings Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#E0E0E0", true: "#8AD3A3" }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Location</Text>
              <Text style={styles.settingValue}>{userData.location}</Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
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
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveButtonText: {
    color: '#8AD3A3',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changePhotoButton: {
    marginTop: 10,
  },
  changePhotoText: {
    color: '#8AD3A3',
    fontWeight: '500',
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
  formSection: {
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
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 