import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Image,
  Animated,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VerificationModal({ visible, onClose, onSubmit, itemName }) {
  const [verificationMethod, setVerificationMethod] = useState(null);
  const [uniqueDetails, setUniqueDetails] = useState('');
  const [verificationImage, setVerificationImage] = useState(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleSubmit = () => {
    if (verificationMethod === 'photo' && !verificationImage) {
      Alert.alert('Missing Image', 'Please upload a photo of your item');
      return;
    }
    
    if (verificationMethod === 'details' && !uniqueDetails.trim()) {
      Alert.alert('Missing Details', 'Please provide unique details about your item');
      return;
    }

    // Submit verification data
    onSubmit({
      method: verificationMethod,
      details: uniqueDetails.trim(),
      image: verificationImage,
    });

    // Reset form
    setVerificationMethod(null);
    setUniqueDetails('');
    setVerificationImage(null);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setVerificationImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const launchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission',
          'We need camera permission to take a picture.',
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
        setVerificationImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try gallery option.');
    }
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBackground} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.dragIndicatorContainer}>
            <View style={styles.dragIndicator} />
          </View>
          
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.title}>Verify Ownership</Text>
            <Text style={styles.subtitle}>
              Please verify that this {itemName} belongs to you by choosing one of the options below
            </Text>
            
            {/* Verification Method Selection */}
            <View style={styles.methodSelectionContainer}>
              {/* Photo Option */}
              <TouchableOpacity 
                style={[
                  styles.methodOption, 
                  verificationMethod === 'photo' && styles.methodOptionSelected
                ]}
                onPress={() => setVerificationMethod('photo')}
              >
                <View style={styles.methodIconContainer}>
                  <Ionicons name="camera" size={24} color={verificationMethod === 'photo' ? '#fff' : '#8AD3A3'} />
                </View>
                <Text style={styles.methodTitle}>Upload a Photo</Text>
                <Text style={styles.methodDescription}>
                  Share a photo of your item taken before it was lost
                </Text>
              </TouchableOpacity>
              
              {/* Unique Details Option */}
              <TouchableOpacity 
                style={[
                  styles.methodOption, 
                  verificationMethod === 'details' && styles.methodOptionSelected
                ]}
                onPress={() => setVerificationMethod('details')}
              >
                <View style={styles.methodIconContainer}>
                  <Ionicons name="list" size={24} color={verificationMethod === 'details' ? '#fff' : '#8AD3A3'} />
                </View>
                <Text style={styles.methodTitle}>Provide Unique Details</Text>
                <Text style={styles.methodDescription}>
                  Describe specific details only the owner would know
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Photo Upload Section */}
            {verificationMethod === 'photo' && (
              <View style={styles.verificationSection}>
                <Text style={styles.sectionTitle}>Upload a Photo</Text>
                <View style={styles.imageSection}>
                  {verificationImage ? (
                    <TouchableOpacity onPress={launchCamera}>
                      <Image source={{ uri: verificationImage }} style={styles.itemImage} />
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
              </View>
            )}
            
            {/* Unique Details Section */}
            {verificationMethod === 'details' && (
              <View style={styles.verificationSection}>
                <Text style={styles.sectionTitle}>Provide Unique Details</Text>
                <Text style={styles.detailsInstructions}>
                  Describe specific details about the item that only the owner would know
                  (e.g., marks, scratches, stickers, contents, serial numbers)
                </Text>
                <TextInput
                  style={styles.detailsInput}
                  placeholder="Describe unique details here..."
                  value={uniqueDetails}
                  onChangeText={setUniqueDetails}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
            )}
            
            {/* Submit Button */}
            {verificationMethod && (
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Submit Verification</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  dragIndicatorContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  methodSelectionContainer: {
    marginBottom: 24,
  },
  methodOption: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodOptionSelected: {
    backgroundColor: '#8AD3A3',
    borderColor: '#66B289',
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  verificationSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  imageSection: {
    alignItems: 'center',
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
  detailsInstructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#8AD3A3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
}); 