/**
 * Mock email authentication service
 * This file provides placeholder functions for email-based authentication
 */

// Store user data locally for demo purposes
let users = [];
let currentUser = null;

/**
 * Register a new user with email and password
 * @param {string} email - User's email address
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
 * Sign in an existing user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} User object
 */
export const loginWithEmail = async (email, password) => {
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
    console.error('Login error:', error.code, error.message);
    throw error;
  }
};

/**
 * Send password reset email (mock)
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async (email) => {
  try {
    // Find user
    const user = users.find(user => user.email === email);
    
    // Check if user exists
    if (!user) {
      const error = new Error('User not found');
      error.code = 'auth/user-not-found';
      throw error;
    }
    
    // Simulate sending email
    console.log(`Password reset email sent to ${email}`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Password reset error:', error.code, error.message);
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