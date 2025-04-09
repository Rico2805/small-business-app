// This file provides mock implementations of Firebase services
// Use this for development when Firebase integration is causing issues

// Mock Authentication
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    // Return an unsubscribe function
    return () => {};
  },
  signInWithEmailAndPassword: async (email, password) => {
    // Simulate successful login
    auth.currentUser = {
      uid: 'mock-user-id',
      email,
      displayName: 'Mock User'
    };
    return { user: auth.currentUser };
  },
  createUserWithEmailAndPassword: async (email, password) => {
    // Simulate successful registration
    auth.currentUser = {
      uid: 'mock-user-id',
      email,
      displayName: 'New Mock User'
    };
    return { user: auth.currentUser };
  },
  signOut: async () => {
    auth.currentUser = null;
    return true;
  }
};

// Mock Firestore
const mockCollections = {
  users: [
    { id: 'user1', name: 'John Doe', email: 'john@example.com', type: 'customer', isBanned: false },
    { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', type: 'customer', isBanned: false },
    { id: 'user3', name: 'Business Owner', email: 'business@example.com', type: 'business', businessId: 'business1', isBanned: false }
  ],
  businesses: [
    { id: 'business1', name: 'ABC Store', description: 'General Store', isApproved: true, location: { latitude: 4.0435, longitude: 9.7860 } },
    { id: 'business2', name: 'XYZ Restaurant', description: 'Local Food', isApproved: false, location: { latitude: 4.0445, longitude: 9.7870 } }
  ],
  products: [
    { id: 'product1', name: 'Product A', description: 'Description for Product A', price: 1000, businessId: 'business1', available: true, category: 'Electronics' },
    { id: 'product2', name: 'Product B', description: 'Description for Product B', price: 2000, businessId: 'business1', available: true, category: 'Clothing' },
    { id: 'product3', name: 'Product C', description: 'Description for Product C', price: 3000, businessId: 'business2', available: false, category: 'Food' }
  ],
  orders: [
    { 
      id: 'order1', 
      userId: 'user1', 
      businessId: 'business1', 
      items: [
        { id: 'product1', name: 'Product A', price: 1000, quantity: 2 }
      ],
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentStatus: 'pending',
      deliveryAddress: '123 Main St'
    }
  ],
  conversations: [
    {
      id: 'conversation1',
      participants: ['user1', 'business1'],
      lastMessage: 'Hello there!',
      lastMessageTimestamp: new Date().toISOString(),
      lastSenderId: 'user1'
    }
  ],
  messages: {
    'conversation1': [
      { id: 'message1', senderId: 'user1', content: 'Hello there!', timestamp: new Date().toISOString(), isRead: false },
      { id: 'message2', senderId: 'business1', content: 'How can I help you?', timestamp: new Date().toISOString(), isRead: false }
    ]
  },
  systemSettings: {
    settings: {
      allowNewRegistrations: true,
      maintenanceMode: false,
      allowPayments: true,
      defaultLanguage: 'en'
    }
  }
};

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock Firestore document reference
const docRef = (collection, id) => ({
  id,
  collection,
  data: mockCollections[collection]?.find(item => item.id === id),
  get: async () => {
    // Special case for systemSettings since it's structured differently
    if (collection === 'systemSettings' && id === 'settings') {
      return {
        exists: true,
        data: () => mockCollections.systemSettings.settings,
        id
      };
    }
    
    const data = mockCollections[collection]?.find(item => item.id === id);
    return {
      exists: !!data,
      data: () => data || null,
      id
    };
  },
  set: async (data) => {
    // Special case for systemSettings
    if (collection === 'systemSettings' && id === 'settings') {
      mockCollections.systemSettings.settings = { 
        ...mockCollections.systemSettings.settings, 
        ...data 
      };
      return true;
    }
    
    if (!mockCollections[collection]) {
      mockCollections[collection] = [];
    }
    
    const index = mockCollections[collection].findIndex(item => item.id === id);
    if (index >= 0) {
      mockCollections[collection][index] = { ...mockCollections[collection][index], ...data };
    } else {
      mockCollections[collection].push({ id, ...data });
    }
    return true;
  },
  update: async (data) => {
    // Special case for systemSettings
    if (collection === 'systemSettings' && id === 'settings') {
      mockCollections.systemSettings.settings = { 
        ...mockCollections.systemSettings.settings, 
        ...data 
      };
      return true;
    }
    
    if (!mockCollections[collection]) {
      mockCollections[collection] = [];
      return true;
    }
    
    const index = mockCollections[collection].findIndex(item => item.id === id);
    if (index >= 0) {
      mockCollections[collection][index] = { ...mockCollections[collection][index], ...data };
    }
    return true;
  },
  delete: async () => {
    // Special case for systemSettings
    if (collection === 'systemSettings' && id === 'settings') {
      mockCollections.systemSettings.settings = {};
      return true;
    }
    
    if (!mockCollections[collection]) {
      return true;
    }
    
    const index = mockCollections[collection].findIndex(item => item.id === id);
    if (index >= 0) {
      mockCollections[collection].splice(index, 1);
    }
    return true;
  }
});

// Mock Firestore collection reference
const collectionRef = (collection) => ({
  add: async (data) => {
    const id = generateId();
    mockCollections[collection].push({ id, ...data });
    return { id };
  },
  get: async () => {
    return {
      docs: mockCollections[collection].map(item => ({
        id: item.id,
        data: () => item
      }))
    };
  },
  where: (field, operator, value) => {
    return {
      get: async () => {
        let filtered = [...mockCollections[collection]];
        
        if (operator === '==') {
          filtered = filtered.filter(item => item[field] === value);
        } else if (operator === '!=') {
          filtered = filtered.filter(item => item[field] !== value);
        } else if (operator === 'array-contains') {
          filtered = filtered.filter(item => Array.isArray(item[field]) && item[field].includes(value));
        }
        
        return {
          docs: filtered.map(item => ({
            id: item.id,
            data: () => item
          })),
          empty: filtered.length === 0
        };
      },
      orderBy: () => ({
        get: async () => {
          let filtered = [...mockCollections[collection]];
          
          if (operator === '==') {
            filtered = filtered.filter(item => item[field] === value);
          } else if (operator === '!=') {
            filtered = filtered.filter(item => item[field] !== value);
          } else if (operator === 'array-contains') {
            filtered = filtered.filter(item => Array.isArray(item[field]) && item[field].includes(value));
          }
          
          return {
            docs: filtered.map(item => ({
              id: item.id,
              data: () => item
            })),
            empty: filtered.length === 0
          };
        }
      })
    };
  },
  orderBy: () => ({
    get: async () => {
      return {
        docs: mockCollections[collection].map(item => ({
          id: item.id,
          data: () => item
        }))
      };
    }
  })
});

// Mock Firestore
export const db = {
  collection: (collectionName) => collectionRef(collectionName),
  doc: (collectionPath, docId) => {
    if (docId) {
      return docRef(collectionPath, docId);
    } else {
      // Handle path format like 'collection/docId'
      const parts = collectionPath.split('/');
      if (parts.length >= 2) {
        const coll = parts[0];
        const doc = parts[1];
        return docRef(coll, doc);
      }
    }
  }
};

// Mock Storage
export const storage = {
  ref: (path) => ({
    put: async (file) => {
      return {
        ref: {
          getDownloadURL: async () => `https://mock-firebase-storage.com/${path}`
        }
      };
    },
    getDownloadURL: async () => `https://mock-firebase-storage.com/${path}`
  })
};

// Export Firestore functions for compatibility with your services
export const collection = (db, name) => db.collection(name);
export const doc = (db, path, docId) => db.doc(path, docId);
export const addDoc = async (collectionRef, data) => collectionRef.add(data);
export const updateDoc = async (docRef, data) => docRef.update(data);
export const deleteDoc = async (docRef) => docRef.delete();
export const getDoc = async (docRef) => docRef.get();
export const getDocs = async (querySnapshot) => querySnapshot.get();
export const query = (collectionRef, ...constraints) => {
  let ref = collectionRef;
  for (const constraint of constraints) {
    if (typeof constraint === 'function') {
      ref = constraint(ref);
    }
  }
  return ref;
};
export const where = (field, operator, value) => (collectionRef) => collectionRef.where(field, operator, value);
export const orderBy = (field, direction) => (collectionRef) => collectionRef.orderBy(field, direction);
export const Timestamp = {
  now: () => new Date().toISOString()
};
