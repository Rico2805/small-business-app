/**
 * Logout Service
 * Handles sign out functionality for all user types
 */

import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockSignOut, getAuthMode, AUTH_MODES } from './mockAuthService';
import { Alert } from 'react-native';

// Unified logout function that works with both Firebase and mock auth
export const logoutUser = async (navigation) => {
  try {
    // Check which authentication mode we're using
    const authMode = await getAuthMode();
    
    if (authMode === AUTH_MODES.MOCK) {
      // Logout from mock authentication
      await mockSignOut();
    } else {
      // Logout from Firebase
      await signOut(auth);
      
      // Clear any user data from AsyncStorage
      await AsyncStorage.removeItem('@SmallBusinessApp:user');
    }
    
    // Navigate to login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    Alert.alert('Logout Failed', 'There was an error signing out. Please try again.');
    return false;
  }
};
