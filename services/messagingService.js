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
  Timestamp,
  limit 
} from 'firebase/firestore';

// Send message
export const sendMessage = async (conversationId, senderId, receiverId, content) => {
  try {
    // If no conversationId provided, find or create one
    if (!conversationId) {
      conversationId = await getOrCreateConversation(senderId, receiverId);
    }
    
    // Add message to conversation
    const messagesRef = collection(db, `conversations/${conversationId}/messages`);
    await addDoc(messagesRef, {
      senderId,
      content,
      timestamp: Timestamp.now(),
      isRead: false
    });
    
    // Update conversation with latest message
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: content,
      lastMessageTimestamp: Timestamp.now(),
      lastSenderId: senderId
    });
    
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get or create conversation between two users
const getOrCreateConversation = async (userId1, userId2) => {
  try {
    // Check if conversation already exists
    const participants = [userId1, userId2].sort(); // Sort to ensure consistent order
    
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', '==', participants)
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery);
    
    // If conversation exists, return its ID
    if (!conversationsSnapshot.empty) {
      return conversationsSnapshot.docs[0].id;
    }
    
    // Create new conversation
    const newConversationRef = await addDoc(collection(db, 'conversations'), {
      participants,
      createdAt: Timestamp.now(),
      lastMessage: null,
      lastMessageTimestamp: null,
      lastSenderId: null
    });
    
    return newConversationRef.id;
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    throw error;
  }
};

// Alias for getUserConversations to match MessagingScreen API
export const getConversations = async (userId) => {
  return getUserConversations(userId);
};

// Get user conversations
export const getUserConversations = async (userId) => {
  try {
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTimestamp', 'desc')
    );
    
    const conversationsSnapshot = await getDocs(conversationsQuery);
    const conversations = [];
    
    for (const doc of conversationsSnapshot.docs) {
      const conversationData = doc.data();
      
      // Get other participant's ID
      const otherUserId = conversationData.participants.find(id => id !== userId);
      
      conversations.push({
        id: doc.id,
        otherUserId,
        lastMessage: conversationData.lastMessage,
        lastMessageTimestamp: conversationData.lastMessageTimestamp,
        lastSenderId: conversationData.lastSenderId
      });
    }
    
    return conversations;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};

// Alias for getConversationMessages to match MessagingScreen API
export const getMessages = async (conversationId) => {
  return getConversationMessages(conversationId);
};

// Get conversation messages
export const getConversationMessages = async (conversationId) => {
  try {
    const messagesQuery = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy('timestamp', 'asc')
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return messages;
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
};

// Mark message as read
export const markMessageAsRead = async (conversationId, messageId) => {
  try {
    const messageRef = doc(db, `conversations/${conversationId}/messages`, messageId);
    await updateDoc(messageRef, {
      isRead: true
    });
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Send message to developer
export const sendMessageToDeveloper = async (userId, content) => {
  // Developer has a fixed ID
  const developerId = 'developer';
  return sendMessage(userId, developerId, content);
};

// Search conversations by recipient name
export const searchConversations = async (userId, searchQuery) => {
  try {
    const allConversations = await getUserConversations(userId);
    
    // Filter conversations client-side based on recipient name
    // In a real app, you would implement this on the server with proper search capabilities
    if (!searchQuery) return allConversations;
    
    const filteredConversations = allConversations.filter(conversation => 
      conversation.otherUserName && 
      conversation.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return filteredConversations;
  } catch (error) {
    console.error('Error searching conversations:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadMessageCount = async (userId) => {
  try {
    const conversations = await getUserConversations(userId);
    let unreadCount = 0;
    
    for (const conversation of conversations) {
      const messagesQuery = query(
        collection(db, `conversations/${conversation.id}/messages`),
        where('isRead', '==', false),
        where('senderId', '!=', userId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      unreadCount += messagesSnapshot.size;
    }
    
    return unreadCount;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    throw error;
  }
};
