/**
 * Mock Data Service
 * Provides offline mock data for testing the app without Firebase connection
 */

// Mock Users
export const mockUsers = [
  {
    id: 'customer1',
    name: 'Test Customer',
    email: 'customer@test.com',
    phone: '+237 677889900',
    type: 'customer',
    profileImage: 'https://via.placeholder.com/150/005792/FFFFFF?text=Customer',
    isBanned: false,
    language: 'en',
    address: 'Yaounde, Cameroon'
  },
  {
    id: 'business1',
    name: 'Test Business Owner',
    email: 'business@test.com',
    phone: '+237 677112233',
    type: 'business',
    profileImage: 'https://via.placeholder.com/150/005792/FFFFFF?text=Business',
    isBanned: false,
    language: 'en'
  },
  {
    id: 'developer1',
    name: 'Franco',
    email: 'franco@dev.com',
    phone: '+237 699887766',
    type: 'developer',
    profileImage: 'https://via.placeholder.com/150/005792/FFFFFF?text=Developer',
    isBanned: false,
    language: 'en'
  }
];

// Mock Businesses
export const mockBusinesses = [
  {
    id: 'biz1',
    name: 'Douala Fresh Foods',
    ownerId: 'business1',
    category: 'Food & Grocery',
    description: 'Fresh local produce and groceries',
    address: 'Douala, Littoral, Cameroon',
    phone: '+237 677112233',
    email: 'business@test.com',
    rating: 4.5,
    isApproved: true,
    coverImage: 'https://via.placeholder.com/800x400/005792/FFFFFF?text=Douala+Fresh+Foods',
    logo: 'https://via.placeholder.com/200/005792/FFFFFF?text=DFF',
    location: {
      latitude: 4.0511,
      longitude: 9.7679
    },
    openingHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '09:00', close: '16:00' },
      sunday: { open: 'Closed', close: 'Closed' }
    },
    paymentMethods: ['MTN Momo', 'Cash on Delivery'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'biz2',
    name: 'Yaoundé Tech Shop',
    ownerId: 'business1',
    category: 'Electronics',
    description: 'Quality electronics and tech accessories',
    address: 'Yaoundé, Centre, Cameroon',
    phone: '+237 677445566',
    email: 'techshop@test.com',
    rating: 4.2,
    isApproved: true,
    coverImage: 'https://via.placeholder.com/800x400/00BBE4/FFFFFF?text=Yaounde+Tech+Shop',
    logo: 'https://via.placeholder.com/200/00BBE4/FFFFFF?text=YTS',
    location: {
      latitude: 3.8480,
      longitude: 11.5021
    },
    openingHours: {
      monday: { open: '09:00', close: '19:00' },
      tuesday: { open: '09:00', close: '19:00' },
      wednesday: { open: '09:00', close: '19:00' },
      thursday: { open: '09:00', close: '19:00' },
      friday: { open: '09:00', close: '19:00' },
      saturday: { open: '10:00', close: '16:00' },
      sunday: { open: 'Closed', close: 'Closed' }
    },
    paymentMethods: ['MTN Momo', 'Cash on Delivery', 'Bank Transfer'],
    createdAt: new Date().toISOString()
  }
];

// Mock Products
export const mockProducts = [
  {
    id: 'prod1',
    businessId: 'biz1',
    name: 'Fresh Tomatoes',
    description: 'Locally grown tomatoes, fresh from the farm',
    price: 1500,
    available: true,
    category: 'Vegetables',
    imageUrl: 'https://via.placeholder.com/300x300/FF6347/FFFFFF?text=Tomatoes',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod2',
    businessId: 'biz1',
    name: 'Plantains',
    description: 'Sweet plantains, perfect for grilling',
    price: 2000,
    available: true,
    category: 'Fruits',
    imageUrl: 'https://via.placeholder.com/300x300/FFDF00/FFFFFF?text=Plantains',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod3',
    businessId: 'biz2',
    name: 'Smartphone Charger',
    description: 'Fast USB-C charger for all modern smartphones',
    price: 5000,
    available: true,
    category: 'Accessories',
    imageUrl: 'https://via.placeholder.com/300x300/005792/FFFFFF?text=Charger',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod4',
    businessId: 'biz2',
    name: 'Bluetooth Speaker',
    description: 'Portable wireless speaker with great sound quality',
    price: 15000,
    available: true,
    category: 'Audio',
    imageUrl: 'https://via.placeholder.com/300x300/00BBE4/FFFFFF?text=Speaker',
    createdAt: new Date().toISOString()
  }
];

// Mock Orders
export const mockOrders = [
  {
    id: 'order1',
    customerId: 'customer1',
    businessId: 'biz1',
    items: [
      { productId: 'prod1', name: 'Fresh Tomatoes', quantity: 3, price: 1500 },
      { productId: 'prod2', name: 'Plantains', quantity: 2, price: 2000 }
    ],
    total: 8500,
    status: 'Out for Delivery',
    deliveryAddress: 'Yaoundé, Centre Region',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    specialInstructions: 'Please call before delivery',
    createdAt: new Date().toISOString(),
    deliveryLocation: {
      latitude: 3.8480,
      longitude: 11.5021
    },
    driverInfo: {
      name: 'Driver Test',
      phone: '+237 677998877',
      photo: 'https://via.placeholder.com/150/005792/FFFFFF?text=Driver'
    }
  },
  {
    id: 'order2',
    customerId: 'customer1',
    businessId: 'biz2',
    items: [
      { productId: 'prod4', name: 'Bluetooth Speaker', quantity: 1, price: 15000 }
    ],
    total: 15000,
    status: 'Preparing',
    deliveryAddress: 'Yaoundé, Centre Region',
    paymentMethod: 'MTN Momo',
    paymentStatus: 'Paid',
    specialInstructions: '',
    createdAt: new Date().toISOString(),
    deliveryLocation: {
      latitude: 3.8480,
      longitude: 11.5021
    },
    driverInfo: null
  }
];

// Mock Business Posts (for Explore page)
export const mockPosts = [
  {
    id: 'post1',
    businessId: 'biz1',
    businessName: 'Douala Fresh Foods',
    businessLogo: 'https://via.placeholder.com/50/005792/FFFFFF?text=DFF',
    content: 'New fresh produce just arrived! Come check out our tomatoes and plantains.',
    imageUrl: 'https://via.placeholder.com/500x300/005792/FFFFFF?text=Fresh+Produce',
    likes: 24,
    comments: [
      {
        userId: 'customer1',
        userName: 'Test Customer',
        content: 'Great! I\'ll be stopping by today.',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'post2',
    businessId: 'biz2',
    businessName: 'Yaoundé Tech Shop',
    businessLogo: 'https://via.placeholder.com/50/00BBE4/FFFFFF?text=YTS',
    content: 'New shipment of Bluetooth speakers and chargers! Limited stock available.',
    imageUrl: 'https://via.placeholder.com/500x300/00BBE4/FFFFFF?text=Electronics',
    likes: 15,
    comments: [],
    createdAt: new Date().toISOString()
  }
];

// Mock System Settings
export const mockSystemSettings = {
  allowNewRegistrations: true,
  maintenanceMode: false,
  allowPayments: true,
  defaultLanguage: 'en'
};

// Mock Authentication Service
export const mockLogin = (email, password) => {
  // Login credentials for test accounts
  const testCredentials = {
    'customer@test.com': { password: 'test123', userId: 'customer1', type: 'customer' },
    'business@test.com': { password: 'test123', userId: 'business1', type: 'business' },
    'Franco': { password: 'Rico&2004', userId: 'developer1', type: 'developer' }
  };

  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      const userCredentials = testCredentials[email];
      
      if (userCredentials && userCredentials.password === password) {
        const user = mockUsers.find(u => u.id === userCredentials.userId);
        resolve({ user, type: userCredentials.type });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1000);
  });
};

// Helper function to get mock data based on ID
export const getMockBusinessById = (id) => mockBusinesses.find(b => b.id === id);
export const getMockProductsByBusinessId = (businessId) => mockProducts.filter(p => p.businessId === businessId);
export const getMockOrdersByCustomerId = (customerId) => mockOrders.filter(o => o.customerId === customerId);
export const getMockOrdersByBusinessId = (businessId) => mockOrders.filter(o => o.businessId === businessId);
