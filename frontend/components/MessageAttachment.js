import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * MessageAttachment - Component to handle different types of attachments in chat messages
 * 
 * @param {Object} data - The attachment data
 * @param {string} data.type - Type of attachment ('image', 'verification')
 * @param {string} data.uri - URI of the image
 * @param {Object} data.verificationData - Additional verification data if this is a verification attachment
 * @param {function} onAction - Callback for when an action is taken on the attachment
 * @param {string} userRole - The role of the user viewing this attachment ('owner', 'finder')
 */
export default function MessageAttachment({ data, onAction, userRole }) {
  if (!data) return null;

  // Handle regular image attachments
  if (data.type === 'image') {
    return (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => onAction && onAction('view-image', data.uri)}
      >
        <Image 
          source={{ uri: data.uri }} 
          style={styles.image} 
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  // Handle verification attachments
  if (data.type === 'verification') {
    const { method, details, image, status, reviewed } = data.verificationData || {};
    
    return (
      <View style={styles.verificationContainer}>
        <View style={styles.verificationHeader}>
          <Ionicons name="shield-checkmark" size={16} color="#4A6572" />
          <Text style={styles.verificationTitle}>Ownership Verification</Text>
          {status && (
            <View style={[
              styles.verificationStatusBadge,
              status === 'approved' ? styles.approvedBadge : 
              status === 'rejected' ? styles.rejectedBadge : 
              styles.pendingBadge
            ]}>
              <Text style={styles.verificationStatusText}>
                {status === 'approved' ? 'Approved' : 
                 status === 'rejected' ? 'Rejected' : 
                 'Pending'}
              </Text>
            </View>
          )}
        </View>
        
        {/* Show image if this is a photo verification */}
        {method === 'photo' && image && (
          <TouchableOpacity 
            onPress={() => onAction && onAction('view-image', image)}
            style={styles.verificationImageContainer}
          >
            <Image 
              source={{ uri: image }} 
              style={styles.verificationImage} 
              resizeMode="cover"
            />
            <View style={styles.verificationImageOverlay}>
              <Text style={styles.verificationImageText}>View Photo</Text>
            </View>
          </TouchableOpacity>
        )}
        
        {/* Show details if provided */}
        {details && (
          <View style={styles.verificationDetailsContainer}>
            <Text style={styles.verificationDetailsText}>{details}</Text>
          </View>
        )}
        
        {/* Action buttons for finders reviewing verification */}
        {userRole === 'finder' && !reviewed && (
          <View style={styles.verificationActions}>
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={() => onAction && onAction('reject', data.verificationData)}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.approveButton}
              onPress={() => onAction && onAction('approve', data.verificationData)}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Default empty view for unsupported attachment types
  return null;
}

const styles = StyleSheet.create({
  // Regular image attachment styles
  imageContainer: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  
  // Verification attachment styles
  verificationContainer: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8AD3A3',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6572',
    marginLeft: 6,
    flex: 1,
  },
  verificationStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: '#E8F5E9',
  },
  rejectedBadge: {
    backgroundColor: '#FFEBEE',
  },
  pendingBadge: {
    backgroundColor: '#FFF8E1',
  },
  verificationStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  verificationImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  verificationImage: {
    width: '100%',
    height: '100%',
  },
  verificationImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  verificationImageText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  verificationDetailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  verificationDetailsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  verificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  rejectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  rejectButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  approveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#8AD3A3',
  },
  approveButtonText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '500',
  },
}); 