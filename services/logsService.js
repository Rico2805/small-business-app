import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestore } from '../config/firebase';
import { collection, addDoc, query, orderBy, getDocs, limit } from 'firebase/firestore';

// In-memory logs cache for quick access
let logsCache = [];

/**
 * Get system logs with optional filtering
 * @param {Object} options - Filter options
 * @param {string} options.type - Log type (user, business, system, error)
 * @param {number} options.limit - Maximum number of logs to fetch
 * @param {boolean} options.forceRefresh - Bypass cache and fetch fresh data
 * @returns {Promise<Array>} - Array of log objects
 */
export const getSystemLogs = async (options = {}) => {
  const { type, limit: limitCount = 100, forceRefresh = false } = options;
  
  // Use mock data for development/testing
  const useMockData = await AsyncStorage.getItem('useMockAuth') === 'true';
  
  try {
    // Return cached logs if available and refresh not forced
    if (logsCache.length > 0 && !forceRefresh) {
      if (type) {
        return logsCache.filter(log => log.type === type);
      }
      return logsCache;
    }
    
    if (useMockData) {
      // Use mock logs data
      const logs = await getMockLogs();
      logsCache = logs;
      
      if (type) {
        return logs.filter(log => log.type === type);
      }
      return logs;
    } else {
      // Get logs from Firestore
      const logsRef = collection(firestore, 'logs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      const logs = [];
      snapshot.forEach(doc => {
        logs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      logsCache = logs;
      
      if (type) {
        return logs.filter(log => log.type === type);
      }
      return logs;
    }
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

/**
 * Add a new log entry to the system
 * @param {Object} logData - The log data
 * @param {string} logData.type - Log type (user, business, system, error)
 * @param {string} logData.message - Log message
 * @param {string} logData.user - Username if applicable
 * @param {string} logData.businessId - Business ID if applicable
 * @param {string} logData.action - Action performed
 * @returns {Promise<string>} - ID of the created log
 */
export const addLogEntry = async (logData) => {
  try {
    const logEntry = {
      ...logData,
      timestamp: new Date().toISOString()
    };
    
    // Use mock data for development/testing
    const useMockData = await AsyncStorage.getItem('useMockAuth') === 'true';
    
    if (useMockData) {
      // Add to local storage for mock
      const existingLogs = await getMockLogs();
      logEntry.id = 'log_' + Date.now();
      existingLogs.unshift(logEntry);
      await AsyncStorage.setItem('mockLogs', JSON.stringify(existingLogs));
      
      // Update cache
      logsCache = existingLogs;
      
      return logEntry.id;
    } else {
      // Add to Firestore
      const logsRef = collection(firestore, 'logs');
      const docRef = await addDoc(logsRef, logEntry);
      
      // Update cache
      logEntry.id = docRef.id;
      logsCache.unshift(logEntry);
      
      return docRef.id;
    }
  } catch (error) {
    console.error('Error adding log entry:', error);
    throw error;
  }
};

/**
 * Get mock logs data for development
 * @returns {Promise<Array>} - Array of mock log objects
 */
const getMockLogs = async () => {
  try {
    const storedLogs = await AsyncStorage.getItem('mockLogs');
    
    if (storedLogs) {
      return JSON.parse(storedLogs);
    }
    
    // Generate mock logs if none exist
    const mockLogs = generateMockLogs(50);
    await AsyncStorage.setItem('mockLogs', JSON.stringify(mockLogs));
    
    return mockLogs;
  } catch (error) {
    console.error('Error getting mock logs:', error);
    return generateMockLogs(50);
  }
};

/**
 * Generate mock log entries for development
 * @param {number} count - Number of logs to generate
 * @returns {Array} - Array of mock log objects
 */
const generateMockLogs = (count) => {
  const types = ['user', 'business', 'system', 'error', 'security'];
  const users = ['admin@example.com', 'developer@camsmallbusiness.com', 'franco@camsmallbusiness.com'];
  const businesses = ['ABC Restaurant', 'XYZ Store', 'Tech Shop', 'Fashion Boutique', 'Corner Cafe'];
  const actions = ['create', 'update', 'delete', 'approve', 'reject', 'login', 'logout'];
  
  const userMessages = [
    'User account created',
    'User profile updated',
    'User password changed',
    'User logged in',
    'User logged out',
    'User account locked due to multiple failed login attempts',
    'User role changed to business owner',
    'User email verified'
  ];
  
  const businessMessages = [
    'Business created',
    'Business profile updated',
    'Business approved',
    'Business rejected',
    'Business product added',
    'Business product updated',
    'Business product deleted',
    'Business order received',
    'Business payment processed'
  ];
  
  const systemMessages = [
    'System started',
    'System backup created',
    'System restored from backup',
    'Database migrated',
    'Cache cleared',
    'Settings updated',
    'Maintenance mode enabled',
    'Maintenance mode disabled',
    'Language settings updated'
  ];
  
  const errorMessages = [
    'Failed to connect to database',
    'Authentication error',
    'Permission denied',
    'Resource not found',
    'Operation timed out',
    'Invalid input data',
    'File upload failed',
    'Payment processing error',
    'API rate limit exceeded'
  ];
  
  const logs = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const timestamp = new Date(now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString();
    
    let message = '';
    let user = null;
    let businessId = null;
    let action = null;
    
    if (type === 'user') {
      message = userMessages[Math.floor(Math.random() * userMessages.length)];
      user = users[Math.floor(Math.random() * users.length)];
      action = actions[Math.floor(Math.random() * actions.length)];
    } else if (type === 'business') {
      message = businessMessages[Math.floor(Math.random() * businessMessages.length)];
      businessId = businesses[Math.floor(Math.random() * businesses.length)];
      user = users[Math.floor(Math.random() * users.length)];
      action = actions[Math.floor(Math.random() * actions.length)];
    } else if (type === 'error') {
      message = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    } else {
      message = systemMessages[Math.floor(Math.random() * systemMessages.length)];
      action = actions[Math.floor(Math.random() * actions.length)];
    }
    
    logs.push({
      id: 'log_' + (i + 1),
      type,
      message,
      timestamp,
      user,
      businessId,
      action
    });
  }
  
  // Sort by timestamp (newest first)
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return logs;
};

/**
 * Clear system logs
 * @param {string} type - Log type to clear (all if not specified)
 * @returns {Promise<boolean>} - Success status
 */
export const clearLogs = async (type) => {
  try {
    const useMockData = await AsyncStorage.getItem('useMockAuth') === 'true';
    
    if (useMockData) {
      if (type) {
        // Only clear logs of specific type
        const logs = await getMockLogs();
        const filteredLogs = logs.filter(log => log.type !== type);
        await AsyncStorage.setItem('mockLogs', JSON.stringify(filteredLogs));
        logsCache = filteredLogs;
      } else {
        // Clear all logs
        await AsyncStorage.removeItem('mockLogs');
        logsCache = [];
      }
    } else {
      // For real implementation, we would delete from Firestore
      // This would require admin permissions and batch delete operations
      console.warn('Clearing logs from Firestore not implemented');
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing logs:', error);
    throw error;
  }
};
