import React, { useRef, useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import VerificationModal from './VerificationModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ItemDetailModal({ visible, item, onClose, onClaim }) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  
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

  // Format date to a readable string
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date instanceof Date ? date.toLocaleDateString('en-US', options) : '';
  };

  const handleClaimButtonPress = () => {
    // If the item is already claimed, show contact owner
    if (item.status === 'Lost') {
      handleClaim();
    } else {
      // For found items, show verification modal
      setVerificationModalVisible(true);
    }
  };

  const handleClaim = () => {
    onClose();
    if (onClaim) {
      onClaim(item);
    } else {
      router.push(`/chat?userId=user-${item.id}`);
    }
  };

  const handleVerificationSubmit = (verificationData) => {
    // Close the verification modal
    setVerificationModalVisible(false);
    
    // Here you would typically send the verification data to your backend
    // For now, we'll just show a success message and proceed to chat
    Alert.alert(
      'Verification Submitted',
      'Your ownership claim has been submitted. The finder will review your verification.',
      [
        { 
          text: 'OK', 
          onPress: handleClaim
        }
      ]
    );
  };

  const handleViewProfile = () => {
    // Close the modal and navigate to the user's profile
    onClose();
    
    // Use the item ID as the user ID for test profiles
    const userId = `user-${item.id}`;
    router.push(`/user-profile?userId=${userId}`);
  };

  if (!item) return null;

  return (
    <>
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
              {/* Item Status */}
              <View style={[
                styles.statusContainer, 
                item.status === 'Lost' ? styles.lostStatus : styles.foundStatus
              ]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
              
              {/* Item Image */}
              <View style={styles.imageContainer}>
                {item.image ? (
                  <Image 
                    source={item.image} 
                    style={styles.itemImage} 
                    resizeMode="cover" 
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={80} color="#ccc" />
                  </View>
                )}
              </View>
              
              {/* Item Title */}
              <Text style={styles.itemTitle}>{item.title}</Text>
              
              {/* Date and Location */}
              <View style={styles.detailsContainer}>
                {item.date && (
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={18} color="#555" />
                    <Text style={styles.detailText}>{formatDate(item.date)}</Text>
                  </View>
                )}
                
                {item.location && (
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={18} color="#555" />
                    <Text style={styles.detailText}>{item.location}</Text>
                  </View>
                )}
              </View>
              
              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{item.description}</Text>
              </View>
              
              {/* Found By Info */}
              <View style={styles.founderContainer}>
                <Text style={styles.sectionTitle}>
                  {item.status === 'Lost' ? 'Reported By' : 'Found By'}
                </Text>
                <TouchableOpacity 
                  style={styles.founderProfile}
                  onPress={handleViewProfile}
                >
                  {item.foundBy.image ? (
                    <Image 
                      source={item.foundBy.image} 
                      style={styles.profileImage} 
                    />
                  ) : (
                    <View style={styles.profilePlaceholder}>
                      <Ionicons name="person" size={24} color="#FFF" />
                    </View>
                  )}
                  <View style={styles.founderInfo}>
                    <Text style={styles.founderName}>{item.foundBy.name}</Text>
                    <View style={styles.viewProfileContainer}>
                      <Text style={styles.viewProfileText}>View Profile</Text>
                      <Ionicons name="chevron-forward" size={16} color="#8AD3A3" />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
              
              {/* Claim Button */}
              <TouchableOpacity 
                style={styles.claimButton} 
                onPress={handleClaimButtonPress}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#000" style={styles.buttonIcon} />
                <Text style={styles.claimButtonText}>
                  {item.status === 'Lost' ? "Contact Owner" : "Claim Item"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Verification Modal */}
      <VerificationModal
        visible={verificationModalVisible}
        onClose={() => setVerificationModalVisible(false)}
        onSubmit={handleVerificationSubmit}
        itemName={item ? item.title : ''}
      />
    </>
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 20, // Extra padding for iOS
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
  statusContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 16,
  },
  lostStatus: {
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
  },
  foundStatus: {
    backgroundColor: 'rgba(46, 204, 113, 0.9)',
  },
  statusText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 14,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 8,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  founderContainer: {
    marginBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  founderProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  founderInfo: {
    flex: 1,
  },
  founderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  viewProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  viewProfileText: {
    fontSize: 14,
    color: '#8AD3A3',
    fontWeight: '500',
  },
  claimButton: {
    backgroundColor: '#8AD3A3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
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
  buttonIcon: {
    marginRight: 8,
  },
  claimButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
}); 