import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Create authentication context
const AuthContext = createContext();

// Hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  async function signup(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  // Logout function
  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  // Fetch user profile data
  async function fetchUserProfile(userId, userType) {
    try {
      const collectionName = userType === 'business' ? 'businesses' : 'customers';
      const userDocRef = doc(db, collectionName, userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        return { id: userDocSnap.id, ...userDocSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Effect to handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is a customer or business
        const customerDoc = await getDoc(doc(db, 'customers', user.uid));
        const businessDoc = await getDoc(doc(db, 'businesses', user.uid));
        
        let profile = null;
        let userType = null;
        
        if (customerDoc.exists()) {
          profile = { id: customerDoc.id, ...customerDoc.data() };
          userType = 'customer';
        } else if (businessDoc.exists()) {
          profile = { id: businessDoc.id, ...businessDoc.data() };
          userType = 'business';
        } else {
          // Check if user is a developer
          const developerDoc = await getDoc(doc(db, 'developers', user.uid));
          if (developerDoc.exists()) {
            profile = { id: developerDoc.id, ...developerDoc.data() };
            userType = 'developer';
          }
        }
        
        setCurrentUser({ ...user, userType });
        setUserProfile(profile);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    signup,
    logout,
    fetchUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
