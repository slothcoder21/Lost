import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ChatsPage() {
  const router = useRouter();
  
  // Updated conversations showing different stages of interactions
  const conversations = [
    {
      id: 6,
      name: 'Emily Johnson',
      photo: require('../assets/profile-photos/emily.png'),
      lastMessage: "I think I found your iPhone! Could you verify it's yours by sharing some unique details or a photo from before you lost it?",
      time: '9:22 AM',
      unread: 2,
      item: {
        name: 'iPhone',
        location: 'Davis, CA'
      },
      isFounder: true, // This person found your lost item
      isUserPost: true, // User posted this item
      status: 'verification_requested', // Waiting for you to provide verification
      verificationProgress: 0 // Just started verification process
    },
    {
      id: 5,
      name: 'Davis Police Department',
      photo: require('../assets/profile-photos/davisPolice.png'),
      lastMessage: "We've received your photo verification. Reviewing it now - we'll get back to you shortly.",
      time: '12:00 PM',
      unread: 1,
      item: {
        name: 'Airpods',
        location: 'Davis, CA'
      },
      isFounder: true, // They found your item
      status: 'verification_in_progress', // Verification submitted and under review
      verificationProgress: 50 // Halfway through verification process
    },
    {
      id: 2,
      name: 'Jane Doe',
      photo: require('../assets/profile-photos/janeDoe.png'),
      lastMessage: "Your verification has been approved! I'd be happy to return your UC Davis ID. Would the MU be a good place to meet tomorrow at 2pm?",
      time: 'Yesterday',
      unread: 2,
      item: {
        name: 'UC Davis ID',
        location: 'Davis, CA'
      },
      isFounder: true, // They found your item
      status: 'verification_approved', // Verification complete, arranging meetup
      verificationProgress: 100 // Verification complete
    },
    {
      id: 1,
      name: 'John Doe',
      photo: require('../assets/profile-photos/johnDoe.png'),
      lastMessage: "Perfect! I'll be at the Silo at 3:30 PM today. I'll be wearing a red jacket and I'll have your water bottle with me. Look for me near the outdoor tables.",
      time: '10:42 AM',
      unread: 0,
      item: {
        name: 'Water Bottle',
        location: 'Davis, CA'
      },
      isFounder: true, // They found your item
      status: 'meetup_arranged', // Meeting time and place set
      verificationProgress: 100 // Verification complete
    },
    {
      id: 3,
      name: 'Andrew Lam',
      photo: require('../assets/profile-photos/andrew.png'),
      lastMessage: "Thanks for meeting me today! I'm glad we were able to return your backpack. Would you mind giving karma points for returning it?",
      time: '2 days ago',
      unread: 0,
      item: {
        name: 'Backpack',
        location: 'Davis, CA'
      },
      isFounder: true, // They found your item
      status: 'item_returned', // Item has been returned
      verificationProgress: 100 // Verification complete
    },
    {
      id: 4,
      name: 'Justin So',
      photo: require('../assets/profile-photos/justin.png'),
      lastMessage: "I found your pencil, but I need to verify you're the owner. Could you tell me any unique details about it, like specific marks or when you last had it?",
      time: '3 days ago',
      unread: 3,
      item: {
        name: 'Pencil',
        location: 'Davis, CA'
      },
      isFounder: false, // You found their item
      isClaimant: true, // They're claiming the item you found
      status: 'awaiting_verification', // Waiting for their response
      verificationProgress: 10 // Just started verification process
    }
  ];

  const goBack = () => {
    router.back();
  };

  const handleOpenChat = (conversation) => {
    // Pass all relevant status information to the chat page
    router.push({
      pathname: '/chat',
      params: {
        userId: `user-${conversation.id}`,
        userPost: conversation.isUserPost ? 'true' : 'false',
        verificationStatus: conversation.status,
        verificationProgress: conversation.verificationProgress.toString()
      }
    });
  };

  // Render each conversation
  const renderConversation = ({ item }) => {
    // Helper function to generate appropriate status badge
    const getStatusBadge = (convo) => {
      let badgeText = '';
      let badgeColor = '';
      let iconName = '';
      
      switch(convo.status) {
        case 'verification_requested':
          badgeText = 'Verification Needed';
          badgeColor = '#FFA000'; // Amber
          iconName = 'shield-outline';
          break;
        case 'verification_in_progress':
          badgeText = 'Verifying...';
          badgeColor = '#2196F3'; // Blue
          iconName = 'time-outline';
          break;
        case 'verification_approved':
          badgeText = 'Verified';
          badgeColor = '#4CAF50'; // Green
          iconName = 'shield-checkmark';
          break;
        case 'meetup_arranged':
          badgeText = 'Meetup Set';
          badgeColor = '#9C27B0'; // Purple
          iconName = 'calendar';
          break;
        case 'item_returned':
          badgeText = 'Returned';
          badgeColor = '#8AD3A3'; // App green
          iconName = 'checkmark-circle';
          break;
        case 'awaiting_verification':
          badgeText = 'Awaiting Proof';
          badgeColor = '#FF5722'; // Deep Orange
          iconName = 'hourglass-outline';
          break;
        default:
          return null;
      }
      
      return (
        <View style={[styles.statusBadge, {backgroundColor: badgeColor}]}>
          <Ionicons name={iconName} size={12} color="#fff" />
          <Text style={styles.statusBadgeText}>{badgeText}</Text>
        </View>
      );
    };
    
    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => handleOpenChat(item)}
      >
        {/* Profile Picture */}
        <Image 
          source={item.photo}
          style={styles.conversationPhoto}
          resizeMode="cover"
        />
        
        {/* Conversation details */}
        <View style={styles.conversationDetails}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName}>{item.name}</Text>
            <Text style={styles.conversationTime}>{item.time}</Text>
          </View>
          
          <View style={styles.conversationMeta}>
            {/* Item Name */}
            <Text style={styles.itemName}>
              {item.isFounder ? "Found: " : "Lost: "}{item.item.name}
            </Text>
            
            {/* Status Badge */}
            {getStatusBadge(item)}
          </View>
          
          <View style={styles.conversationFooter}>
            <Text style={styles.conversationMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
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
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.backButton} />
        </View>

        {/* Conversations list */}
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.conversationsList}
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
  conversationsList: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  conversationPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  conversationDetails: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conversationMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#8AD3A3',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 3,
  },
}); 