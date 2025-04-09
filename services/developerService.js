import { db } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { withOfflineFallback, handleFirebaseError } from './firebaseErrorHandler';

// Get all users
export const getUsers = async () => {
  return withOfflineFallback(async () => {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return usersList;
  }, []);
};

// Get all businesses
export const getBusinesses = async () => {
  return withOfflineFallback(async () => {
    const businessesCollection = collection(db, 'businesses');
    const businessesSnapshot = await getDocs(businessesCollection);
    const businessesList = businessesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return businessesList;
  }, []);
};

// Approve a business account
export const approveBusinessAccount = async (businessId) => {
  try {
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
      isApproved: true
    });
    return true;
  } catch (error) {
    console.error('Error approving business:', error);
    throw error;
  }
};

// Ban a user
export const banUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isBanned: true
    });
    return true;
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

// Get pending business registrations
export const getPendingBusinessRegistrations = async () => {
  try {
    const businessesCollection = collection(db, 'businesses');
    const businessesSnapshot = await getDocs(businessesCollection);
    const pendingBusinesses = businessesSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(business => !business.isApproved);
    return pendingBusinesses;
  } catch (error) {
    console.error('Error getting pending businesses:', error);
    throw error;
  }
};

// Default system settings
const DEFAULT_SETTINGS = {
  allowNewRegistrations: true,
  maintenanceMode: false,
  allowPayments: true,
  defaultLanguage: 'en'
};

// Get system settings
export const getSystemSettings = async () => {
  return withOfflineFallback(async () => {
    const systemSettingsRef = doc(db, 'systemSettings', 'settings');
    const systemSettingsSnapshot = await getDoc(systemSettingsRef);
    if (systemSettingsSnapshot.exists()) {
      return systemSettingsSnapshot.data();
    } else {
      // If settings don't exist, create them with defaults
      await setDoc(systemSettingsRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  }, DEFAULT_SETTINGS);
};

// Update system settings
export const updateSystemSettings = async (settings) => {
  return withOfflineFallback(async () => {
    const systemSettingsRef = doc(db, 'systemSettings', 'settings');
    try {
      // Try updating first (works if doc exists)
      await updateDoc(systemSettingsRef, settings);
    } catch (error) {
      // If update fails because doc doesn't exist, create it
      if (error.code === 'not-found') {
        await setDoc(systemSettingsRef, settings);
      } else {
        throw error;
      }
    }
    return true;
  }, false);
};
