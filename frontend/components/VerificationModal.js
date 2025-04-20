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
  Switch,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Progress indicator for verification process
const VerificationProgress = ({ progress, status }) => {
  // Different colors based on status
  const getStatusColor = () => {
    switch(status) {
      case 'verification_requested':
        return '#FFA000'; // Amber
      case 'verification_in_progress':
        return '#2196F3'; // Blue
      case 'verification_approved':
        return '#4CAF50'; // Green
      case 'awaiting_verification':
        return '#FF5722'; // Deep Orange
      default:
        return '#8AD3A3'; // Default app green
    }
  };
  
  // Different text based on status
  const getStatusText = () => {
    switch(status) {
      case 'verification_requested':
        return 'Verification Needed';
      case 'verification_in_progress':
        return 'Verifying...';
      case 'verification_approved':
        return 'Verified!';
      case 'awaiting_verification':
        return 'Awaiting Verification';
      default:
        return 'In Progress';
    }
  };
  
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBarOuter}>
        <View 
          style={[
            styles.progressBarInner, 
            { 
              width: `${progress}%`,
              backgroundColor: getStatusColor()
            }
          ]} 
        />
      </View>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressPercentage}>{progress}%</Text>
        <Text style={[styles.progressStatus, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
    </View>
  );
};

export default function VerificationModal({ 
  visible, 
  onClose, 
  onSubmit, 
  itemName, 
  itemType = 'found',
  verificationStatus = 'verification_requested',
  verificationProgress = 0 
}) {
  const [verificationMethod, setVerificationMethod] = useState(null);
  const [uniqueDetails, setUniqueDetails] = useState('');
  const [verificationImage, setVerificationImage] = useState(null);
  const [sendAsMessage, setSendAsMessage] = useState(true);
  const [useLiveCamera, setUseLiveCamera] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Reset form when modal is opened
  useEffect(() => {
    if (visible) {
      setVerificationMethod(null);
      setUniqueDetails('');
      setVerificationImage(null);
      setSendAsMessage(true);
      setUseLiveCamera(true);
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleSubmit = () => {
    if (verificationMethod === 'photo' && !verificationImage) {
      Alert.alert('Missing Image', 'Please upload a photo of your item');
      return;
    }
    
    if (verificationMethod === 'details' && !uniqueDetails.trim()) {
      Alert.alert('Missing Details', 'Please provide unique details about your item');
      return;
    }

    // Show submitting state
    setIsSubmitting(true);

    // Simulate an API call with a delay
    setTimeout(() => {
      // Submit verification data with improved metadata
      onSubmit({
        method: verificationMethod,
        details: uniqueDetails.trim(),
        image: verificationImage,
        timestamp: new Date().toISOString(),
        status: 'pending',
        reviewed: false,
        livePhoto: verificationMethod === 'photo' ? useLiveCamera : null,
        sendAsMessage: sendAsMessage
      });

      // Reset form
      setVerificationMethod(null);
      setUniqueDetails('');
      setVerificationImage(null);
      setIsSubmitting(false);
    }, 1500); // Simulate network delay
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setVerificationImage(result.assets[0].uri);
        setUseLiveCamera(false); // If from gallery, not a live photo
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
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setVerificationImage(result.assets[0].uri);
        setUseLiveCamera(true); // This is a live photo
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try gallery option.');
    }
  };

  // Determine if we are viewing a submitted verification or creating one
  const isViewingMode = verificationStatus === 'verification_in_progress' || 
                       verificationStatus === 'verification_approved';

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
            <Text style={styles.title}>
              {isViewingMode ? 'Verification Status' : 'Verify Ownership'}
            </Text>
            
            <Text style={styles.subtitle}>
              {isViewingMode 
                ? `Verification for ${itemName} is being processed` 
                : `Please verify that this ${itemName} belongs to you`}
            </Text>
            
            {/* Verification Progress */}
            <VerificationProgress 
              progress={verificationProgress} 
              status={verificationStatus} 
            />
            
            {itemType === 'found' && !isViewingMode && (
              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={18} color="#4A6572" />
                <Text style={styles.securityBadgeText}>
                  Secure Verification Required
                </Text>
              </View>
            )}
            
            {isViewingMode ? (
              // Viewing verification status
              <View style={styles.verificationStatusContainer}>
                <View style={[
                  styles.statusIconContainer,
                  { backgroundColor: verificationStatus === 'verification_approved' ? '#E8F5E9' : '#E3F2FD' }
                ]}>
                  <Ionicons 
                    name={verificationStatus === 'verification_approved' ? "checkmark-circle" : "time-outline"} 
                    size={40} 
                    color={verificationStatus === 'verification_approved' ? "#4CAF50" : "#2196F3"} 
                  />
                </View>
                
                <Text style={styles.statusTitle}>
                  {verificationStatus === 'verification_approved' 
                    ? 'Verification Approved!' 
                    : 'Verification In Progress'}
                </Text>
                
                <Text style={styles.statusMessage}>
                  {verificationStatus === 'verification_approved' 
                    ? 'Your verification has been accepted. You can now arrange a meetup to recover your item.' 
                    : 'Your verification is being reviewed. We\'ll notify you as soon as it\'s approved.'}
                </Text>
                
                {verificationStatus === 'verification_approved' && (
                  <TouchableOpacity 
                    style={styles.arrangeMeetupButton}
                    onPress={onClose}
                  >
                    <Text style={styles.arrangeMeetupButtonText}>
                      Arrange Meetup
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              // Verification Method Selection
              <>
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
                    <Text style={styles.detailsInstructions}>
                      Please upload a photo of your item taken before it was lost. 
                      This helps confirm your ownership.
                    </Text>
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
                    
                    {/* Add a notice about live photos vs. gallery photos */}
                    {verificationImage && (
                      <View style={styles.photoSourceNotice}>
                        <Ionicons 
                          name={useLiveCamera ? "checkmark-circle" : "alert-circle"} 
                          size={18} 
                          color={useLiveCamera ? "#66B289" : "#FFA000"} 
                        />
                        <Text style={styles.photoSourceNoticeText}>
                          {useLiveCamera 
                            ? "Live photo taken now (preferred for verification)" 
                            : "Photo from gallery (may require additional verification)"}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                
                {/* Unique Details Section */}
                {verificationMethod === 'details' && (
                  <View style={styles.verificationSection}>
                    <Text style={styles.sectionTitle}>Provide Unique Details</Text>
                    <Text style={styles.detailsInstructions}>
                      Describe specific details about the item that only the owner would know.
                      Include distinguishing features like:
                    </Text>
                    <View style={styles.detailsSuggestions}>
                      <Text style={styles.detailsSuggestion}>• Marks, scratches, or stickers</Text>
                      <Text style={styles.detailsSuggestion}>• Serial number or identifying codes</Text>
                      <Text style={styles.detailsSuggestion}>• Contents of the item (if applicable)</Text>
                      <Text style={styles.detailsSuggestion}>• Custom modifications</Text>
                      <Text style={styles.detailsSuggestion}>• When and where you got the item</Text>
                    </View>
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
                
                {/* Send as Message Option */}
                {verificationMethod && (
                  <View style={styles.sendAsMessageContainer}>
                    <Text style={styles.sendAsMessageText}>
                      Send as chat message
                    </Text>
                    <Switch
                      value={sendAsMessage}
                      onValueChange={setSendAsMessage}
                      trackColor={{ false: '#ccc', true: '#8AD3A3' }}
                      thumbColor={sendAsMessage ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                )}
                
                {/* Submit Button */}
                {verificationMethod && (
                  <TouchableOpacity 
                    style={[
                      styles.submitButton,
                      isSubmitting && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <View style={styles.submittingContainer}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.submitButtonText}>
                          Submitting...
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {sendAsMessage ? "Send Verification" : "Submit Verification"}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                
                {/* Security Notice */}
                {verificationMethod && (
                  <Text style={styles.securityNotice}>
                    Verification helps protect both parties and ensures items are returned to their rightful owners.
                  </Text>
                )}
              </>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingBottom: 20,
  },
  dragIndicatorContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBarOuter: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarInner: {
    height: 8,
    borderRadius: 4,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 24,
  },
  securityBadgeText: {
    fontSize: 14,
    color: '#4A6572',
    fontWeight: '600',
    marginLeft: 6,
  },
  verificationStatusContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 24,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  arrangeMeetupButton: {
    backgroundColor: '#8AD3A3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  arrangeMeetupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  methodSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  methodOption: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodOptionSelected: {
    borderColor: '#8AD3A3',
    backgroundColor: '#E8F5E9',
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  methodDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  verificationSection: {
    marginBottom: 24,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  detailsInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  detailsSuggestions: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  detailsSuggestion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  detailsInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  itemImage: {
    width: 240,
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  editImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  addPhotoButton: {
    width: 240,
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  addPhotoText: {
    fontSize: 16,
    color: '#888',
    marginTop: 12,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  galleryButtonText: {
    fontSize: 14,
    color: '#8AD3A3',
    marginLeft: 6,
    fontWeight: '500',
  },
  photoSourceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  photoSourceNoticeText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  sendAsMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  sendAsMessageText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#8AD3A3',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#A9D7B9',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityNotice: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
}); 