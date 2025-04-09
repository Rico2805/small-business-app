import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';

// Place an order
export const placeOrder = async (userId, businessId, items, deliveryAddress, paymentMethod) => {
  try {
    const ordersRef = collection(db, 'orders');
    const newOrder = await addDoc(ordersRef, {
      userId,
      businessId,
      items,
      deliveryAddress,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      location: null, // Will be updated during delivery
      paymentStatus: 'pending'
    });
    
    return {
      id: newOrder.id,
      userId,
      businessId,
      items,
      deliveryAddress,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

// Get order details
export const getOrderDetails = async (orderId) => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (orderDoc.exists()) {
      return {
        id: orderDoc.id,
        ...orderDoc.data()
      };
    }
    throw new Error('Order not found');
  } catch (error) {
    console.error('Error getting order details:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Update order location for tracking
export const updateOrderLocation = async (orderId, location) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      location,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating order location:', error);
    throw error;
  }
};

// Get orders by user ID
export const getOrdersByUserId = async (userId) => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return orders;
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

// Get orders by business ID
export const getOrdersByBusinessId = async (businessId) => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc')
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return orders;
  } catch (error) {
    console.error('Error getting business orders:', error);
    throw error;
  }
};

// Mark order as paid
export const markOrderAsPaid = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      paymentStatus: 'paid',
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error marking order as paid:', error);
    throw error;
  }
};
