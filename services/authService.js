import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';

// Developer credentials
const DEVELOPER_USERNAME = 'Franco';
const DEVELOPER_PASSWORD = 'Rico&2004';

// Register user
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      email,
      createdAt: new Date().toISOString(),
      isBanned: false
    });
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Register business
export const registerBusiness = async (email, password, businessData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save business data to Firestore
    await setDoc(doc(db, 'businesses', user.uid), {
      ...businessData,
      email,
      createdAt: new Date().toISOString(),
      isApproved: false,
      ownerId: user.uid
    });
    
    // Also create a user record for the business owner
    await setDoc(doc(db, 'users', user.uid), {
      name: businessData.ownerName,
      email,
      type: 'business',
      businessId: user.uid,
      createdAt: new Date().toISOString(),
      isBanned: false
    });
    
    return user;
  } catch (error) {
    console.error('Error registering business:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Check if user is banned
      if (userData.isBanned) {
        await signOut(auth);
        throw new Error('Account has been banned');
      }
      
      // Check if business is approved
      if (userData.type === 'business') {
        const businessDoc = await getDoc(doc(db, 'businesses', userData.businessId));
        if (businessDoc.exists()) {
          const businessData = businessDoc.data();
          if (!businessData.isApproved) {
            throw new Error('Business account is pending approval');
          }
        }
      }
      
      return {
        uid: user.uid,
        email: user.email,
        ...userData
      };
    }
    
    return user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Developer login
export const loginDeveloper = async (username, password) => {
  try {
    console.log('Attempting developer login...');
    
    // Network check
    try {
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        timeout: 5000 
      });
      
      if (!response.ok) {
        console.log('Network check failed: Unable to reach Google');
        throw new Error('Network check failed: Cannot reach external services');
      } else {
        console.log('Network check passed');
      }
    } catch (netError) {
      console.error('Network check error:', netError);
      throw new Error('Network error: Please check your internet connection');
    }
    
    // Skip Firebase connection check for developer login
    console.log('Developer mode: Skipping Firebase connection check');
    
    // Actual developer login logic
    if (username === DEVELOPER_USERNAME && password === DEVELOPER_PASSWORD) {
      console.log('Developer credentials matched');
      return { 
        success: true, 
        userData: { 
          id: 'developer123', 
          name: DEVELOPER_USERNAME, 
          role: 'developer' 
        } 
      };
    } else {
      console.log('Developer credentials did not match');
      throw new Error('Invalid developer credentials');
    }
  } catch (error) {
    console.error('Error in developer login:', error);
    throw error;
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Get current user with Firestore data
export const getCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return {
        uid: user.uid,
        email: user.email,
        ...userDoc.data()
      };
    }
    
    return {
      uid: user.uid,
      email: user.email
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return {
      uid: user.uid,
      email: user.email
    };
  }
};
