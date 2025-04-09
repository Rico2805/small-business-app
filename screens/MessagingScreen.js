import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image, SafeAreaView, Platform, KeyboardAvoidingView,
  Pressable, Dimensions, StatusBar
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import * as messagingService from '../services/messagingService';
import { formatDistance } from 'date-fns';

const { width, height } = Dimensions.get('window');

// Decorative bubble component for the background
const Bubble = ({ style }) => (
  <View
    style={[{
      position: 'absolute',
      borderRadius: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.08)'
    }, style]}
  />
);

// Component for displaying conversation list
const ConversationList = ({ navigation, userId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const conversationsData = await messagingService.getConversations(userId);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleSearch = async () => {
    try {
      const results = await messagingService.searchConversations(userId, searchQuery);
      setConversations(results);
    } catch (error) {
      console.error('Error searching conversations:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const renderConversationItem = ({ item }) => {
    const isLastMessageFromUser = item.lastSenderId === userId;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation.navigate('ConversationDetail', {
          conversationId: item.id,
          otherUserId: item.otherUserId
        })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.otherUserName ? item.otherUserName[0] : '?'}</Text>
        </View>
        <View style={styles.conversationContent}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {item.otherUserName || 'Unknown User'}
          </Text>
          <Text style={styles.conversationLastMessage} numberOfLines={1}>
            {isLastMessageFromUser ? 'You: ' : ''}{item.lastMessage || 'No messages yet'}
          </Text>
        </View>
        <View style={styles.conversationMeta}>
          {item.lastMessageTimestamp && (
            <Text style={styles.conversationTime}>
              {formatDistance(item.lastMessageTimestamp.toDate(), new Date(), { addSuffix: true })}
            </Text>
          )}
          {item.unreadCount > 0 && !isLastMessageFromUser && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BBE4" />
      </View>
    );
  }

  return (
    <View style={styles.conversationsContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="message-text-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Start messaging to connect with businesses and customers</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          contentContainerStyle={conversations.length === 0 ? { flex: 1 } : null}
        />
      )}
    </View>
  );
};

// Component for displaying conversation detail/chat
const ConversationDetail = ({ route, navigation }) => {
  const { conversationId, otherUserId } = route.params;
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const [otherUserName, setOtherUserName] = useState('Chat');

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const messagesData = await messagingService.getMessages(conversationId);
      setMessages(messagesData);

      // Mark messages as read
      for (const message of messagesData) {
        if (!message.isRead && message.senderId !== currentUser?.uid) {
          await messagingService.markMessageAsRead(conversationId, message.id);
        }
      }

      // Get other user info
      if (otherUserId) {
        // In a real app, you would get the user profile here
        // This is a placeholder
        setOtherUserName(otherUserId.substring(0, 5) + '...');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentUser, otherUserId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      await messagingService.sendMessage(
        conversationId,
        currentUser.uid,
        otherUserId,
        newMessage.trim()
      );
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMessages();
      const intervalId = setInterval(loadMessages, 10000); // Refresh messages every 10 seconds
      return () => clearInterval(intervalId);
    }, [loadMessages])
  );

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessageItem = ({ item }) => {
    const isFromCurrentUser = item.senderId === currentUser?.uid;
    const messageDate = item.timestamp ? item.timestamp.toDate() : new Date();

    return (
      <View style={[
        styles.messageContainer,
        isFromCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isFromCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          <Text style={[
            styles.messageText,
            isFromCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {item.content}
          </Text>
        </View>
        <Text style={styles.messageTime}>
          {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.conversationDetailContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <LinearGradient
        colors={['#00214D', '#005792', '#00BBE4']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherUserName}</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BBE4" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <MaterialCommunityIcons
            name="send"
            size={24}
            color={newMessage.trim() ? '#00BBE4' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Main MessagingScreen component with tab navigation
const MessagingScreen = ({ navigation, route }) => {
  const { currentUser } = useAuth();
  const [isViewingConversation, setIsViewingConversation] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);

  // If route params include conversationId and recipientId, show conversation detail
  useEffect(() => {
    if (route.params?.conversationId && route.params?.recipientId) {
      setIsViewingConversation(true);
      setActiveConversation({
        conversationId: route.params.conversationId,
        otherUserId: route.params.recipientId,
        otherUserName: route.params.recipientName || 'Chat'
      });
    }
  }, [route.params]);

  const handleOpenConversation = (conversation) => {
    setIsViewingConversation(true);
    setActiveConversation({
      conversationId: conversation.id,
      otherUserId: conversation.otherUserId,
      otherUserName: conversation.otherUserName || 'Chat'
    });
  };

  const handleBackToList = () => {
    setIsViewingConversation(false);
    setActiveConversation(null);
  };

  // Use a default user ID for users who aren't logged in
  const userId = currentUser ? currentUser.uid : 'guest-user';

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#00214D', '#005792', '#00BBE4']}
        style={styles.background}
      >
        {/* Decorative Bubbles */}
        <Bubble style={{ top: height * 0.1, left: width * 0.1, width: 80, height: 80 }} />
        <Bubble style={{ top: height * 0.3, right: -30, width: 150, height: 150 }} />
        <Bubble style={{ bottom: height * 0.2, left: -40, width: 120, height: 120 }} />
        <Bubble style={{ bottom: -20, right: width * 0.3, width: 100, height: 100 }} />

        {isViewingConversation ? (
          <ConversationDetail
            route={{ params: activeConversation }}
            navigation={{ goBack: handleBackToList }}
          />
        ) : (
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Messages</Text>
            </View>

            <ConversationList
              navigation={{
                navigate: (_, params) => handleOpenConversation(params)
              }}
              userId={userId}
            />
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00214D',
  },
  background: {
    flex: 1,
    overflow: 'hidden',
  },
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    marginTop: 5,
  },
  conversationsContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00BBE4',
    borderRadius: 20,
    marginLeft: 10,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00BBE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  conversationLastMessage: {
    fontSize: 14,
    color: '#666',
  },
  conversationMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  conversationTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00BBE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#444',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  conversationDetailContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
  },
  currentUserBubble: {
    backgroundColor: '#DCF8C6',
  },
  otherUserBubble: {
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
  },
  currentUserText: {
    color: '#000',
  },
  otherUserText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 3,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notAuthenticatedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notAuthenticatedText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#005792',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MessagingScreen;
