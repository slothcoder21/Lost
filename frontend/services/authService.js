/**
 * Mock authentication service
 * This file provides placeholder functions for social authentication
 */

// Store user data locally for demo purposes
let currentUser = null;
// Mock users database
let users = [
  {
    uid: 'email-123456',
    email: 'test@example.com',
    password: 'password123', // In a real app, this would be encrypted
    displayName: 'Test User',
    photoURL: 'https://via.placeholder.com/150',
    provider: 'password'
  }
];

/**
 * Register with Email (mock)
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object
 */
export const registerWithEmail = async (email, password) => {
  try {
    // Check if email is already registered
    if (users.some(user => user.email === email)) {
      const error = new Error('Email already in use');
      error.code = 'auth/email-already-in-use';
      throw error;
    }
    
    // Basic email validation
    if (!email.includes('@')) {
      const error = new Error('Invalid email');
      error.code = 'auth/invalid-email';
      throw error;
    }
    
    // Password validation
    if (password.length < 6) {
      const error = new Error('Weak password');
      error.code = 'auth/weak-password';
      throw error;
    }
    
    // Create new user
    const newUser = {
      uid: 'email-' + Date.now(),
      email,
      password, // Note: In a real app, this would be encrypted
      displayName: email.split('@')[0],
      photoURL: null,
      provider: 'password'
    };
    
    // Add to users array
    users.push(newUser);
    
    // Set as current user
    currentUser = newUser;
    
    // Return user credential
    return { user: newUser };
  } catch (error) {
    console.error('Register error:', error.code, error.message);
    throw error;
  }
};

/**
 * Sign in with Email (mock)
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object
 */
export const signInWithEmail = async (email, password) => {
  try {
    // Find user
    const user = users.find(user => user.email === email);
    
    // Check if user exists
    if (!user) {
      const error = new Error('User not found');
      error.code = 'auth/user-not-found';
      throw error;
    }
    
    // Validate password
    if (user.password !== password) {
      const error = new Error('Wrong password');
      error.code = 'auth/wrong-password';
      throw error;
    }
    
    // Set as current user
    currentUser = user;
    
    // Return user credential
    return { user };
  } catch (error) {
    console.error('Email Sign In Error:', error);
    throw error;
  }
};

/**
 * Sign in with Facebook (mock)
 * @returns {Promise<Object>} User object
 */
export const signInWithFacebook = async () => {
  try {
    // Mock successful login
    const mockUser = {
      uid: 'facebook-123456',
      email: 'facebook-user@example.com',
      displayName: 'Facebook User',
      photoURL: 'https://via.placeholder.com/150',
      provider: 'facebook.com'
    };
    
    currentUser = mockUser;
    return { user: mockUser };
  } catch (error) {
    console.error('Facebook Sign In Error:', error);
    throw error;
  }
};

/**
 * Sign in with Google (mock)
 * @returns {Promise<Object>} User object
 */
export const signInWithGoogle = async () => {
  try {
    // Mock successful login
    const mockUser = {
      uid: 'google-123456',
      email: 'google-user@example.com',
      displayName: 'Google User',
      photoURL: 'https://via.placeholder.com/150',
      provider: 'google.com'
    };
    
    currentUser = mockUser;
    return { user: mockUser };
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
};

/**
 * Sign in with Apple (mock)
 * @returns {Promise<Object>} User object
 */
export const signInWithApple = async () => {
  try {
    // Mock successful login
    const mockUser = {
      uid: 'apple-123456',
      email: 'apple-user@example.com',
      displayName: 'Apple User',
      photoURL: 'https://via.placeholder.com/150',
      provider: 'apple.com'
    };
    
    currentUser = mockUser;
    return { user: mockUser };
  } catch (error) {
    console.error('Apple Sign In Error:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 * @returns {Object|null} Current user or null if not authenticated
 */
export const getCurrentUser = () => {
  return currentUser;
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  currentUser = null;
  return Promise.resolve();
}; 