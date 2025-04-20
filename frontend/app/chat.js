import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  Alert,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTestUserProfile } from '../services/testProfileService';
import VerificationModal from '../components/VerificationModal';
import ImagePicker from 'react-native-image-picker';

// Verification Banner Component
const VerificationBanner = ({ onPress, status, progress }) => {
  // Helper functions to determine banner appearance based on status
  const getBannerStyle = () => {
    switch(status) {
      case 'verification_requested':
        return [styles.verificationBanner, styles.requestedBanner];
      case 'awaiting_verification':
        return [styles.verificationBanner, styles.awaitingBanner];
      case 'verification_in_progress':
        return [styles.verificationBanner, styles.pendingBanner];
      case 'verification_approved':
        return [styles.verificationBanner, styles.approvedBanner];
      case 'meetup_arranged':
        return [styles.verificationBanner, styles.meetupBanner];
      case 'item_returned':
        return [styles.verificationBanner, styles.returnedBanner];
      default:
        return [styles.verificationBanner, styles.pendingBanner];
    }
  };
  
  const getIcon = () => {
    switch(status) {
      case 'verification_requested':
        return {name: "shield-outline", color: "#FFA000"};
      case 'awaiting_verification':
        return {name: "hourglass-outline", color: "#FF5722"};
      case 'verification_in_progress':
        return {name: "time-outline", color: "#2196F3"};
      case 'verification_approved':
        return {name: "shield-checkmark", color: "#4CAF50"};
      case 'meetup_arranged':
        return {name: "calendar", color: "#9C27B0"};
      case 'item_returned':
        return {name: "checkmark-circle", color: "#8AD3A3"};
      default:
        return {name: "alert-circle", color: "#FFA000"};
    }
  };
  
  const getTitle = () => {
    switch(status) {
      case 'verification_requested':
        return "Verification Required";
      case 'awaiting_verification':
        return "Waiting for Verification";
      case 'verification_in_progress':
        return "Verification In Progress";
      case 'verification_approved':
        return "Ownership Verified";
      case 'meetup_arranged':
        return "Meetup Arranged";
      case 'item_returned':
        return "Item Returned";
      default:
        return "Verification Pending";
    }
  };
  
  const getDescription = () => {
    switch(status) {
      case 'verification_requested':
        return "Please provide verification to confirm this is your item";
      case 'awaiting_verification':
        return "Waiting for the user to verify their ownership";
      case 'verification_in_progress':
        return "Your verification is being reviewed by the finder";
      case 'verification_approved':
        return "The finder has confirmed your ownership claim";
      case 'meetup_arranged':
        return "You've arranged to meet to exchange the item";
      case 'item_returned':
        return "This item has been returned to its owner";
      default:
        return "Verification is in progress";
    }
  };
  
  const icon = getIcon();
  
  return (
    <TouchableOpacity 
      style={getBannerStyle()}
      onPress={onPress}
    >
      <Ionicons 
        name={icon.name}
        size={24} 
        color={icon.color}
      />
      <View style={styles.bannerTextContainer}>
        <Text style={styles.bannerTitle}>
          {getTitle()}
        </Text>
        <Text style={styles.bannerDescription}>
          {getDescription()}
        </Text>
      </View>
      {(status === 'verification_requested' || status === 'awaiting_verification') && (
        <Ionicons name="chevron-forward" size={20} color={icon.color} />
      )}
      
      {/* Progress indicator for in-progress verification */}
      {status === 'verification_in_progress' && progress < 100 && (
        <View style={styles.miniProgressContainer}>
          <View style={styles.miniProgressBg}>
            <View 
              style={[
                styles.miniProgressFill, 
                {width: `${progress}%`}
              ]} 
            />
          </View>
          <Text style={styles.miniProgressText}>{progress}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Verification Review Modal Component
const VerificationReviewModal = ({ visible, onClose, data, onApprove, onReject, isUserSubmittedVerification = false }) => {
  if (!data) return null;
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.verificationModalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.verificationModalBg} />
        </TouchableWithoutFeedback>
        
        <View style={styles.verificationModalContent}>
          <View style={styles.verificationModalHeader}>
            <Text style={styles.verificationModalTitle}>
              {isUserSubmittedVerification 
                ? "Review Ownership Claim" 
                : "Verify This Is Your Item"}
            </Text>
            <TouchableOpacity style={styles.verificationModalCloseBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.verificationModalScroll}>
            <Text style={styles.verificationModalSubtitle}>
              {isUserSubmittedVerification
                ? "The user has submitted the following verification:"
                : "Review this verification to confirm it's your item:"}
            </Text>
            
            {data.method === 'photo' && (
              <View style={styles.verificationPhotoContainer}>
                <Text style={styles.verificationSectionTitle}>Photo Verification</Text>
                <Text style={styles.verificationInstructions}>
                  {isUserSubmittedVerification
                    ? "The user has uploaded a photo of the item before it was lost. Compare this with the item you found."
                    : "The finder has sent this photo of your item."}
                </Text>
                {data.image && (
                  <Image 
                    source={{ uri: data.image }} 
                    style={styles.verificationImage} 
                    resizeMode="cover"
                  />
                )}
              </View>
            )}
            
            {data.method === 'details' && (
              <View style={styles.verificationDetailsContainer}>
                <Text style={styles.verificationSectionTitle}>Unique Details</Text>
                <Text style={styles.verificationInstructions}>
                  {isUserSubmittedVerification
                    ? "The user has provided unique details about the item that only the owner would know:"
                    : "The finder has provided these details about your item:"}
                </Text>
                <View style={styles.verificationDetailsBox}>
                  <Text style={styles.verificationDetailsText}>{data.details}</Text>
                </View>
              </View>
            )}
            
            <Text style={styles.verificationQuestion}>
              {isUserSubmittedVerification
                ? "Does this verification match the item you found?"
                : "Does this look like your lost item?"}
            </Text>
            
            <View style={styles.verificationActions}>
              <TouchableOpacity 
                style={styles.rejectButton}
                onPress={onReject}
              >
                <Text style={styles.rejectButtonText}>
                  {isUserSubmittedVerification ? "Reject" : "Not Mine"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.approveButton}
                onPress={onApprove}
              >
                <Text style={styles.approveButtonText}>
                  {isUserSubmittedVerification ? "Approve" : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// VerificationMessageAttachment - Component to handle verification info inside chat messages
const VerificationMessageAttachment = ({ data, onAction, userRole }) => {
  if (!data) return null;

  // Get styles based on verification status
  const getStatusStyles = () => {
    if (!data.status) return {};
    
    switch(data.status) {
      case 'pending':
        return {
          color: "#FFA000",
          backgroundColor: "#FFF8E1",
          borderColor: "#FFECB3",
          icon: "shield-outline",
          text: "Verification Requested"
        };
      case 'submitted':
        return {
          color: "#2196F3",
          backgroundColor: "#E3F2FD",
          borderColor: "#BBDEFB",
          icon: "document-text-outline",
          text: "Verification Submitted"
        };
      case 'reviewing':
        return {
          color: "#2196F3",
          backgroundColor: "#E3F2FD",
          borderColor: "#BBDEFB",
          icon: "time-outline",
          text: "Under Review"
        };
      case 'approved':
        return {
          color: "#4CAF50",
          backgroundColor: "#E8F5E9",
          borderColor: "#C8E6C9",
          icon: "checkmark-circle",
          text: "Verified"
        };
      case 'rejected':
        return {
          color: "#F44336",
          backgroundColor: "#FFEBEE",
          borderColor: "#FFCDD2",
          icon: "close-circle",
          text: "Rejected"
        };
      default:
        return {
          color: "#4A6572",
          backgroundColor: "#F5F5F5",
          borderColor: "#E0E0E0",
          icon: "shield-checkmark",
          text: "Ownership Verification"
        };
    }
  };

  const statusStyles = getStatusStyles();

  // Different UI based on whether this is a photo or details verification
  return (
    <View style={[
      styles.verificationAttachment,
      { 
        backgroundColor: statusStyles.backgroundColor,
        borderColor: statusStyles.borderColor 
      }
    ]}>
      <View style={styles.verificationAttachmentHeader}>
        <Ionicons name={statusStyles.icon} size={16} color={statusStyles.color} />
        <Text style={[
          styles.verificationAttachmentTitle,
          { color: statusStyles.color }
        ]}>{statusStyles.text}</Text>
      </View>
      
      {data.method === 'photo' && data.image && (
        <TouchableOpacity 
          onPress={() => onAction && onAction('view-image', data)}
          style={styles.verificationAttachmentImageContainer}
        >
          <Image 
            source={{ uri: data.image }} 
            style={styles.verificationAttachmentImage} 
            resizeMode="cover"
          />
          <View style={styles.verificationAttachmentImageOverlay}>
            <Text style={styles.verificationAttachmentImageText}>View Photo</Text>
          </View>
        </TouchableOpacity>
      )}
      
      {data.method === 'details' && data.details && (
        <View style={styles.verificationAttachmentDetails}>
          <Text style={styles.verificationAttachmentDetailsText}>{data.details}</Text>
        </View>
      )}
      
      {data.status === 'pending' && userRole === 'owner' && (
        <TouchableOpacity 
          style={styles.verificationAttachmentRespondBtn}
          onPress={() => onAction && onAction('respond', data)}
        >
          <Text style={styles.verificationAttachmentRespondText}>Provide Verification</Text>
        </TouchableOpacity>
      )}
      
      {data.status === 'submitted' && userRole === 'finder' && (
        <View style={styles.verificationAttachmentActions}>
          <TouchableOpacity 
            style={styles.verificationAttachmentRejectBtn}
            onPress={() => onAction && onAction('reject', data)}
          >
            <Text style={styles.verificationAttachmentRejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.verificationAttachmentApproveBtn}
            onPress={() => onAction && onAction('approve', data)}
          >
            <Text style={styles.verificationAttachmentApproveText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Attachment Button for sending photos/verification
const AttachmentButton = ({ onPress, isActive }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.attachmentButton, 
        isActive && styles.attachmentButtonActive
      ]} 
      onPress={onPress}
    >
      <Ionicons 
        name="camera" 
        size={24} 
        color={isActive ? "#8AD3A3" : "#999"} 
      />
    </TouchableOpacity>
  );
};

// Photo Preview component that shows in the input area
const PhotoPreview = ({ uri, onRemove }) => {
  return (
    <View style={styles.photoPreviewContainer}>
      <Image 
        source={{ uri }} 
        style={styles.photoPreviewImage} 
        resizeMode="cover"
      />
      <TouchableOpacity 
        style={styles.photoPreviewRemoveButton}
        onPress={onRemove}
      >
        <Ionicons name="close-circle" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

// Full-screen Image Viewer modal
const ImageViewerModal = ({ visible, uri, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.imageViewerContainer}>
        <TouchableOpacity 
          style={styles.imageViewerCloseButton}
          onPress={onClose}
        >
          <Ionicons name="close" size={30} color="#FFF" />
        </TouchableOpacity>
        
        <Image 
          source={{ uri }} 
          style={styles.imageViewerImage} 
          resizeMode="contain"
        />
      </View>
    </Modal>
  );
};

// Add this component for showing meetup banner
const MeetupBanner = ({ meetupData }) => {
  const formattedTime = meetupData?.time || '3:30 PM';
  const location = meetupData?.location || 'the Silo';
  const date = meetupData?.date || 'today';

  return (
    <View style={styles.meetupBanner}>
      <View style={styles.meetupIconContainer}>
        <Ionicons name="calendar" size={28} color="#9C27B0" />
      </View>
      <View style={styles.meetupContent}>
        <Text style={styles.meetupTitle}>Meetup Arranged</Text>
        <Text style={styles.meetupDetails}>
          {`Meeting at ${location}, ${date} at ${formattedTime}`}
        </Text>
      </View>
    </View>
  );
};

// Add this component for karma request banner
const KarmaBanner = ({ onGiveKarma }) => {
  return (
    <TouchableOpacity style={styles.karmaBanner} onPress={onGiveKarma}>
      <View style={styles.karmaIconContainer}>
        <Ionicons name="star" size={28} color="#FFC107" />
      </View>
      <View style={styles.karmaContent}>
        <Text style={styles.karmaTitle}>Karma Requested</Text>
        <Text style={styles.karmaDetails}>
          This user helped return your lost item. Tap to give karma points!
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#FFC107" />
    </TouchableOpacity>
  );
};

export default function ChatPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId; // Extract userId directly from params
  const conversationId = userId ? parseInt(userId.replace('user-', '')) : (params.id ? parseInt(params.id) : 1);
  
  const [message, setMessage] = useState('');
  const [showKarmaModal, setShowKarmaModal] = useState(false);
  const [karmaGiven, setKarmaGiven] = useState(false);
  const [showVerificationReviewModal, setShowVerificationReviewModal] = useState(false);
  
  // Updated verification status handling from URL params
  const [verificationStatus, setVerificationStatus] = useState(params.verificationStatus || 'none');
  const [verificationProgress, setVerificationProgress] = useState(
    params.verificationProgress ? parseInt(params.verificationProgress) : 0
  );
  
  const [verificationData, setVerificationData] = useState(null);
  const [showUploadVerificationModal, setShowUploadVerificationModal] = useState(false);
  
  // New state for attachment functionality
  const [isAttachmentActive, setIsAttachmentActive] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const [attachedPhotoType, setAttachedPhotoType] = useState(null); // 'verification' or 'message'
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewingImageUri, setViewingImageUri] = useState(null);
  
  // User profile photo (your own icon)
  const userProfilePhoto = require('../assets/profile-photo.png');
  
  // Updated conversation data for each item, showing different stages of the verification process
  const conversations = [
    {
      id: 6,
      name: 'Emily Johnson',
      photo: require('../assets/profile-photos/emily.png'),
      item: {
        name: 'iPhone',
        location: 'Davis, CA'
      },
      isUserPost: true,
      status: 'verification_requested',
      verificationProgress: 0,
      messages: [
        {
          id: 1,
          text: "Hi! I think I found your purple iPhone near the student center yesterday.",
          sender: "finder",
          timestamp: "9:15 AM"
        },
        {
          id: 2,
          text: "It has a cracked screen protector but the phone seems to be in good condition.",
          sender: "finder",
          timestamp: "9:16 AM"
        },
        {
          id: 3,
          text: "Oh thank goodness! Yes, I lost my purple iPhone yesterday at the student center. I've been looking everywhere for it!",
          sender: "user",
          timestamp: "9:20 AM"
        },
        {
          id: 4,
          text: "I think I found your iPhone! Could you verify it's yours by sharing some unique details or a photo from before you lost it?",
          sender: "finder",
          timestamp: "9:22 AM",
          verification: {
            type: 'request',
            status: 'pending'
          }
        }
      ]
    },
    {
      id: 5,
      name: 'Davis Police Department',
      photo: require('../assets/profile-photos/davisPolice.png'),
      item: {
        name: 'Airpods',
        location: 'Davis, CA'
      },
      isFounder: true,
      status: 'verification_in_progress',
      verificationProgress: 50,
      messages: [
        {
          id: 1,
          text: "Hello, I saw your notice about AirPods found at the TLC. I lost mine there yesterday during a study session.",
          sender: "user",
          timestamp: "11:30 AM"
        },
        {
          id: 2,
          text: "Hello, we have received AirPods that were found at the TLC. They have a distinctive sticker on the case. To verify ownership, could you describe the sticker and any other identifying features?",
          sender: "finder",
          timestamp: "11:45 AM",
          verification: {
            type: 'request',
            status: 'pending'
          }
        },
        {
          id: 3,
          text: "The case has a holographic space sticker on the front. The left AirPod has a small scratch near the stem, and they're paired to my phone under the name 'Adrian's AirPods'.",
          sender: "user",
          timestamp: "12:00 PM",
          verification: {
            type: 'response',
            method: 'details',
            status: 'submitted'
          }
        },
        {
          id: 4,
          text: "We've received your photo verification. Reviewing it now - we'll get back to you shortly.",
          sender: "finder",
          timestamp: "12:15 PM",
          verification: {
            type: 'acknowledgement',
            status: 'reviewing'
          }
        }
      ]
    },
    {
      id: 2,
      name: 'Jane Doe',
      photo: require('../assets/profile-photos/janeDoe.png'),
      item: {
        name: 'UC Davis ID',
        location: 'Davis, CA'
      },
      isFounder: true,
      status: 'verification_approved',
      verificationProgress: 100,
      messages: [
        {
          id: 1,
          text: "Hi Jane, I saw you found a UC Davis ID near the Memorial Union. I think it might be mine - I lost mine yesterday.",
          sender: "user",
          timestamp: "3:15 PM"
        },
        {
          id: 2,
          text: "Hello! Yes, I found a UC Davis ID yesterday. To verify it's yours, could you tell me the name and student ID number on the card?",
          sender: "finder",
          timestamp: "3:20 PM",
          verification: {
            type: 'request',
            status: 'pending'
          }
        },
        {
          id: 3,
          text: "Sure! The name is Adrian Lam, student ID #934782, and I'm wearing a blue shirt in the photo. There's also a bike permit sticker on the back.",
          sender: "user",
          timestamp: "3:22 PM",
          verification: {
            type: 'response',
            method: 'details',
            status: 'submitted'
          }
        },
        {
          id: 4,
          text: "Thank you for your verification details. I've reviewed them and confirmed this is your ID!",
          sender: "finder",
          timestamp: "3:30 PM",
          verification: {
            type: 'approval',
            status: 'approved'
          }
        },
        {
          id: 5,
          text: "Your verification has been approved! I'd be happy to return your UC Davis ID. Would the MU be a good place to meet tomorrow at 2pm?",
          sender: "finder",
          timestamp: "3:32 PM"
        }
      ]
    },
    {
      id: 1,
      name: 'John Doe',
      photo: require('../assets/profile-photos/johnDoe.png'),
      item: {
        name: 'Water Bottle',
        location: 'Davis, CA'
      },
      isFounder: true,
      status: 'meetup_arranged',
      verificationProgress: 100,
      messages: [
        {
          id: 1,
          text: "Hi John, I saw your post about a found blue water bottle. I believe it's mine - I lost one near the library yesterday.",
          sender: "user",
          timestamp: "10:30 AM"
        },
        {
          id: 2,
          text: "Hi there! Yes, I found a blue metal water bottle near the library. Could you describe any unique features so I can verify it's yours?",
          sender: "finder",
          timestamp: "10:32 AM",
          verification: {
            type: 'request',
            status: 'pending'
          }
        },
        {
          id: 3,
          text: "Of course! It's a Hydroflask brand, navy blue with a white UC Davis sticker on the side. It also has my initials 'AL' written in black marker on the bottom.",
          sender: "user",
          timestamp: "10:35 AM",
          verification: {
            type: 'response',
            method: 'details',
            status: 'submitted'
          }
        },
        {
          id: 4,
          text: "That's exactly what I found! The verification is approved. When would be a good time to meet up so I can return it to you?",
          sender: "finder",
          timestamp: "10:37 AM",
          verification: {
            type: 'approval',
            status: 'approved'
          }
        },
        {
          id: 5,
          text: "Perfect! I'm available today after 3 PM at the Silo if that works for you.",
          sender: "user",
          timestamp: "10:40 AM"
        },
        {
          id: 6,
          text: "Perfect! I'll be at the Silo at 3:30 PM today. I'll be wearing a red jacket and I'll have your water bottle with me. Look for me near the outdoor tables.",
          sender: "finder",
          timestamp: "10:42 AM"
        }
      ]
    },
    {
      id: 3,
      name: 'Andrew Lam',
      photo: require('../assets/profile-photos/andrew.png'),
      item: {
        name: 'Backpack',
        location: 'Davis, CA'
      },
      isFounder: true,
      status: 'item_returned',
      verificationProgress: 100,
      messages: [
        {
          id: 1,
          text: "Hello, I lost my black backpack with red trim at the library yesterday. I saw your post and I think you found it!",
          sender: "user",
          timestamp: "2:00 PM"
        },
        {
          id: 2,
          text: "Hi there! Yes, I have a black backpack with red trim. Can you tell me any identifying features or what was inside to confirm it's yours?",
          sender: "finder",
          timestamp: "2:05 PM",
          verification: {
            type: 'request',
            status: 'pending'
          }
        },
        {
          id: 3,
          text: "Inside there should be a blue notebook with 'Chemistry 101' written on it, a graphing calculator, and a water bottle with a Pokémon sticker.",
          sender: "user",
          timestamp: "2:10 PM",
          verification: {
            type: 'response',
            method: 'details',
            status: 'submitted'
          }
        },
        {
          id: 4,
          text: "That's definitely your backpack! Verification approved. When can I meet you to return it?",
          sender: "finder",
          timestamp: "2:15 PM",
          verification: {
            type: 'approval',
            status: 'approved'
          }
        },
        {
          id: 5,
          text: "I'm free today at 4:30 PM at the library entrance. Does that work?",
          sender: "user",
          timestamp: "2:20 PM"
        },
        {
          id: 6,
          text: "Perfect, see you then!",
          sender: "finder",
          timestamp: "2:25 PM"
        },
        {
          id: 7,
          text: "Thanks for meeting me today! I'm glad we were able to return your backpack. Would you mind giving karma points for returning it?",
          sender: "finder",
          timestamp: "5:00 PM",
          karma: {
            type: 'request',
            status: 'pending'
          }
        }
      ]
    },
    {
      id: 4,
      name: 'Justin So',
      photo: require('../assets/profile-photos/justin.png'),
      item: {
        name: 'Pencil',
        location: 'Davis, CA'
      },
      isFounder: false,
      isClaimant: true,
      status: 'awaiting_verification',
      verificationProgress: 10,
      messages: [
        {
          id: 1,
          text: "Hello Justin, I saw your post about a lost mechanical pencil. I found one at Wellman Hall yesterday.",
          sender: "user",
          timestamp: "4:00 PM"
        },
        {
          id: 2,
          text: "Oh thank you for contacting me! Yes, I lost my favorite mechanical pencil there during a lecture.",
          sender: "finder",
          timestamp: "4:05 PM"
        },
        {
          id: 3,
          text: "I found your pencil, but I need to verify you're the owner. Could you tell me any unique details about it, like specific marks or when you last had it?",
          sender: "user",
          timestamp: "4:10 PM",
          verification: {
            type: 'request',
            status: 'pending'
          }
        }
      ]
    }
  ];

  // Find the current conversation data
  const currentConversation = useMemo(() => {
    return conversations.find(c => c.id === conversationId) || conversations[0];
  }, [conversationId, conversations]);

  // Set the current verification status from the conversation if not already set
  useEffect(() => {
    if (currentConversation) {
      if (!params.verificationStatus) {
        setVerificationStatus(currentConversation.status || 'none');
      }
      if (!params.verificationProgress) {
        setVerificationProgress(currentConversation.verificationProgress || 0);
      }
    }
  }, [currentConversation, params]);

  // For rendering verification status banners based on the status
  const shouldShowVerificationBanner = useMemo(() => {
    return verificationStatus && verificationStatus !== 'none';
  }, [verificationStatus]);

  // For rendering karma request banner
  const shouldShowKarmaBanner = useMemo(() => {
    if (verificationStatus === 'item_returned' && !karmaGiven) {
      const hasKarmaRequest = currentConversation?.messages?.some(
        msg => msg.karma && msg.karma.type === 'request' && msg.karma.status === 'pending'
      );
      return hasKarmaRequest;
    }
    return false;
  }, [verificationStatus, currentConversation, karmaGiven]);

  // Determine if we should show meetup arranged notification
  const shouldShowMeetupBanner = useMemo(() => {
    return verificationStatus === 'meetup_arranged';
  }, [verificationStatus]);

  // Set up the chat messages from the current conversation
  const [chatMessages, setChatMessages] = useState(currentConversation.messages);
  
  // Modified useEffect to handle conversation initialization based on item type
  useEffect(() => {
    // Check if this is conversation about a found item or a lost item
    if (params.itemType === 'found' || (currentConversation && currentConversation.isFounder)) {
      // This is a conversation with someone who found an item
      // If this is the first time chatting, add a verification request and prompt
      if (chatMessages.length <= 2) {
        // Add a verification request message from the finder
        const verificationRequestMessage = {
          id: chatMessages.length + 1,
          text: "To verify you're the rightful owner, can you please share a photo of the item from before you lost it or provide some unique details about it that only the owner would know?",
          sender: "finder",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          requiresVerification: true
        };
        
        setChatMessages(prev => [...prev, verificationRequestMessage]);
        
        // Set the verification status to prompt the user to submit verification
        setVerificationStatus('verification_requested');
      }
    }
    // If this is a conversation about an item the user lost (and someone found)
    else if (params.itemType === 'lost' || (currentConversation && currentConversation.isUserPost)) {
      // This is a conversation about the user's own lost item
      // No automatic verification prompt needed - the finder will provide verification if needed
      setVerificationStatus('awaiting_verification');
    }
  }, [params.itemType, currentConversation, chatMessages.length]);

  // Add this useEffect to extract meetup information from messages
  useEffect(() => {
    if (currentConversation && chatMessages.length > 0) {
      // Extract meetup details if status is meetup_arranged
      if (verificationStatus === 'meetup_arranged') {
        // Look for meetup details in messages
        const meetupMessages = chatMessages.filter(msg => 
          // Look for messages containing meetup related keywords
          msg.text.toLowerCase().includes('meet') || 
          msg.text.toLowerCase().includes('pm') ||
          msg.text.toLowerCase().includes('am') ||
          msg.text.toLowerCase().includes('tomorrow') ||
          msg.text.toLowerCase().includes('today')
        );
        
        if (meetupMessages.length > 0) {
          // Find the latest meetup message
          const latestMeetupMsg = meetupMessages[meetupMessages.length - 1];
          
          // Extract time information
          const timeMatch = latestMeetupMsg.text.match(/\b([0-9]{1,2}:[0-9]{2})\s*(AM|PM|am|pm)\b/);
          if (timeMatch) {
            currentConversation.meetupTime = timeMatch[0];
          }
          
          // Extract location information
          const locationKeywords = ['at', 'in', 'near'];
          locationKeywords.forEach(keyword => {
            const locationRegex = new RegExp(`${keyword}\\s+the\\s+([\\w\\s]+)`, 'i');
            const match = latestMeetupMsg.text.match(locationRegex);
            if (match) {
              currentConversation.meetupLocation = match[1];
            }
          });
          
          // Extract date information
          if (latestMeetupMsg.text.toLowerCase().includes('tomorrow')) {
            currentConversation.meetupDate = 'tomorrow';
          } else if (latestMeetupMsg.text.toLowerCase().includes('today')) {
            currentConversation.meetupDate = 'today';
          }
        }
      }
    }
  }, [currentConversation, chatMessages, verificationStatus]);

  // Handle sending a message with/without attachment
  const handleSend = async () => {
    if (message.trim() === '' && !attachedPhoto) return;
    
    // Create a new message object
    const newMessage = {
      id: chatMessages.length + 1,
      text: message.trim(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // If there's an attached photo, add it to the message
    if (attachedPhoto) {
      // If this is a verification photo
      if (attachedPhotoType === 'verification') {
        // Create verification data
        const verificationData = {
          method: 'photo',
          image: attachedPhoto,
          details: message.trim() || `Verification photo for ${currentConversation.item.name}`,
          timestamp: new Date().toISOString(),
          status: 'pending',
          reviewed: false
        };
        
        // Add the verification data to the message
        newMessage.verification = verificationData;
        newMessage.text = message.trim() || "Here's verification that this is my item.";
        
        // Update verification status
        setVerificationStatus('verification_in_progress');
        setVerificationProgress(50);
        setVerificationData(verificationData);
      } else {
        // Regular photo attachment
        newMessage.attachment = {
          type: 'image',
          uri: attachedPhoto
        };
      }
    }
    
    // Add the new message to the chat
    setChatMessages([...chatMessages, newMessage]);
    
    // Clear the input field and attachment
    setMessage('');
    setAttachedPhoto(null);
    setAttachedPhotoType(null);
    setIsAttachmentActive(false);
    
    // Simulate a response after a delay
    setTimeout(() => {
      // Generate response based on the message type
      let responseText = "I'll take good care of your item until we can meet up.";
      
      // If the message contained verification
      if (newMessage.verification) {
        responseText = "Thank you for the verification! The details match the item I found. Would you like to meet somewhere on campus tomorrow to get it back?";
        
        // Simulate verification approval
        setTimeout(() => {
          // Update message verification status
          setChatMessages(prev => {
            return prev.map(msg => {
              if (msg.id === newMessage.id && msg.verification) {
                return {
                  ...msg,
                  verification: {
                    ...msg.verification,
                    status: 'approved',
                    reviewed: true
                  }
                };
              }
              return msg;
            });
          });
          
          // Add system message about approval
          const approvalMessage = {
            id: chatMessages.length + 2,
            text: "✅ Your ownership has been verified. You can now arrange to recover your item.",
            sender: "system",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setChatMessages(prev => [...prev, approvalMessage]);
          setVerificationStatus('verification_approved');
        }, 2000);
      }
      
      // Add response message
      const responseMessage = {
        id: chatMessages.length + 2,
        text: responseText,
        sender: "finder",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, responseMessage]);
    }, 1000);
  };

  // Handle image picking from gallery or camera
  const handlePickImage = async (source = 'gallery') => {
    try {
      let result;
      
      if (source === 'camera') {
        // Request camera permission
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera access is required to take a photo');
          return;
        }
        
        // Launch camera
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        // Launch image library
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }
      
      if (!result.canceled) {
        setAttachedPhoto(result.assets[0].uri);
        setShowImagePicker(false);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  // Handle verification action (approve/reject/view)
  const handleVerificationAction = (action, data) => {
    if (action === 'view-image' && data.image) {
      setViewingImageUri(data.image);
      setShowImageViewer(true);
      return;
    }
    
    if (action === 'request') {
      setShowUploadVerificationModal(true);
    }
    
    if (action === 'submit') {
      // This handles when a user submits verification via the modal
      
      // If we don't want to send as a message (already handled in the modal onSubmit)
      if (!data.sendAsMessage) {
        // Update verification status directly
        setVerificationStatus('verification_in_progress');
        setVerificationProgress(50);
        
        // Store verification data for later
        setVerificationData(data);
        
        // Add system message acknowledging receipt
        const systemMessage = {
          id: Date.now(),
          text: "✓ Verification submitted successfully. Waiting for review.",
          sender: "system",
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        setChatMessages(prev => [...prev, systemMessage]);
      }
      
      // Simulate finder reviewing the verification after a delay
      if (currentConversation.isFounder) {
        setTimeout(() => {
          const responseMessage = {
            id: Date.now() + 1,
            text: "Thanks for submitting your verification. I'll review it and get back to you soon.",
            sender: "finder",
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          };
          
          setChatMessages(prev => [...prev, responseMessage]);
        }, 2000);
      }
    }
    
    if (action === 'approve') {
      // Update the message containing this verification
      setChatMessages(prev => {
        return prev.map(msg => {
          if (msg.verification && msg.verification.timestamp === data.timestamp) {
            return {
              ...msg,
              verification: {
                ...msg.verification,
                status: 'approved',
                reviewed: true
              }
            };
          }
          return msg;
        });
      });
      
      // Add system message
      const systemMessage = {
        id: chatMessages.length + 1,
        text: "✅ Ownership verification approved. You can now arrange to return the item.",
        sender: "system",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, systemMessage]);
      setVerificationStatus('verification_approved');
      setVerificationProgress(100);
      
      // Add response message
      setTimeout(() => {
        const responseMessage = {
          id: chatMessages.length + 2,
          text: "I appreciate your detailed verification. This definitely matches what I found. When would you like to meet to pick it up?",
          sender: "finder",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setChatMessages(prev => [...prev, responseMessage]);
      }, 500);
    }
    
    if (action === 'reject') {
      // Update the message containing this verification
      setChatMessages(prev => {
        return prev.map(msg => {
          if (msg.verification && msg.verification.timestamp === data.timestamp) {
            return {
              ...msg,
              verification: {
                ...msg.verification,
                status: 'rejected',
                reviewed: true
              }
            };
          }
          return msg;
        });
      });
      
      // Add system message
      const systemMessage = {
        id: chatMessages.length + 1,
        text: "❌ Ownership verification rejected. Please provide more convincing evidence.",
        sender: "system",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, systemMessage]);
      setVerificationStatus('awaiting_verification');
      setVerificationProgress(10);
    }
  };

  // Render each chat message
  const renderMessage = ({ item }) => {
    // Function to determine if we should show verification tag based on message content
    const shouldShowVerificationTag = () => {
      // If message has verification data, show tag
      if (item.verification) return true;
      
      // Special cases for verification prompts
      if (item.requiresVerification) return true;
      
      // Check for verification keywords in message text
      const verificationKeywords = [
        'verify', 'verification', 'confirm', 'ownership', 
        'proof', 'identify', 'authenticity', 'validate'
      ];
      
      return verificationKeywords.some(keyword => 
        item.text.toLowerCase().includes(keyword)
      );
    };
    
    // Function to handle verification-related actions from a message
    const handleMessageVerificationAction = () => {
      // If the message is asking for verification, open the upload modal
      if (item.verification?.type === 'request' && item.verification?.status === 'pending') {
        setShowUploadVerificationModal(true);
      }
      // If user has already submitted verification, show progress status
      else if (item.verification?.status === 'submitted' || item.verification?.status === 'reviewing') {
        Alert.alert(
          "Verification Submitted",
          "Your verification is being reviewed. We'll notify you when it's complete.",
          [{ text: "OK" }]
        );
      }
      // Otherwise handle as a generic verification action
      else {
        setAttachedPhotoType('verification');
        setIsAttachmentActive(true);
      }
    };
    
    return (
      <View style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : 
        item.sender === 'system' ? styles.systemMessage : styles.finderMessage
      ]}>
        {/* Add profile picture to messages */}
        {item.sender === 'finder' && (
          <Image 
            source={currentConversation.photo}
            style={styles.messageProfilePic}
            resizeMode="cover"
          />
        )}
        <View style={styles.messageContent}>
          <Text style={[
            styles.messageText,
            item.sender === 'system' && styles.systemMessageText
          ]}>{item.text}</Text>
          
          {/* Show image attachment if present */}
          {item.attachment && item.attachment.type === 'image' && (
            <TouchableOpacity
              onPress={() => {
                setViewingImageUri(item.attachment.uri);
                setShowImageViewer(true);
              }}
              style={styles.messageImageContainer}
            >
              <Image 
                source={{ uri: item.attachment.uri }} 
                style={styles.messageImage} 
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          
          {/* Show verification attachment if present */}
          {item.verification && (
            <VerificationMessageAttachment 
              data={item.verification} 
              onAction={(action, data) => {
                if (action === 'respond') {
                  setShowUploadVerificationModal(true);
                } else {
                  handleVerificationAction(action, data);
                }
              }}
              userRole={item.sender === 'user' ? 'owner' : 'finder'}
            />
          )}
          
          {/* Show karma tag if present */}
          {item.karma && (
            <View style={styles.karmaTag}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.karmaTagText}>
                {item.karma.type === 'request' 
                  ? 'Karma Requested' 
                  : 'Karma Given'}
              </Text>
            </View>
          )}
          
          {/* Highlight messages requiring verification but without verification data */}
          {!item.verification && shouldShowVerificationTag() && (
            <TouchableOpacity 
              style={styles.verificationPrompt}
              onPress={handleMessageVerificationAction}
            >
              <Ionicons name="shield-checkmark-outline" size={16} color="#4A6572" />
              <Text style={styles.verificationPromptText}>
                Tap to provide verification
              </Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.messageTime}>{item.timestamp}</Text>
        </View>
        {item.sender === 'user' && (
          <Image 
            source={userProfilePhoto}
            style={styles.messageProfilePic}
            resizeMode="cover"
          />
        )}
      </View>
    );
  };

  // Navigation
  const goBack = () => {
    router.back();
  };

  // Add a function to handle giving karma
  const handleGiveKarma = async () => {
    try {
      // Use the userId from params or create one from the conversation ID
      const receiverId = userId || `user-${conversationId}`;
      
      // We're not actually incrementing the karma in Firebase anymore
      // Just display success message and update local state
      setKarmaGiven(true);
      setShowKarmaModal(false);
      
      // Show a success message
      Alert.alert(
        "Karma Given!",
        "Thank you for recognizing someone who helped reconnect a lost item!",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('Error giving karma:', error);
      Alert.alert(
        "Error",
        "Failed to give karma. Please try again later.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {/* Back button */}
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          
          {/* Chat recipient info */}
          <TouchableOpacity 
            style={styles.recipientInfo}
            onPress={() => {
              // Navigate to user profile using the userId from params or derived from conversationId
              const profileId = userId || `user-${conversationId}`;
              router.push(`/user-profile?userId=${profileId}`);
            }}
          >
            <Image 
              source={currentConversation.photo}
              style={styles.profilePic}
              resizeMode="cover"
            />
            <Text style={styles.recipientName}>{currentConversation.name}</Text>
          </TouchableOpacity>
          
          {/* Karma button */}
          <TouchableOpacity 
            style={styles.karmaButton} 
            onPress={() => setShowKarmaModal(true)}
            disabled={karmaGiven}
          >
            <Ionicons 
              name="star" 
              size={24} 
              color={karmaGiven ? "#CCC" : "#FFC107"} 
            />
          </TouchableOpacity>
        </View>

        {/* Chat item info */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemInfoText}>
            {`${currentConversation.item.name} • ${currentConversation.item.location}`}
          </Text>
        </View>

        {/* Verification Banner */}
        {shouldShowVerificationBanner && (
          <VerificationBanner 
            status={verificationStatus} 
            progress={verificationProgress}
            onPress={() => {
              // Different actions based on verification status
              if (verificationStatus === 'verification_requested' || verificationStatus === 'awaiting_verification') {
                // Open the verification upload modal when verification is requested
                setShowUploadVerificationModal(true);
              } else if (verificationStatus === 'verification_in_progress') {
                // Just show status info when verification is in progress
                Alert.alert(
                  "Verification In Progress",
                  "Your verification is being reviewed. We'll notify you when it's complete.",
                  [{ text: "OK" }]
                );
              } else {
                // For other statuses, show the verification review details
                setShowVerificationReviewModal(true);
              }
            }}
          />
        )}

        {/* Meetup Banner - shown when meetup is arranged */}
        {shouldShowMeetupBanner && (
          <MeetupBanner 
            meetupData={{
              // Extract meetup details from conversation if available
              time: currentConversation.meetupTime || '3:30 PM',
              location: currentConversation.meetupLocation || 'the Silo',
              date: currentConversation.meetupDate || 'today'
            }}
          />
        )}

        {/* Karma Banner - shown when the item has been returned and karma requested */}
        {shouldShowKarmaBanner && (
          <KarmaBanner onGiveKarma={() => setShowKarmaModal(true)} />
        )}

        {/* Chat messages */}
        <FlatList
          data={chatMessages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.chatContainer}
          inverted={false}
        />
        
        {/* Message input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          {/* Show photo preview if there's an attached photo */}
          {attachedPhoto && (
            <View style={styles.photoPreviewWrapper}>
              <PhotoPreview 
                uri={attachedPhoto} 
                onRemove={() => {
                  setAttachedPhoto(null);
                  setAttachedPhotoType(null);
                }} 
              />
              {attachedPhotoType === 'verification' && (
                <View style={styles.verificationBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#FFF" />
                  <Text style={styles.verificationBadgeText}>Verification</Text>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.inputRow}>
            {/* Attachment button */}
            <AttachmentButton 
              isActive={isAttachmentActive}
              onPress={() => {
                setIsAttachmentActive(!isAttachmentActive);
                setShowImagePicker(true);
                // Default to regular photo if not already set
                if (!attachedPhotoType) {
                  setAttachedPhotoType('message');
                }
              }}
            />
            
            {/* Text input */}
            <TextInput
              style={styles.input}
              placeholder={
                attachedPhoto && attachedPhotoType === 'verification'
                  ? "Add details about your item (optional)..."
                  : "Type a message..."
              }
              value={message}
              onChangeText={setMessage}
              multiline
            />
            
            {/* Send button */}
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={handleSend}
              disabled={message.trim() === '' && !attachedPhoto}
            >
              <Ionicons 
                name="send" 
                size={24} 
                color={(message.trim() === '' && !attachedPhoto) ? "#CCC" : "#8AD3A3"} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Image Picker Modal */}
        <Modal
          transparent={true}
          visible={showImagePicker}
          animationType="slide"
          onRequestClose={() => setShowImagePicker(false)}
        >
          <View style={styles.imagePickerModalOverlay}>
            <TouchableWithoutFeedback onPress={() => setShowImagePicker(false)}>
              <View style={styles.imagePickerModalBg} />
            </TouchableWithoutFeedback>
            
            <View style={styles.imagePickerModalContent}>
              <View style={styles.imagePickerHeader}>
                <Text style={styles.imagePickerTitle}>
                  {attachedPhotoType === 'verification'
                    ? "Verification Photo"
                    : "Add Photo"}
                </Text>
                <TouchableOpacity onPress={() => setShowImagePicker(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              {attachedPhotoType === 'verification' && (
                <Text style={styles.imagePickerDescription}>
                  Please upload a photo of your item taken before it was lost to verify ownership
                </Text>
              )}
              
              <View style={styles.imagePickerOptions}>
                <TouchableOpacity 
                  style={styles.imagePickerOption} 
                  onPress={() => handlePickImage('camera')}
                >
                  <View style={styles.imagePickerIconContainer}>
                    <Ionicons name="camera" size={28} color="#8AD3A3" />
                  </View>
                  <Text style={styles.imagePickerOptionText}>Take Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.imagePickerOption} 
                  onPress={() => handlePickImage('gallery')}
                >
                  <View style={styles.imagePickerIconContainer}>
                    <Ionicons name="image" size={28} color="#8AD3A3" />
                  </View>
                  <Text style={styles.imagePickerOptionText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Verification Review Modal */}
        <VerificationReviewModal
          visible={showVerificationReviewModal}
          onClose={() => setShowVerificationReviewModal(false)}
          data={verificationData}
          onApprove={() => {}}
          onReject={() => {}}
          isUserSubmittedVerification={!currentConversation.isUserPost}
        />

        {/* Verification Upload Modal */}
        <VerificationModal
          visible={showUploadVerificationModal}
          onClose={() => setShowUploadVerificationModal(false)}
          onSubmit={(data) => {
            // Close the modal
            setShowUploadVerificationModal(false);
            
            // Send the verification data as a message
            if (data.sendAsMessage) {
              const messageText = data.method === 'details' 
                ? data.details 
                : "Here's a photo of my item for verification.";
                
              const newMessage = {
                id: Date.now(),
                text: messageText,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                verification: {
                  type: 'response',
                  method: data.method,
                  status: 'submitted',
                  details: data.details,
                  image: data.image
                }
              };
              
              // Add the message to the chat
              setChatMessages(prev => [...prev, newMessage]);
              
              // Update verification status to in_progress
              setVerificationStatus('verification_in_progress');
              setVerificationProgress(50);
            }
            
            // Handle verification directly
            handleVerificationAction('submit', data);
          }}
          itemName={currentConversation?.item?.name || 'item'}
          itemType={currentConversation?.isFounder ? 'found' : 'lost'}
          verificationStatus={verificationStatus}
          verificationProgress={verificationProgress}
        />

        {/* Karma Modal - Keep existing modal code */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showKarmaModal}
          onRequestClose={() => setShowKarmaModal(false)}
        >
          <View style={styles.karmaModalOverlay}>
            <View style={styles.karmaModalContent}>
              <Text style={styles.karmaModalTitle}>Give Karma Points</Text>
              <Text style={styles.karmaModalText}>
                This person helped you recover a lost item. Would you like to give them karma points as a thank you?
              </Text>
              <View style={styles.karmaModalButtons}>
                <TouchableOpacity 
                  style={styles.karmaModalCancel}
                  onPress={() => setShowKarmaModal(false)}
                >
                  <Text style={styles.karmaModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.karmaModalGive}
                  onPress={() => {
                    setKarmaGiven(true);
                    setShowKarmaModal(false);
                    Alert.alert(
                      "Karma Given!",
                      "Thank you for recognizing someone who helped reconnect a lost item!",
                      [{ text: "OK" }]
                    );
                  }}
                >
                  <Ionicons name="star" size={18} color="#333" style={styles.karmaIcon} />
                  <Text style={styles.karmaModalGiveText}>Give Karma</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Image Viewer Modal */}
        <ImageViewerModal
          visible={showImageViewer}
          uri={viewingImageUri}
          onClose={() => setShowImageViewer(false)}
        />
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  karmaButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemInfoText: {
    fontSize: 14,
    color: '#666',
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  requestedBanner: {
    backgroundColor: '#FFF8E1',
    borderBottomColor: '#FFE082',
  },
  awaitingBanner: {
    backgroundColor: '#FFF3E0',
    borderBottomColor: '#FFCC80',
  },
  pendingBanner: {
    backgroundColor: '#E3F2FD',
    borderBottomColor: '#BBDEFB',
  },
  approvedBanner: {
    backgroundColor: '#E8F5E9',
    borderBottomColor: '#A5D6A7',
  },
  meetupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3E5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#CE93D8',
  },
  returnedBanner: {
    backgroundColor: '#E8F5E9',
    borderBottomColor: '#A5D6A7',
  },
  bannerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    color: '#333',
  },
  bannerDescription: {
    fontSize: 14,
    color: '#666',
  },
  chatContainer: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#8AD3A3', // Light green color
    borderBottomRightRadius: 4,
  },
  finderMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 16,
    maxWidth: '90%',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
  },
  systemMessageText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageProfilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachmentButtonActive: {
    backgroundColor: '#E8F5E9',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreviewWrapper: {
    paddingBottom: 8,
    alignItems: 'center',
  },
  photoPreviewContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginVertical: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  photoPreviewRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  verificationBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#8AD3A3',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 3,
  },
  // Message attachment styles
  messageImageContainer: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  messageImage: {
    width: '100%',
    height: '100%',
  },
  verificationPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  verificationPromptText: {
    color: '#4A6572',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  // Verification attachment in messages
  verificationAttachment: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  verificationAttachmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  verificationAttachmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  verificationAttachmentImageContainer: {
    position: 'relative',
  },
  verificationAttachmentImage: {
    width: '100%',
    height: 150,
    borderRadius: 0,
  },
  verificationAttachmentImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    alignItems: 'center',
  },
  verificationAttachmentImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  verificationAttachmentDetails: {
    padding: 12,
  },
  verificationAttachmentDetailsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  verificationAttachmentActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  verificationAttachmentRejectBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
  },
  verificationAttachmentRejectText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  verificationAttachmentApproveBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  verificationAttachmentApproveText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  verificationAttachmentRespondBtn: {
    margin: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#8AD3A3',
    alignSelf: 'flex-start',
  },
  verificationAttachmentRespondText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '500',
  },
  // Image picker modal
  imagePickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  imagePickerModalBg: {
    flex: 1,
  },
  imagePickerModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  imagePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  imagePickerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  imagePickerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  imagePickerOption: {
    alignItems: 'center',
    width: 120,
  },
  imagePickerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePickerOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  // Image viewer modal
  imageViewerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerImage: {
    width: '100%',
    height: '80%',
  },
  imageViewerCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 100,
  },
  // Existing karma modal styles
  karmaModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  karmaModalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  karmaModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  karmaModalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  karmaModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  karmaModalCancel: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginRight: 8,
  },
  karmaModalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  karmaModalGive: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  karmaIcon: {
    marginRight: 8,
  },
  karmaModalGiveText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  karmaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  karmaTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFA000',
    marginLeft: 4,
  },
  // Meetup banner styles
  meetupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F0F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetupContent: {
    flex: 1,
    marginLeft: 12,
  },
  meetupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
    marginBottom: 2,
  },
  meetupDetails: {
    fontSize: 14,
    color: '#666',
  },
  
  // Karma banner styles
  karmaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
  },
  karmaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFDE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  karmaContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  karmaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFA000',
    marginBottom: 2,
  },
  karmaDetails: {
    fontSize: 14,
    color: '#666',
  },
}); 