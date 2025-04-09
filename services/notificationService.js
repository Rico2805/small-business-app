import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// Get notifications for a user
export const getUserNotifications = async (userId) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    const notifications = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Send a notification to a user
export const sendNotification = async (recipientId, notification) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const newNotification = await addDoc(notificationsRef, {
      recipientId,
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    });
    return {
      id: newNotification.id,
      recipientId,
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all user notifications as read
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    const updatePromises = notificationsSnapshot.docs.map(doc => {
      const notificationRef = doc.ref;
      return updateDoc(notificationRef, {
        read: true,
        readAt: new Date().toISOString()
      });
    });
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Send an order confirmation notification
export const sendOrderConfirmationNotification = async (userId, orderId, businessName) => {
  return sendNotification(userId, {
    type: 'order_confirmed',
    title: 'Order Confirmed',
    body: `Your order has been confirmed by ${businessName} and will be delivered soon.`,
    data: { orderId }
  });
};

// Send an order declined notification
export const sendOrderDeclinedNotification = async (userId, orderId, businessName, reason) => {
  return sendNotification(userId, {
    type: 'order_declined',
    title: 'Order Declined',
    body: `Your order has been declined by ${businessName}. Reason: ${reason || 'Not specified'}`,
    data: { orderId }
  });
};

// Send a new order notification to business
export const sendNewOrderNotification = async (businessId, orderId, customerName) => {
  return sendNotification(businessId, {
    type: 'new_order',
    title: 'New Order Received',
    body: `You have received a new order from ${customerName}.`,
    data: { orderId }
  });
};

// Send a message notification
export const sendMessageNotification = async (recipientId, senderId, senderName, message, conversationId) => {
  return sendNotification(recipientId, {
    type: 'message',
    title: `New message from ${senderName}`,
    body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
    data: { senderId, senderName, conversationId }
  });
};

// Get unread notification count for a user
export const getUnreadNotificationCount = async (userId) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    return notificationsSnapshot.docs.length;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }
};
