import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestore } from '../config/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { addLogEntry } from './logsService';

/**
 * Get all businesses data
 * @returns {Promise<Array>} - Array of business objects
 */
export const getAllBusinesses = async () => {
  try {
    // Check if using mock data
    const useMockAuth = await AsyncStorage.getItem('useMockAuth') === 'true';
    
    if (useMockAuth) {
      // Get mock businesses data
      const mockBusinesses = await getMockBusinesses();
      return mockBusinesses;
    } else {
      // Get businesses from Firestore
      const businessesRef = collection(firestore, 'businesses');
      const snapshot = await getDocs(businessesRef);
      
      const businesses = [];
      snapshot.forEach(doc => {
        businesses.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return businesses;
    }
  } catch (error) {
    console.error('Error fetching businesses:', error);
    throw error;
  }
};

/**
 * Get all users data
 * @returns {Promise<Array>} - Array of user objects
 */
export const getAllUsers = async () => {
  try {
    // Check if using mock data
    const useMockAuth = await AsyncStorage.getItem('useMockAuth') === 'true';
    
    if (useMockAuth) {
      // Get mock users data
      const mockUsers = await getMockUsers();
      return mockUsers;
    } else {
      // Get users from Firestore
      const usersRef = collection(firestore, 'users');
      const snapshot = await getDocs(usersRef);
      
      const users = [];
      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return users;
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Get mock businesses data
 * @returns {Promise<Array>} - Array of mock business objects
 */
const getMockBusinesses = async () => {
  try {
    const storedBusinesses = await AsyncStorage.getItem('mockBusinesses');
    
    if (storedBusinesses) {
      return JSON.parse(storedBusinesses);
    }
    
    // Generate mock businesses data if none exists
    const mockBusinesses = generateMockBusinesses();
    await AsyncStorage.setItem('mockBusinesses', JSON.stringify(mockBusinesses));
    
    return mockBusinesses;
  } catch (error) {
    console.error('Error getting mock businesses:', error);
    return generateMockBusinesses();
  }
};

/**
 * Get mock users data
 * @returns {Promise<Array>} - Array of mock user objects
 */
const getMockUsers = async () => {
  try {
    const storedUsers = await AsyncStorage.getItem('mockUsers');
    
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
    
    // Generate mock users data if none exists
    const mockUsers = generateMockUsers();
    await AsyncStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    
    return mockUsers;
  } catch (error) {
    console.error('Error getting mock users:', error);
    return generateMockUsers();
  }
};

/**
 * Generate mock businesses data
 * @returns {Array} - Array of mock business objects
 */
const generateMockBusinesses = () => {
  const businesses = [
    {
      id: 'business1',
      name: 'ABC Restaurant',
      type: 'Restaurant',
      category: 'Food & Beverage',
      description: 'A popular local restaurant serving traditional Cameroonian cuisine.',
      address: '123 Main Street, Yaoundé, Cameroon',
      phone: '+237 123 456 789',
      email: 'info@abcrestaurant.com',
      website: 'www.abcrestaurant.com',
      ownerId: 'user2',
      approved: true,
      featured: true,
      rating: 4.5,
      reviewCount: 28,
      imageUrl: 'https://source.unsplash.com/random/800x600/?restaurant',
      openingHours: {
        monday: '8:00 AM - 10:00 PM',
        tuesday: '8:00 AM - 10:00 PM',
        wednesday: '8:00 AM - 10:00 PM',
        thursday: '8:00 AM - 10:00 PM',
        friday: '8:00 AM - 11:00 PM',
        saturday: '9:00 AM - 11:00 PM',
        sunday: '10:00 AM - 8:00 PM'
      },
      products: [
        {
          id: 'prod1',
          name: 'Ndolé',
          description: 'Traditional Cameroonian dish with bitter leaves and nuts',
          price: 1500,
          currency: 'XAF',
          imageUrl: 'https://source.unsplash.com/random/400x300/?food'
        },
        {
          id: 'prod2',
          name: 'Poulet DG',
          description: 'Director General Chicken - chicken with plantains and vegetables',
          price: 2500,
          currency: 'XAF',
          imageUrl: 'https://source.unsplash.com/random/400x300/?chicken'
        }
      ],
      createdAt: new Date(2023, 0, 15).toISOString()
    },
    {
      id: 'business2',
      name: 'XYZ Store',
      type: 'Retail',
      category: 'Fashion',
      description: 'A boutique store offering the latest fashion trends for men and women.',
      address: '456 Central Avenue, Douala, Cameroon',
      phone: '+237 987 654 321',
      email: 'contact@xyzstore.com',
      website: 'www.xyzstore.com',
      ownerId: 'user3',
      approved: true,
      featured: false,
      rating: 4.2,
      reviewCount: 17,
      imageUrl: 'https://source.unsplash.com/random/800x600/?fashion',
      openingHours: {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 7:00 PM',
        saturday: '10:00 AM - 7:00 PM',
        sunday: 'Closed'
      },
      products: [
        {
          id: 'prod3',
          name: 'Traditional Dress',
          description: 'Hand-made traditional Cameroonian dress',
          price: 8000,
          currency: 'XAF',
          imageUrl: 'https://source.unsplash.com/random/400x300/?dress'
        },
        {
          id: 'prod4',
          name: 'Modern Suit',
          description: 'Contemporary suit with traditional accents',
          price: 15000,
          currency: 'XAF',
          imageUrl: 'https://source.unsplash.com/random/400x300/?suit'
        }
      ],
      createdAt: new Date(2023, 2, 22).toISOString()
    },
    {
      id: 'business3',
      name: 'Tech Shop',
      type: 'Retail',
      category: 'Electronics',
      description: 'Your one-stop shop for all electronics and tech gadgets in Cameroon.',
      address: '789 Innovation Road, Yaoundé, Cameroon',
      phone: '+237 456 789 123',
      email: 'support@techshop.cm',
      website: 'www.techshop.cm',
      ownerId: 'user4',
      approved: true,
      featured: true,
      rating: 4.7,
      reviewCount: 34,
      imageUrl: 'https://source.unsplash.com/random/800x600/?electronics',
      openingHours: {
        monday: '8:30 AM - 7:00 PM',
        tuesday: '8:30 AM - 7:00 PM',
        wednesday: '8:30 AM - 7:00 PM',
        thursday: '8:30 AM - 7:00 PM',
        friday: '8:30 AM - 8:00 PM',
        saturday: '9:00 AM - 6:00 PM',
        sunday: '12:00 PM - 5:00 PM'
      },
      products: [
        {
          id: 'prod5',
          name: 'Smartphone X1',
          description: 'Latest smartphone with high-resolution camera',
          price: 120000,
          currency: 'XAF',
          imageUrl: 'https://source.unsplash.com/random/400x300/?smartphone'
        },
        {
          id: 'prod6',
          name: 'Laptop Pro',
          description: 'Powerful laptop for professionals',
          price: 350000,
          currency: 'XAF',
          imageUrl: 'https://source.unsplash.com/random/400x300/?laptop'
        }
      ],
      createdAt: new Date(2023, 4, 10).toISOString()
    },
    {
      id: 'business4',
      name: 'Corner Cafe',
      type: 'Cafe',
      category: 'Food & Beverage',
      description: 'Cozy cafe serving locally-sourced Cameroonian coffee and pastries.',
      address: '101 Park Plaza, Bamenda, Cameroon',
      phone: '+237 234 567 890',
      email: 'hello@cornercafe.cm',
      website: 'www.cornercafe.cm',
      ownerId: 'user5',
      approved: false,
      featured: false,
      rating: 4.0,
      reviewCount: 12,
      imageUrl: 'https://source.unsplash.com/random/800x600/?cafe',
      openingHours: {
        monday: '7:00 AM - 8:00 PM',
        tuesday: '7:00 AM - 8:00 PM',
        wednesday: '7:00 AM - 8:00 PM',
        thursday: '7:00 AM - 8:00 PM',
        friday: '7:00 AM - 9:00 PM',
        saturday: '8:00 AM - 9:00 PM',
        sunday: '8:00 AM - 6:00 PM'
      },
      products: [
        {
          id: 'prod7',
          name: 'Cameroonian Coffee',
          description: 'Fresh locally-sourced coffee',
          price: 500,
          currency: 'XAF',
          imageUrl: 'https://source.unsplash.com/random/400x300/?coffee'
        },
        {
          id: 'prod8',
          name: 'Pastry Selection',
          description: 'Assortment of fresh pastries',
          price: 1200,
          currency: 'XAF',
          imageUrl: 'https://source.unsplash.com/random/400x300/?pastry'
        }
      ],
      createdAt: new Date(2023, 6, 5).toISOString()
    },
    {
      id: 'business5',
      name: 'Beauty Salon',
      type: 'Service',
      category: 'Beauty',
      description: 'Professional beauty salon offering a range of services for men and women.',
      address: '222 Fashion Street, Douala, Cameroon',
      phone: '+237 345 678 901',
      email: 'appointments@beautysalon.cm',
      website: 'www.beautysalon.cm',
      ownerId: 'user6',
      approved: true,
      featured: false,
      rating: 4.3,
      reviewCount: 23,
      imageUrl: 'https://source.unsplash.com/random/800x600/?salon',
      openingHours: {
        monday: '9:00 AM - 7:00 PM',
        tuesday: '9:00 AM - 7:00 PM',
        wednesday: '9:00 AM - 7:00 PM',
        thursday: '9:00 AM - 7:00 PM',
        friday: '9:00 AM - 8:00 PM',
        saturday: '10:00 AM - 8:00 PM',
        sunday: 'Closed'
      },
      products: [
        {
          id: 'prod9',
          name: 'Hair Styling',
          description: 'Professional hair styling service',
          price: 3000,
          currency: 'XAF',
          imageUrl: 'https://source.unsplash.com/random/400x300/?hair'
        },
        {
          id: 'prod10',
          name: 'Manicure & Pedicure',
          description: 'Complete nail care service',
          price: 5000,
          currency: 'XAF',
          imageUrl: 'https://source.unsplash.com/random/400x300/?nails'
        }
      ],
      createdAt: new Date(2023, 7, 18).toISOString()
    }
  ];
  
  return businesses;
};

/**
 * Generate mock users data
 * @returns {Array} - Array of mock user objects
 */
const generateMockUsers = () => {
  const users = [
    {
      id: 'user1',
      name: 'Franco',
      email: 'developer@camsmallbusiness.com',
      phone: '+237 123 456 789',
      type: 'developer',
      createdAt: new Date(2022, 0, 1).toISOString()
    },
    {
      id: 'user2',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+237 234 567 890',
      type: 'business',
      businessId: 'business1',
      createdAt: new Date(2023, 0, 10).toISOString()
    },
    {
      id: 'user3',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+237 345 678 901',
      type: 'business',
      businessId: 'business2',
      createdAt: new Date(2023, 1, 15).toISOString()
    },
    {
      id: 'user4',
      name: 'David Johnson',
      email: 'david@example.com',
      phone: '+237 456 789 012',
      type: 'business',
      businessId: 'business3',
      createdAt: new Date(2023, 2, 20).toISOString()
    },
    {
      id: 'user5',
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      phone: '+237 567 890 123',
      type: 'business',
      businessId: 'business4',
      createdAt: new Date(2023, 3, 25).toISOString()
    },
    {
      id: 'user6',
      name: 'Michael Brown',
      email: 'michael@example.com',
      phone: '+237 678 901 234',
      type: 'business',
      businessId: 'business5',
      createdAt: new Date(2023, 4, 30).toISOString()
    },
    {
      id: 'user7',
      name: 'Emily Davis',
      email: 'emily@example.com',
      phone: '+237 789 012 345',
      type: 'customer',
      createdAt: new Date(2023, 5, 5).toISOString()
    },
    {
      id: 'user8',
      name: 'Robert Wilson',
      email: 'robert@example.com',
      phone: '+237 890 123 456',
      type: 'customer',
      createdAt: new Date(2023, 6, 10).toISOString()
    },
    {
      id: 'user9',
      name: 'Jennifer Taylor',
      email: 'jennifer@example.com',
      phone: '+237 901 234 567',
      type: 'customer',
      createdAt: new Date(2023, 7, 15).toISOString()
    },
    {
      id: 'user10',
      name: 'Thomas Anderson',
      email: 'thomas@example.com',
      phone: '+237 012 345 678',
      type: 'customer',
      createdAt: new Date(2023, 8, 20).toISOString()
    }
  ];
  
  return users;
};

/**
 * Get system settings
 * @returns {Promise<Object>} - System settings object
 */
export const getSystemSettings = async () => {
  try {
    // Check if using mock data
    const useMockAuth = await AsyncStorage.getItem('useMockAuth') === 'true';
    
    if (useMockAuth) {
      // Get mock system settings
      const storedSettings = await AsyncStorage.getItem('systemSettings');
      
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      
      // Default settings
      const defaultSettings = {
        language: 'en',
        darkMode: false,
        notificationsEnabled: true,
        maintenanceMode: false,
        appVersion: '1.0.0',
        lastUpdate: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
      return defaultSettings;
    } else {
      // Get settings from Firestore
      const settingsDoc = doc(firestore, 'system', 'settings');
      const docSnap = await getDoc(settingsDoc);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Default settings
        const defaultSettings = {
          language: 'en',
          darkMode: false,
          notificationsEnabled: true,
          maintenanceMode: false,
          appVersion: '1.0.0',
          lastUpdate: new Date().toISOString()
        };
        
        await setDoc(settingsDoc, defaultSettings);
        return defaultSettings;
      }
    }
  } catch (error) {
    console.error('Error getting system settings:', error);
    throw error;
  }
};

/**
 * Update system settings
 * @param {Object} settings - Updated settings
 * @returns {Promise<boolean>} - Success status
 */
export const updateSystemSettings = async (settings) => {
  try {
    // Check if using mock data
    const useMockAuth = await AsyncStorage.getItem('useMockAuth') === 'true';
    
    if (useMockAuth) {
      // Update mock system settings
      await AsyncStorage.setItem('systemSettings', JSON.stringify(settings));
      
      // Log the action
      await addLogEntry({
        type: 'system',
        message: 'System settings updated',
        action: 'update'
      });
      
      return true;
    } else {
      // Update settings in Firestore
      const settingsDoc = doc(firestore, 'system', 'settings');
      await updateDoc(settingsDoc, {
        ...settings,
        lastUpdate: new Date().toISOString()
      });
      
      // Log the action
      await addLogEntry({
        type: 'system',
        message: 'System settings updated',
        action: 'update'
      });
      
      return true;
    }
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }
};
