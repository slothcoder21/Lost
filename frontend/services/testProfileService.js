import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from './firebaseConfig';

// Test user IDs - these will be used with the format 'user-{id}'
// to match the IDs we're using in the item detail modal and chat
const TEST_USERS = {
  1: {
    uid: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    pronouns: 'he/him',
    karmaScore: 7,
    photoURL: require('../assets/profile-photos/johnDoe.png'),
    email: 'john.doe@example.com',
    phoneNumber: '(555) 123-4567',
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date()
  },
  2: {
    uid: 'user-2',
    firstName: 'Jane',
    lastName: 'Doe',
    pronouns: 'she/her',
    karmaScore: 12,
    photoURL: require('../assets/profile-photos/janeDoe.png'),
    email: 'jane.doe@example.com',
    phoneNumber: '(555) 987-6543',
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date()
  },
  3: {
    uid: 'user-3',
    firstName: 'Andrew',
    lastName: 'Lam',
    pronouns: 'he/him',
    karmaScore: 5,
    photoURL: require('../assets/profile-photos/andrew.png'),
    email: 'andrew.lam@example.com',
    phoneNumber: '(555) 222-3333',
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date()
  },
  4: {
    uid: 'user-4',
    firstName: 'Justin',
    lastName: 'So',
    pronouns: 'he/him',
    karmaScore: 3,
    photoURL: require('../assets/profile-photos/justin.png'),
    email: 'justin.so@example.com',
    phoneNumber: '(555) 444-5555',
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date()
  },
  5: {
    uid: 'user-5',
    firstName: 'Davis',
    lastName: 'Police Department',
    pronouns: 'they/them',
    karmaScore: 25,
    photoURL: require('../assets/profile-photos/davisPolice.png'),
    email: 'lost.found@davis.gov',
    phoneNumber: '(555) 911-0000',
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date()
  }
};

/**
 * Set up test user profiles in Firestore
 * For development/demo purposes only
 * This is now a no-op function since we're not using Firebase
 */
export const setupTestProfiles = async () => {
  // We're not using Firebase now, so just return true
  console.log('Using local test profiles instead of Firebase');
  return true;
};

/**
 * Get a test user by ID
 * For demo purposes when actual Firestore data isn't available
 */
export const getTestUser = (id) => {
  return TEST_USERS[id] || null;
};

/**
 * Mock function to get a test user profile for demo purposes
 * Uses static data directly - no Firebase
 */
export const getTestUserProfile = async (userId) => {
  // Extract the numeric ID from the userId (format: 'user-1', 'user-2', etc.)
  const idMatch = userId.match(/user-(\d+)/);
  if (idMatch && idMatch[1]) {
    const numericId = parseInt(idMatch[1], 10);
    return TEST_USERS[numericId] || null;
  }
  
  return null;
}; 