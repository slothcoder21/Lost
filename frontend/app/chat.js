import React, { useState, useEffect } from 'react';
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

// Verification Banner Component
const VerificationBanner = ({ onPress, isPending }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.verificationBanner,
        isPending ? styles.pendingBanner : styles.reviewedBanner
      ]}
      onPress={onPress}
    >
      <Ionicons 
        name={isPending ? "alert-circle" : "checkmark-circle"} 
        size={24} 
        color={isPending ? "#FFA000" : "#66B289"} 
      />
      <View style={styles.bannerTextContainer}>
        <Text style={styles.bannerTitle}>
          {isPending ? "Ownership Verification Pending" : "Ownership Verified"}
        </Text>
        <Text style={styles.bannerDescription}>
          {isPending 
            ? "This user has submitted verification for this item. Tap to review." 
            : "You've verified this user's ownership claim."
          }
        </Text>
      </View>
      {isPending && (
        <Ionicons name="chevron-forward" size={20} color="#FFA000" />
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

export default function ChatPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId; // Extract userId directly from params
  const conversationId = userId ? parseInt(userId.replace('user-', '')) : (params.id ? parseInt(params.id) : 1);
  
  const [message, setMessage] = useState('');
  const [showKarmaModal, setShowKarmaModal] = useState(false);
  const [karmaGiven, setKarmaGiven] = useState(false);
  const [showVerificationReviewModal, setShowVerificationReviewModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(params.verification ? 'pending' : null);
  const [verificationData, setVerificationData] = useState(null);
  
  // User profile photo (your own icon)
  const userProfilePhoto = require('../assets/profile-photo.png');
  
  // Conversation data for each item
  const conversations = [
    {
      id: 6,
      name: 'Emily Johnson',
      photo: require('../assets/profile-photos/emily.png'), // Reusing photo as placeholder
      item: {
        name: 'IPhone',
        location: 'Davis, CA'
      },
      isUserPost: true, // Flag to indicate this is the user's own post
      needsVerification: true, // Flag to indicate verification is needed
      unread: 2, // Add unread count to show notification
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
          text: "Great! Before I return it, I need to verify you're the rightful owner. Can you please send me a photo of the phone from before you lost it or provide some unique details about it that only the owner would know?",
          sender: "finder",
          timestamp: "9:22 AM"
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
      isFounder: true, // This person found the item
      unread: 1, // Add unread count to show notification
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
          timestamp: "11:45 AM"
        },
        {
          id: 3,
          text: "The case has a holographic space sticker on the front. The left AirPod has a small scratch near the stem, and they're paired to my phone under the name 'Adrian's AirPods'.",
          sender: "user",
          timestamp: "12:00 PM"
        },
        {
          id: 4,
          text: "Thank you for the details. That matches what we have. You can come to the Davis Police Department at 2600 5th Street to claim them. Please bring your ID.",
          sender: "finder",
          timestamp: "12:15 PM"
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
      isFounder: true, // This person found the item
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
          timestamp: "10:32 AM"
        },
        {
          id: 3,
          text: "Of course! It's a Hydroflask brand, navy blue with a white UC Davis sticker on the side. It also has my initials 'AL' written in black marker on the bottom.",
          sender: "user",
          timestamp: "10:35 AM"
        },
        {
          id: 4,
          text: "That's exactly what I found! When would be a good time to meet up so I can return it to you?",
          sender: "finder",
          timestamp: "10:37 AM"
        },
        {
          id: 5,
          text: "Perfect! I'm available today after 3 PM at the library entrance if that works for you.",
          sender: "user",
          timestamp: "10:40 AM"
        },
        {
          id: 6,
          text: "I'll be there at 3:30 PM. I'll be wearing a red jacket and I'll have your water bottle with me.",
          sender: "finder",
          timestamp: "10:42 AM"
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
      isFounder: true, // This person found the item
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
          timestamp: "3:20 PM"
        },
        {
          id: 3,
          text: "Sure! The name is Adrian Lam, student ID #934782, and I'm wearing a blue shirt in the photo. There's also a bike permit sticker on the back.",
          sender: "user",
          timestamp: "3:22 PM"
        },
        {
          id: 4,
          text: "Great! That matches exactly. When would be a good time to meet so I can return it?",
          sender: "finder",
          timestamp: "3:30 PM"
        },
        {
          id: 5,
          text: "I'm free tomorrow around 1 PM at the Memorial Union. Would that work for you?",
          sender: "user",
          timestamp: "3:32 PM"
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
      isFounder: true, // This person found the item
      messages: [
        {
          id: 1,
          text: "Hi Andrew, I saw your post about a found black backpack with red trim. I lost mine at the library yesterday. Could this be mine?",
          sender: "user",
          timestamp: "9:10 AM"
        },
        {
          id: 2,
          text: "Hi there! I did find a black backpack with red trim at the library. Could you tell me what's inside or any unique features to verify it's yours?",
          sender: "finder",
          timestamp: "9:15 AM"
        },
        {
          id: 3,
          text: "Inside there's a math textbook (Calculus III), two blue notebooks, and a gray metal water bottle. There's also a keychain with a small bear on the zipper.",
          sender: "user",
          timestamp: "9:17 AM"
        },
        {
          id: 4,
          text: "That's definitely your backpack! When can I meet you to return it?",
          sender: "finder",
          timestamp: "9:20 AM"
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
      isFounder: true, // This person found the item
      messages: [
        {
          id: 1,
          text: "Hello Justin, I believe you found my mechanical pencil in Wellman Hall. I lost it during the chemistry lecture yesterday.",
          sender: "user",
          timestamp: "4:05 PM"
        },
        {
          id: 2,
          text: "Hi! Yes, I did find a mechanical pencil after the chemistry lecture. Could you describe it so I can verify it's yours?",
          sender: "finder",
          timestamp: "4:10 PM"
        },
        {
          id: 3,
          text: "It's a Pentel brand with a blue grip. It has 0.5mm lead and my initials (AL) are etched near the clip.",
          sender: "user",
          timestamp: "4:15 PM"
        },
        {
          id: 4,
          text: "That's exactly what I found! I can drop it off at the Chemistry department office tomorrow if that works for you?",
          sender: "finder",
          timestamp: "4:20 PM"
        }
      ]
    }
  ];
  
  // Find the current conversation based on the ID
  const currentConversation = conversations.find(conv => conv.id === conversationId) || conversations[0];
  
  // Set up the chat messages from the current conversation
  const [chatMessages, setChatMessages] = useState(currentConversation.messages);
  
  // Set verification status based on conversation properties
  useEffect(() => {
    // If this is the Emily Johnson conversation (ID 6) and verification isn't already set
    if (currentConversation.id === 6 && !verificationStatus) {
      // Set this conversation to show the verification needed banner
      setVerificationStatus('need-to-submit');
      
      // Create verification data for the user to review/send
      const userVerificationData = {
        method: 'photo',
        details: "The phone has my dog Max (a golden retriever) on the lock screen and my initials 'AL' are engraved on the back near the camera.",
        image: "https://source.unsplash.com/random/300x400/?iphone-purple-lockscreen",
        timestamp: new Date().toISOString(),
      };
      
      setVerificationData(userVerificationData);
    }
    // For all found item chats (where user is claiming an item)
    else if (currentConversation.isFounder && !verificationStatus) {
      // Show appropriate verification status based on conversation phase
      if (chatMessages.length >= 4) {
        // After verification details have been provided, show verified status
        setVerificationStatus('approved');
        
        // Create verification data for the item
        const verificationDetails = {
          method: 'details',
          details: getVerificationDetailsForItem(currentConversation.item.name),
          image: getVerificationImageForItem(currentConversation.item.name),
          timestamp: new Date().toISOString(),
        };
        
        setVerificationData(verificationDetails);
      } else {
        // Before verification details are provided, show pending status
        setVerificationStatus('pending');
      }
    }
    // If this is a conversation about the user's own post and someone else is claiming it
    else if (params.userPost === 'true' || (currentConversation && currentConversation.isUserPost)) {
      // This is for when the user needs to request verification from someone claiming their item
      setVerificationStatus('need-to-request');
    }
  // Only run when these specific values change, not on every render of currentConversation
  }, [params.verification, params.userPost, currentConversation.id, currentConversation.isFounder, currentConversation.isUserPost, chatMessages.length, verificationStatus]);

  // Helper function to get verification details for different items
  const getVerificationDetailsForItem = (itemName) => {
    const details = {
      'Water Bottle': "It's a Hydroflask brand, navy blue with a white UC Davis sticker on the side. It also has my initials 'AL' written in black marker on the bottom.",
      'UC Davis ID': "The name is Adrian Lam, student ID #934782, and I'm wearing a blue shirt in the photo. There's also a bike permit sticker on the back.",
      'Backpack': "Inside there's a math textbook (Calculus III), two blue notebooks, and a gray metal water bottle. There's also a keychain with a small bear on the zipper.",
      'Pencil': "It's a Pentel brand with a blue grip. It has 0.5mm lead and my initials (AL) are etched near the clip.",
      'Airpods': "The case has a holographic space sticker on the front. The left AirPod has a small scratch near the stem, and they're paired to my phone under the name 'Adrian's AirPods'.",
      'IPhone': "The phone has my dog Max (a golden retriever) on the lock screen and my initials 'AL' are engraved on the back near the camera."
    };
    return details[itemName] || "The item has unique identifying characteristics that only the owner would know.";
  };

  // Helper function to get verification images for different items
  const getVerificationImageForItem = (itemName) => {
    const images = {
      'Water Bottle': "https://source.unsplash.com/random/300x400/?water-bottle-blue",
      'UC Davis ID': "https://source.unsplash.com/random/300x400/?student-id-card",
      'Backpack': "https://source.unsplash.com/random/300x400/?backpack-black",
      'Pencil': "https://source.unsplash.com/random/300x400/?mechanical-pencil",
      'Airpods': "https://source.unsplash.com/random/300x400/?airpods-case",
      'IPhone': "https://source.unsplash.com/random/300x400/?iphone-purple-lockscreen"
    };
    return images[itemName] || "https://source.unsplash.com/random/300x400/?lost-item";
  };

  // Add a function to handle receiving verification for user's own item
  useEffect(() => {
    // If this is the Emily Johnson conversation (ID 6) and verification isn't already set
    if (currentConversation.id === 6 && !verificationStatus) {
      // Set this conversation to show the verification needed banner
      setVerificationStatus('need-to-submit');
      
      // Create verification data for the user to review/send
      const userVerificationData = {
        method: 'photo',
        details: "The phone has my dog Max (a golden retriever) on the lock screen and my initials 'AL' are engraved on the back near the camera.",
        image: "https://source.unsplash.com/random/300x400/?iphone-purple-lockscreen",
        timestamp: new Date().toISOString(),
      };
      
      setVerificationData(userVerificationData);
    }
    
    // Original verification handling for other cases
    // If verification is being awaited and a message was sent, simulate receiving verification
    if (verificationStatus === 'awaiting' && chatMessages.length > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      
      // If last message is from finder and mentions "sent" a photo or verification
      if (lastMessage && lastMessage.sender === 'finder' && 
         (lastMessage.text.includes('sent you') || lastMessage.text.includes('photo'))) {
        
        // Create a mock verification received from the claimant
        const claimantVerification = {
          method: 'photo',
          details: "The iPhone has a cracked screen protector and your dog is on the lock screen. I can see the initials 'EJ' on the back near the camera.",
          image: "https://source.unsplash.com/random/300x400/?iphone-purple",
          timestamp: new Date().toISOString(),
        };
        
        setVerificationData(claimantVerification);
        setVerificationStatus('received');
        
        // Add a slight delay to let the UI update first
        setTimeout(() => {
          // Add a system message about receiving verification
          setChatMessages(prevMessages => [
            ...prevMessages,
            {
              id: prevMessages.length + 1,
              text: "📷 Verification received. Review it to confirm this is your item.",
              sender: "system",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 500);
      }
    }
  }, [chatMessages, verificationStatus, currentConversation.id]);

  const handleSend = () => {
    if (message.trim() === '') return;
    
    // Add the new message to the chat
    const newMessage = {
      id: chatMessages.length + 1,
      text: message,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, newMessage]);
    
    // Clear the input field
    setMessage('');
    
    // Simulate a response after a delay (for demo purposes)
    setTimeout(() => {
      const responseText = getAutomaticResponse(currentConversation.item.name);
      setChatMessages(prevMessages => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          text: responseText,
          sender: "finder",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1000);
  };

  // Helper function to generate responses based on the item
  const getAutomaticResponse = (itemName) => {
    // If this is a conversation about verification for the user's own lost item
    if (currentConversation.isUserPost && verificationStatus === 'awaiting') {
      // Simulate the finder sending a response after user submits verification
      return "Thank you for the verification! The details match the phone I found. Would you like to meet somewhere on campus tomorrow to get it back?";
    }
    
    // If this is a user responding to a verification request for items they found
    if (currentConversation.isFounder && verificationStatus === 'need-to-request') {
      return "I appreciate your detailed verification. This definitely matches what I found. When would you like to meet to pick it up?";
    }
    
    // Standard automatic responses
    const responses = {
      'Water Bottle': "That sounds perfect! I'll be there at 3:30 with your water bottle. I'll be looking for you!",
      'UC Davis ID': "1 PM at the MU works great. I'll bring your ID. I'll be near the information desk.",
      'Backpack': "Would you like to meet at the library around 3 PM today to get your backpack?",
      'Pencil': "Yes, I can definitely drop it off at the Chemistry department office tomorrow. It should be at the lost and found there after 10 AM.",
      'Airpods': "You're welcome! Our office is open from 8 AM to 5 PM Monday through Friday. Let us know if you have any questions.",
      'IPhone': "That matches what I can see! I'd be happy to return your phone. Would you like to meet somewhere on campus tomorrow?"
    };
    
    return responses[itemName] || "I'll take good care of your item until we can meet up.";
  };

  const goBack = () => {
    router.back();
  };

  // Handle verification approval
  const handleApproveVerification = () => {
    setVerificationStatus('approved');
    setShowVerificationReviewModal(false);
    
    // Add a system message about the approval
    setChatMessages(prevMessages => [
      ...prevMessages,
      {
        id: prevMessages.length + 1,
        text: "✅ Ownership verification approved. You can now arrange to return the item.",
        sender: "system",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    
    // Add a response from the user
    setTimeout(() => {
      setChatMessages(prevMessages => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          text: "I appreciate your detailed verification. This definitely matches what I found. When would you like to meet to pick it up?",
          sender: "finder",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1000);
    
    // Show confirmation alert
    Alert.alert(
      "Verification Approved",
      "You've confirmed this person is the rightful owner. You can now arrange to return the item.",
      [{ text: "OK" }]
    );
  };
  
  // Handle verification rejection
  const handleRejectVerification = () => {
    setVerificationStatus('rejected');
    setShowVerificationReviewModal(false);
    
    // Add a system message about the rejection
    setChatMessages(prevMessages => [
      ...prevMessages,
      {
        id: prevMessages.length + 1,
        text: "❌ Ownership verification rejected. Please provide more convincing evidence.",
        sender: "system",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Handle submitting verification to a finder
  const handleSubmitVerification = () => {
    // Send a message providing verification
    const newMessage = {
      id: chatMessages.length + 1,
      text: "Here's the verification: The lock screen shows my golden retriever named Max, and my initials 'AL' are engraved on the back near the camera.",
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setVerificationStatus('awaiting');
    setShowVerificationReviewModal(false);
    
    // Simulate response after a short delay
    setTimeout(() => {
      setChatMessages(prevMessages => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          text: "Thank you for the verification! The details match the phone I found. Would you like to meet somewhere on campus tomorrow to get it back?",
          sender: "finder",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      
      // Set verification status to approved after verification is accepted
      setVerificationStatus('approved');
      
      // Add a system message about the approval
      setTimeout(() => {
        setChatMessages(prevMessages => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            text: "✅ Your ownership has been verified. You can now arrange to recover your item.",
            sender: "system",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 500);
      
    }, 1500);
    
    // Display confirmation
    Alert.alert(
      "Verification Submitted",
      "You've submitted verification of your ownership. Wait for the finder to confirm.",
      [{ text: "OK" }]
    );
  };

  // Handle requesting verification from a claimant
  const handleRequestVerification = () => {
    // Send a message requesting verification
    const newMessage = {
      id: chatMessages.length + 1,
      text: "To verify you're the rightful owner, can you please share a photo of the item from before you lost it or provide some unique details about it that only the owner would know?",
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setVerificationStatus('awaiting');
    
    // Display confirmation
    Alert.alert(
      "Verification Requested",
      "You've requested the claimant to verify their ownership. Wait for their response before returning the item.",
      [{ text: "OK" }]
    );
  };

  // Handle reviewing received verification
  const handleReviewVerification = () => {
    setShowVerificationReviewModal(true);
  };

  // Render each chat message
  const renderMessage = ({ item }) => (
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
        {verificationStatus === 'pending' && (
          <VerificationBanner 
            isPending={true} 
            onPress={() => setShowVerificationReviewModal(true)}
          />
        )}
        {verificationStatus === 'approved' && (
          <VerificationBanner 
            isPending={false} 
            onPress={() => {}}
          />
        )}
        {verificationStatus === 'need-to-request' && (
          <TouchableOpacity 
            style={styles.verificationRequestBanner}
            onPress={handleRequestVerification}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#555" />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>
                Verify Ownership
              </Text>
              <Text style={styles.bannerDescription}>
                Before returning your item, request verification from this person
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>
        )}
        {verificationStatus === 'need-to-submit' && (
          <TouchableOpacity 
            style={styles.verificationFulfillBanner}
            onPress={handleReviewVerification}
          >
            <Ionicons name="camera-outline" size={24} color="#4A6572" />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>
                Fulfill Verification Request
              </Text>
              <Text style={styles.bannerDescription}>
                Upload a photo or provide details to verify this is your item
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4A6572" />
          </TouchableOpacity>
        )}
        {verificationStatus === 'awaiting' && (
          <View style={styles.verificationAwaitingBanner}>
            <Ionicons name="time-outline" size={24} color="#555" />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>
                Verification Pending
              </Text>
              <Text style={styles.bannerDescription}>
                Waiting for confirmation of your verification
              </Text>
            </View>
          </View>
        )}
        {verificationStatus === 'received' && (
          <TouchableOpacity 
            style={styles.verificationReceivedBanner}
            onPress={handleReviewVerification}
          >
            <Ionicons name="document-text-outline" size={24} color="#008577" />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>
                Verification Received
              </Text>
              <Text style={styles.bannerDescription}>
                Review the verification to confirm ownership
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#008577" />
          </TouchableOpacity>
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
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSend}
            disabled={message.trim() === ''}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={message.trim() === '' ? "#CCC" : "#8AD3A3"} 
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>

        {/* Verification Review Modal */}
        <VerificationReviewModal
          visible={showVerificationReviewModal}
          onClose={() => setShowVerificationReviewModal(false)}
          data={verificationData}
          onApprove={currentConversation.isUserPost ? handleSubmitVerification : handleApproveVerification}
          onReject={handleRejectVerification}
          isUserSubmittedVerification={!currentConversation.isUserPost}
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
                  onPress={handleGiveKarma}
                >
                  <Ionicons name="star" size={18} color="#333" style={styles.karmaIcon} />
                  <Text style={styles.karmaModalGiveText}>Give Karma</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  pendingBanner: {
    backgroundColor: '#FFF8E1',
    borderBottomColor: '#FFE082',
  },
  reviewedBanner: {
    backgroundColor: '#E8F5E9',
    borderBottomColor: '#A5D6A7',
  },
  bannerTextContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  bannerDescription: {
    fontSize: 13,
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
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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

  // Verification Review Modal Styles
  verificationModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  verificationModalBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  verificationModalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  verificationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  verificationModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  verificationModalCloseBtn: {
    padding: 4,
  },
  verificationModalScroll: {
    padding: 16,
  },
  verificationModalSubtitle: {
    fontSize: 16,
    marginBottom: 16,
    color: '#555',
  },
  verificationSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  verificationInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  verificationPhotoContainer: {
    marginBottom: 24,
  },
  verificationImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  verificationDetailsContainer: {
    marginBottom: 24,
  },
  verificationDetailsBox: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  verificationDetailsText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  verificationQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  verificationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  rejectButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: '#8AD3A3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationRequestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: '#F5F5F5',
    borderBottomColor: '#E0E0E0',
  },
  verificationAwaitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: '#F8F8F8',
    borderBottomColor: '#E0E0E0',
  },
  verificationReceivedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: '#E0F2F1',
    borderBottomColor: '#B2DFDB',
  },
  verificationFulfillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: '#E1F5FE',
    borderBottomColor: '#B3E5FC',
  },
}); 