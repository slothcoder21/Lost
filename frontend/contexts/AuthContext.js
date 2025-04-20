import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  getCurrentUser,
  listenToAuthChanges,
  initializeAuth
} from '../services/firebaseAuthService';
import { auth } from '../services/firebaseConfig';
import { Platform } from 'react-native';

// Create context
export const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Initialize auth
        await initializeAuth();
        
        // Set up auth state listener
        const unsubscribe = listenToAuthChanges(auth, (user) => {
          setCurrentUser(user);
          setLoading(false);
        });
        
        setInitialized(true);
        
        // Clean up listener on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Check if user is authenticated - now simply checks Firebase's current user
  const isAuthenticated = async () => {
    return !!currentUser;
  };

  // Values to provide in context
  const contextValue = {
    currentUser,
    loading,
    initialized,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 