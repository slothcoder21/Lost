import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ItemCard({ item, onPress, onDelete }) {
  const router = useRouter();

  const handleClaim = (e) => {
    // Prevent triggering the card press
    e.stopPropagation();
    
    // If item is found, add verification parameter
    if (item.status === 'Found') {
      router.push(`/chat?userId=user-${item.id}&verification=true`);
    } else {
      // For lost items, just go to regular chat
      router.push(`/chat?userId=user-${item.id}`);
    }
  };

  const handleDelete = (e) => {
    // Prevent triggering the card press
    e.stopPropagation();
    
    // Call the onDelete function passed from parent
    if (onDelete) {
      onDelete(item.id);
    }
  };

  // Format date to a readable string
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date instanceof Date ? date.toLocaleDateString('en-US', options) : '';
  };

  // Function to render the image based on type (require import or URI)
  const renderItemImage = () => {
    if (!item.image) {
      // If no image, use placeholder
      return (
        <Image 
          source={require('../assets/placeholder.png')} 
          style={styles.itemImage}
          resizeMode="cover"
        />
      );
    }
    
    // Check if image is a string (URI) or an object (require import)
    if (typeof item.image === 'string') {
      // It's a URI string (from user-added items)
      return (
        <Image 
          source={{ uri: item.image }} 
          style={styles.itemImage} 
          resizeMode="cover" 
        />
      );
    } else {
      // It's a require import (from mock data)
      return (
        <Image 
          source={item.image} 
          style={styles.itemImage} 
          resizeMode="cover" 
        />
      );
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress && onPress(item)}
      activeOpacity={0.8}
    >
      {/* Item Image Container */}
      <View style={styles.imageContainer}>
        {renderItemImage()}
        {item.date && (
          <View style={styles.dateTag}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>
        )}
        {/* Status Tag (Lost/Found) */}
        {item.status && (
          <View style={[styles.statusTag, item.status === 'Lost' ? styles.lostTag : styles.foundTag]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Title */}
        <Text style={styles.itemTitle}>{item.title}</Text>
        
        {/* Location if available */}
        {item.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#555" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}
        
        {/* Item Description */}
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
        )}
        
        <View style={styles.founderInfo}>
          <Text style={styles.foundByText}>Reported By: </Text>
          
          <View style={styles.founderProfile}>
            {/* Profile image circle */}
            {item.foundBy.image ? (
              <Image 
                source={item.foundBy.image} 
                style={styles.profileImage} 
              />
            ) : (
              <Image 
                source={require('../assets/profile-placeholder.png')} 
                style={styles.profileImage}
              />
            )}
            <Text style={styles.founderName}>{item.foundBy.name}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Claim Button */}
          <TouchableOpacity 
            style={styles.claimButton} 
            onPress={handleClaim}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#000" style={styles.buttonIcon} />
            <Text style={styles.claimButtonText}>Claim</Text>
          </TouchableOpacity>

          {/* Delete Button - Mobile optimized view */}
          {item.postedByUser && (
            <TouchableOpacity 
              style={styles.deleteButtonMobile}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 12,
    overflow: 'hidden',
    // Enhanced shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  dateTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  statusTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    zIndex: 1,
  },
  lostTag: {
    backgroundColor: 'rgba(231, 76, 60, 0.9)', // Red for lost items
  },
  foundTag: {
    backgroundColor: 'rgba(46, 204, 113, 0.9)', // Green for found items
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  founderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  foundByText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  founderProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  founderName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: '#8AD3A3',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Add a slight shadow to the button
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 6,
  },
  claimButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteButtonMobile: {
    backgroundColor: '#E74C3C',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 