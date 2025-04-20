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
  
  // Mock data for chat conversations
  const conversations = [
    {
      id: 6,
      name: 'Emily Johnson',
      photo: require('../assets/profile-photos/emily.png'), // Reusing photo as placeholder
      lastMessage: "Great! Before I return it, I need to verify you're the rightful owner. Can you please send me a photo of the phone from before you lost it or provide some unique details about it that only the owner would know?",
      time: '9:22 AM',
      unread: 2,
      item: {
        name: 'IPhone',
        location: 'Davis, CA'
      },
      isFounder: false, // This conversation is about an item you posted
      isUserPost: true, // User posted this item
      needsVerification: true // The claimant needs to be verified
    },
    {
      id: 5,
      name: 'Davis Police Department',
      photo: require('../assets/profile-photos/davisPolice.png'),
      lastMessage: "To verify ownership, please tell us the serial number or Apple ID associated with these AirPods.",
      time: '12:00 PM',
      unread: 1,
      item: {
        name: 'Airpods',
        location: 'Davis, CA'
      },
      isFounder: true // This person found your item
    },
    {
      id: 2,
      name: 'Jane Doe',
      photo: require('../assets/profile-photos/janeDoe.png'),
      lastMessage: "Great! That matches exactly. When would be a good time to meet so I can return it?",
      time: 'Yesterday',
      unread: 2,
      item: {
        name: 'UC Davis ID',
        location: 'Davis, CA'
      },
      isFounder: true // This person found your item
    },
    {
      id: 1,
      name: 'John Doe',
      photo: require('../assets/profile-photos/johnDoe.png'),
      lastMessage: "I'll be there at 3:30 PM. I'll be wearing a red jacket and I'll have your water bottle with me.",
      time: '10:42 AM',
      unread: 0,
      item: {
        name: 'Water Bottle',
        location: 'Davis, CA'
      },
      isFounder: false // You're trying to claim this item
    },
    {
      id: 3,
      name: 'Andrew Lam',
      photo: require('../assets/profile-photos/andrew.png'),
      lastMessage: "That's definitely your backpack! When can I meet you to return it?",
      time: '2 days ago',
      unread: 0,
      item: {
        name: 'Backpack',
        location: 'Davis, CA'
      },
      isFounder: false // You're trying to claim this item
    },
    {
      id: 4,
      name: 'Justin So',
      photo: require('../assets/profile-photos/justin.png'),
      lastMessage: "That's exactly what I found! I can drop it off at the Chemistry department office tomorrow if that works for you?",
      time: '3 days ago',
      unread: 0,
      item: {
        name: 'Pencil',
        location: 'Davis, CA'
      },
      isFounder: true // This person found your item
    }
  ];

  const goBack = () => {
    router.back();
  };

  const handleOpenChat = (conversation) => {
    if (conversation.needsVerification && conversation.isUserPost) {
      router.push(`/chat?userId=user-${conversation.id}&userPost=true`);
    } else {
      router.push(`/chat?userId=user-${conversation.id}`);
    }
  };

  // Render each conversation
  const renderConversation = ({ item }) => {
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
            
            {/* Verification Badge for items that need verification */}
            {item.needsVerification && (
              <View style={styles.verificationBadge}>
                <Ionicons name="shield-checkmark-outline" size={12} color="#555" />
                <Text style={styles.verificationText}>Needs Verification</Text>
              </View>
            )}
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
  verificationBadge: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 6,
  },
  verificationText: {
    fontSize: 10,
    color: '#555',
    marginLeft: 2,
  },
}); 