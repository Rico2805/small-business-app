/**
 * Mock Authentication Service
 * Provides offline authentication for testing without Firebase
 */

import { mockLogin, mockUsers } from './mockDataService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Storage Keys
const USER_STORAGE_KEY = '@SmallBusinessApp:user';
const AUTH_MODE_KEY = '@SmallBusinessApp:authMode';

// Auth Modes
export const AUTH_MODES = {
  FIREBASE: 'firebase',
  MOCK: 'mock'
};

// Check if we're using mock auth or real Firebase
export const getAuthMode = async () => {
  try {
    const mode = await AsyncStorage.getItem(AUTH_MODE_KEY);
    return mode || AUTH_MODES.FIREBASE; // Default to Firebase
  } catch (error) {
    console.error('Error getting auth mode:', error);
    return AUTH_MODES.FIREBASE;
  }
};

// Set the auth mode (mock or Firebase)
export const setAuthMode = async (mode) => {
  try {
    await AsyncStorage.setItem(AUTH_MODE_KEY, mode);
    return true;
  } catch (error) {
    console.error('Error setting auth mode:', error);
    return false;
  }
};

// Sign in with email/password (mock version)
export const mockSignIn = async (emailOrUsername, password) => {
  try {
    const authResult = await mockLogin(emailOrUsername, password);
    
    // Store user in AsyncStorage for session persistence
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authResult.user));
    
    return {
      user: authResult.user,
      userType: authResult.type
    };
  } catch (error) {
    throw error;
  }
};

// Get current user from storage
export const getCurrentUser = async () => {
  try {
    const userJSON = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return userJSON ? JSON.parse(userJSON) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Sign out (mock version)
export const mockSignOut = async () => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

// Register mock user (just for testing)
export const mockRegister = async (userData, userType) => {
  try {
    // Generate fake ID
    const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
    
    // Create new mock user
    const newUser = {
      id: newUserId,
      ...userData,
      type: userType,
      profileImage: 'https://via.placeholder.com/150/005792/FFFFFF?text=User',
      isBanned: false,
      language: 'en',
      createdAt: new Date().toISOString()
    };
    
    // In a real app, we would save to Firebase
    // For mock, we just return the new user and store in AsyncStorage
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    
    return {
      user: newUser,
      userType
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw new Error('Failed to register user');
  }
};
