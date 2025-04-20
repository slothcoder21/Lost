import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Preset item titles
const PRESET_ITEMS = [
  'Water Bottle', 
  'Backpack', 
  'Laptop', 
  'Phone', 
  'Keys', 
  'Wallet',
  'Notebook',
  'Headphones',
  'Umbrella',
  'Jacket',
  'Pencil',
  'ID Card'
];

export default function ListItemPage() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [userName, setUserName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Found'); // Default to 'Found', options are 'Lost' or 'Found'

  // Ask for camera permissions and launch camera
  const launchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission',
          'We need camera permission to take a picture of the item.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try gallery option.');
    }
  };

  // Pick an image from the gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Select a preset item title
  const selectPresetItem = (presetTitle) => {
    setTitle(presetTitle);
  };

  // Submit the form
  const handleSubmit = async () => {
    // Validate form
    if (!image) {
      Alert.alert('Missing Image', 'Please take a picture of the item');
      return;
    }
    if (!title) {
      Alert.alert('Missing Title', 'Please enter a title for the item');
      return;
    }
    if (!location) {
      Alert.alert('Missing Location', 'Please enter where the item was found');
      return;
    }

    setLoading(true);

    // Here you would typically upload the data to your server
    // For now we'll just simulate a delay
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success',
        `Your ${status === 'Lost' ? 'lost' : 'found'} item has been listed successfully!`,
        [
          { 
            text: 'OK', 
            onPress: () => router.push('/home') 
          }
        ]
      );
    }, 1500);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{status === 'Lost' ? 'Report Lost Item' : 'List Found Item'}</Text>
            <View style={styles.headerRight} />
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status Selection */}
            <View style={styles.statusSelectionWrapper}>
              <Text style={styles.statusSelectionTitle}>What would you like to do?</Text>
              <View style={styles.statusSelectionContainer}>
                <TouchableOpacity 
                  style={[
                    styles.statusOption, 
                    styles.foundStatus,
                    status === 'Found' && styles.foundStatusSelected
                  ]}
                  onPress={() => setStatus('Found')}
                >
                  {status === 'Found' && <View style={styles.selectedIndicatorGreen} />}
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color={status === 'Found' ? '#fff' : 'rgba(46, 139, 87, 0.8)'} 
                    style={styles.statusIcon}
                  />
                  <Text style={[
                    styles.statusText,
                    status === 'Found' && styles.statusTextSelected
                  ]}>
                    I Found Something
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.statusOption, 
                    styles.lostStatus,
                    status === 'Lost' && styles.lostStatusSelected
                  ]}
                  onPress={() => setStatus('Lost')}
                >
                  {status === 'Lost' && <View style={styles.selectedIndicatorRed} />}
                  <Ionicons 
                    name="search" 
                    size={24} 
                    color={status === 'Lost' ? '#fff' : 'rgba(192, 57, 43, 0.8)'} 
                    style={styles.statusIcon}
                  />
                  <Text style={[
                    styles.statusText,
                    status === 'Lost' && styles.statusTextSelected
                  ]}>
                    I Lost Something
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Item Image Section */}
            <View style={styles.imageSection}>
              {image ? (
                <TouchableOpacity onPress={launchCamera}>
                  <Image source={{ uri: image }} style={styles.itemImage} />
                  <View style={styles.editImageOverlay}>
                    <Text style={styles.editImageText}>Change Photo</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.addPhotoButton} 
                  onPress={launchCamera}
                >
                  <Ionicons name="camera" size={40} color="#888" />
                  <Text style={styles.addPhotoText}>Take a Photo</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                <Ionicons name="images-outline" size={20} color="#8AD3A3" />
                <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>

            {/* Item Information Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Item Information</Text>
              
              {/* Title Input */}
              <Text style={styles.inputLabel}>Title*</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder={status === 'Lost' ? "What did you lose?" : "What did you find?"}
                placeholderTextColor="#999"
              />
              
              {/* Preset Items */}
              <Text style={styles.presetLabel}>Common Items:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.presetsContainer}
              >
                {PRESET_ITEMS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.presetItem,
                      title === item && styles.selectedPresetItem
                    ]}
                    onPress={() => selectPresetItem(item)}
                  >
                    <Text 
                      style={[
                        styles.presetItemText,
                        title === item && styles.selectedPresetItemText
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
      
              <Text style={styles.inputLabel}>{status === 'Lost' ? "Where did you lose it?*" : "Where was it found?*"}</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder={status === 'Lost' ? "Location where you lost the item" : "Location where you found the item"}
                placeholderTextColor="#999"
              />
              
              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder={status === 'Lost' ? "Any additional details about the item or where you lost it" : "Any additional details about the item or where it was found"}
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.submitButtonText}>
                {status === 'Lost' ? "Report Lost Item" : "List Found Item"}
              </Text>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
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
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageSection: {
    backgroundColor: 'white',
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addPhotoButton: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  addPhotoText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
  itemImage: {
    width: '100%',
    height: 250,
    borderRadius: 20,
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  editImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  galleryButtonText: {
    color: '#8AD3A3',
    marginLeft: 6,
    fontSize: 16,
  },
  formSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  presetLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  presetsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  presetItem: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedPresetItem: {
    backgroundColor: '#8AD3A3',
    borderColor: '#8AD3A3',
  },
  presetItemText: {
    color: '#333',
    fontSize: 14,
  },
  selectedPresetItemText: {
    color: 'black',
  },
  submitButton: {
    backgroundColor: '#8AD3A3',
    paddingVertical: 16,
    borderRadius: 30,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  submitButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '500',
  },
  statusSelectionWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  statusSelectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  statusSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderRadius: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  foundStatus: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderColor: 'rgba(46, 204, 113, 0.5)',
  },
  lostStatus: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: 'rgba(231, 76, 60, 0.5)',
  },
  foundStatusSelected: {
    backgroundColor: 'rgba(46, 204, 113, 0.9)',
    borderColor: '#fff',
    shadowColor: 'rgba(46, 204, 113, 0.5)',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    transform: [{scale: 1.03}],
  },
  lostStatusSelected: {
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    borderColor: '#fff',
    shadowColor: 'rgba(231, 76, 60, 0.5)',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    transform: [{scale: 1.03}],
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusTextSelected: {
    fontWeight: '700',
    color: '#fff',
  },
  selectedIndicatorGreen: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(46, 204, 113, 0.9)',
    zIndex: 2,
  },
  selectedIndicatorRed: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(231, 76, 60, 0.9)',
    zIndex: 2,
  },
}); 