/**
 * Firebase Error Handler Service
 * Handles common Firebase errors with appropriate fallbacks for offline mode
 */

import { Alert } from 'react-native';

/**
 * Determine if a Firebase error is network-related
 */
const isNetworkError = (error) => {
  return error.code === 'unavailable' || 
    error.message?.includes('network') || 
    error.message?.includes('offline') ||
    error.message?.includes('backend');
};

/**
 * Handle Firebase errors with different strategies based on error type
 */
export const handleFirebaseError = (error, fallback = null, silent = false) => {
  // Check if this is a network/offline error
  if (isNetworkError(error)) {
    if (!silent) {
      console.warn('Firebase is offline, using cached data if available');
    }
    return fallback; // Return fallback data for offline mode
  }
  
  // For authentication errors
  if (error.code?.startsWith('auth/')) {
    if (!silent) {
      Alert.alert('Authentication Error', 'Please sign in again to continue.');
    }
    return fallback;
  }
  
  // For permission errors
  if (error.code === 'permission-denied') {
    if (!silent) {
      Alert.alert('Access Denied', 'You do not have permission to access this data.');
    }
    return fallback;
  }
  
  // For all other errors
  console.error('Firebase Error:', error);
  if (!silent) {
    Alert.alert('Error', 'Something went wrong. Please try again later.');
  }
  return fallback;
};

/**
 * Try to execute a Firebase operation with offline fallback
 */
export const withOfflineFallback = async (operation, fallbackData = null, silent = false) => {
  try {
    return await operation();
  } catch (error) {
    return handleFirebaseError(error, fallbackData, silent);
  }
};

/**
 * Add offline persistence to Firestore
 */
export const enableOfflinePersistence = (firestore) => {
  try {
    firestore.enablePersistence({ synchronizeTabs: true })
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab at a time
          console.warn('Firebase persistence could not be enabled: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          // The current browser does not support persistence
          console.warn('Firebase persistence not supported in this environment');
        }
      });
  } catch (error) {
    console.error('Error enabling offline persistence:', error);
  }
};
