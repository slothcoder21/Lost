import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const AUTH_USER_KEY = '@auth_user';
const AUTH_STATE_KEY = '@auth_state';

/**
 * Store the user data in AsyncStorage
 * @param {Object} user - User object to store
 * @returns {Promise<void>}
 */
export const storeUserData = async (user) => {
  try {
    if (!user) {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      return;
    }
    
    // Convert user object to string for storage
    const userData = JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
      providerId: user.providerId,
    });
    
    await AsyncStorage.setItem(AUTH_USER_KEY, userData);
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

/**
 * Get the stored user data from AsyncStorage
 * @returns {Promise<Object|null>} User object or null
 */
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(AUTH_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Set authentication state
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @returns {Promise<void>}
 */
export const setAuthState = async (isAuthenticated) => {
  try {
    await AsyncStorage.setItem(AUTH_STATE_KEY, JSON.stringify(isAuthenticated));
  } catch (error) {
    console.error('Error setting auth state:', error);
  }
};

/**
 * Get authentication state
 * @returns {Promise<boolean>} Whether user is authenticated
 */
export const getAuthState = async () => {
  try {
    const authState = await AsyncStorage.getItem(AUTH_STATE_KEY);
    return authState ? JSON.parse(authState) : false;
  } catch (error) {
    console.error('Error getting auth state:', error);
    return false;
  }
};

/**
 * Clear all authentication data
 * @returns {Promise<void>}
 */
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([AUTH_USER_KEY, AUTH_STATE_KEY]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}; 