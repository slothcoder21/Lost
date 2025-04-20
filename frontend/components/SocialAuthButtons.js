import React from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * A component that renders social authentication buttons (Facebook, Google, Apple)
 * 
 * @param {Object} props
 * @param {Function} props.onPressFacebook - Callback for Facebook button press
 * @param {Function} props.onPressGoogle - Callback for Google button press
 * @param {Function} props.onPressApple - Callback for Apple button press
 * @param {boolean} props.loading - Whether loading state is active
 * @param {string} props.activeProvider - The provider that is currently loading
 */
const SocialAuthButtons = ({ 
  onPressFacebook, 
  onPressGoogle, 
  onPressApple, 
  loading = false, 
  activeProvider = null 
}) => {
  return (
    <View style={styles.socialButtons}>
      <TouchableOpacity 
        style={styles.socialButton} 
        onPress={onPressFacebook}
        disabled={loading}
      >
        {loading && activeProvider === 'Facebook' ? (
          <ActivityIndicator size="small" color="#3b5998" />
        ) : (
          <Image 
            source={require('../assets/facebook-icon.png')}
            style={styles.socialIcon}
          />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.socialButton}
        onPress={onPressGoogle}
        disabled={loading}
      >
        {loading && activeProvider === 'Google' ? (
          <ActivityIndicator size="small" color="#db4437" />
        ) : (
          <Image 
            source={require('../assets/google-icon.png')}
            style={styles.socialIcon}
          />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.socialButton}
        onPress={onPressApple}
        disabled={loading}
      >
        {loading && activeProvider === 'Apple' ? (
          <ActivityIndicator size="small" color="#000000" />
        ) : (
          <Image 
            source={require('../assets/apple-icon.png')}
            style={styles.socialIcon}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    width: 25,
    height: 25,
  },
});

export default SocialAuthButtons; 