import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from './firebaseConfig';
import { clearAuthData } from './asyncStorageService';
import { Platform } from 'react-native';

// Variable to track if we've initialized persistence
let persistenceInitialized = false;

/**
 * Initialize auth without persistence
 * @returns {Promise<Object|null>} User object or null
 */
export const initializeAuth = async () => {
  if (persistenceInitialized) return auth.currentUser;
  
  try {
    persistenceInitialized = true;
    return auth.currentUser;
  } catch (error) {
    console.error('Error initializing auth:', error);
    return null;
  }
};

/**
 * Register a new user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object
 */
export const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error('Registration error:', error.code, error.message);
    throw error;
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error('Login error:', error.code, error.message);
    throw error;
  }
};

/**
 * Get the current authenticated user
 * @returns {Promise<Object|null>} Current user or null if not authenticated
 */
export const getCurrentUser = async () => {
  return auth.currentUser;
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    
    // Clear stored data if any exists
    if (Platform.OS !== 'web') {
      await clearAuthData();
    }
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Create or update a user's profile
 * @param {Object} profileData - User profile data
 * @param {File} profileImage - Profile image file (optional)
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (profileData, profileImage = null) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    let photoURL = user.photoURL;
    
    // Upload profile image if provided
    if (profileImage) {
      const imageRef = ref(storage, `profile_images/${user.uid}`);
      const response = await fetch(profileImage);
      const blob = await response.blob();
      
      // Upload image to Firebase Storage
      await uploadBytes(imageRef, blob);
      
      // Get download URL
      photoURL = await getDownloadURL(imageRef);
    }
    
    // Update auth profile
    await updateProfile(user, {
      displayName: `${profileData.firstName} ${profileData.lastName}`,
      photoURL: photoURL
    });
    
    // Store additional user data in Firestore
    const userRef = doc(firestore, 'users', user.uid);
    
    // Check if user document exists
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Update existing document
      await updateDoc(userRef, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        pronouns: profileData.pronouns,
        photoURL: photoURL,
        updatedAt: new Date()
      });
    } else {
      // Create new document
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        pronouns: profileData.pronouns,
        photoURL: photoURL,
        karmaScore: 0, // Initialize karma score for new users
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Get user profile data from Firestore
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (userId = null) => {
  try {
    const uid = userId || auth.currentUser?.uid;
    
    if (!uid) {
      throw new Error('No user ID provided');
    }
    
    const userRef = doc(firestore, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Increment a user's karma score
 * @param {string} userId - User ID whose karma should be incremented
 * @param {number} amount - Amount to increment (defaults to 1)
 * @returns {Promise<Object>} Updated user profile data
 */
export const incrementKarmaScore = async (userId, amount = 1) => {
  try {
    if (!userId) {
      throw new Error('No user ID provided');
    }
    
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User profile not found');
    }
    
    const userData = userSnap.data();
    const currentKarma = userData.karmaScore || 0;
    const newKarma = currentKarma + amount;
    
    await updateDoc(userRef, {
      karmaScore: newKarma,
      updatedAt: new Date()
    });
    
    return {
      ...userData,
      karmaScore: newKarma
    };
  } catch (error) {
    console.error('Increment karma error:', error);
    throw error;
  }
};

/**
 * Get a user's karma score
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<number>} User's karma score
 */
export const getKarmaScore = async (userId = null) => {
  try {
    const profile = await getUserProfile(userId);
    return profile.karmaScore || 0;
  } catch (error) {
    console.error('Get karma error:', error);
    return 0;
  }
};

/**
 * Sign in with Google
 * @returns {Promise<Object>} User object
 */
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    let result;
    
    // Choose the appropriate method based on platform
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      result = await signInWithPopup(auth, provider);
    } else {
      await signInWithRedirect(auth, provider);
      result = await getRedirectResult(auth);
    }
    
    // Store user data for persistence on mobile
    if (Platform.OS !== 'web' && result?.user) {
      await storeUserData(result.user);
      await setAuthState(true);
    }
    
    return result;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
};

/**
 * Sign in with Facebook
 * @returns {Promise<Object>} User object
 */
export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    let result;
    
    // Choose the appropriate method based on platform
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      result = await signInWithPopup(auth, provider);
    } else {
      await signInWithRedirect(auth, provider);
      result = await getRedirectResult(auth);
    }
    
    // Store user data for persistence on mobile
    if (Platform.OS !== 'web' && result?.user) {
      await storeUserData(result.user);
      await setAuthState(true);
    }
    
    return result;
  } catch (error) {
    console.error('Facebook Sign In Error:', error);
    throw error;
  }
};

/**
 * Sign in with Apple
 * @returns {Promise<Object>} User object
 */
export const signInWithApple = async () => {
  try {
    const provider = new OAuthProvider('apple.com');
    let result;
    
    // Choose the appropriate method based on platform
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      result = await signInWithPopup(auth, provider);
    } else {
      await signInWithRedirect(auth, provider);
      result = await getRedirectResult(auth);
    }
    
    // Store user data for persistence on mobile
    if (Platform.OS !== 'web' && result?.user) {
      await storeUserData(result.user);
      await setAuthState(true);
    }
    
    return result;
  } catch (error) {
    console.error('Apple Sign In Error:', error);
    throw error;
  }
};

/**
 * Listen for auth state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export const listenToAuthChanges = (auth, callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Create a test user account for development
 * This should only be used in development, not in production
 * @returns {Promise<Object>} User credential
 */
export const createTestUser = async () => {
  if (!IS_DEV) {
    console.warn('Attempted to create test user in production environment');
    return null;
  }
  
  try {
    // Check if the user already exists
    try {
      const existingUserCredential = await signInWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
      console.log('Test user already exists');
      
      // Sign out immediately to avoid staying logged in
      await firebaseSignOut(auth);
      
      return existingUserCredential;
    } catch (error) {
      // User doesn't exist, create new one
      if (error.code === 'auth/user-not-found') {
        const userCredential = await createUserWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
        
        // Add basic profile info
        await updateProfile(userCredential.user, {
          displayName: 'Test User'
        });
        
        // Create user doc in Firestore
        const userRef = doc(firestore, 'users', userCredential.user.uid);
        await setDoc(userRef, {
          uid: userCredential.user.uid,
          email: DEV_EMAIL,
          firstName: 'Test',
          lastName: 'User',
          karmaScore: 0, // Initialize karma score
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('Created new test user');
        
        // Sign out immediately to avoid staying logged in
        await firebaseSignOut(auth);
        
        return userCredential;
      }
      
      // Some other error
      throw error;
    }
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}; 