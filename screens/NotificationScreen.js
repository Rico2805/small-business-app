import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { getUserNotifications, markNotificationAsRead } from '../services/notificationService';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState('customer'); // 'customer' or 'business'

  const headerAnimation = useRef(null);
  const listAnimation = useRef(null);

  useEffect(() => {
    // In a real app, you would determine user type from auth context
    // For now we'll just set it to customer as default

    fetchNotifications();

    // Entrance animations
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (listAnimation.current) listAnimation.current.fadeIn(800);
    }, 600);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // In a real app, get the current user ID from auth context
      const userId = 'current-user-id'; // Placeholder
      const userNotifications = await getUserNotifications(userId);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification) => {
    try {
      // Mark notification as read
      await markNotificationAsRead(notification.id);
      
      // Update local state
      const updatedNotifications = notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      
      // Navigate based on notification type
      switch (notification.type) {
        case 'order_confirmed':
          navigation.navigate('OrderTracking', { orderId: notification.data.orderId });
          break;
        case 'order_declined':
          navigation.navigate('MyOrders');
          break;
        case 'new_order':
          navigation.navigate('BusinessOrders', { orderId: notification.data.orderId });
          break;
        case 'message':
          navigation.navigate('Messaging', { 
            conversationId: notification.data.conversationId,
            recipientId: notification.data.senderId,
            recipientName: notification.data.senderName
          });
          break;
        default:
          // If no specific navigation is needed, just mark as read
          break;
      }
    } catch (error) {
      console.error('Error handling notification:', error);
      Alert.alert('Error', 'Failed to process notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_confirmed':
        return <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />;
      case 'order_declined':
        return <MaterialCommunityIcons name="close-circle" size={24} color="#F44336" />;
      case 'new_order':
        return <MaterialCommunityIcons name="shopping" size={24} color="#2196F3" />;
      case 'message':
        return <MaterialCommunityIcons name="message-text" size={24} color="#9C27B0" />;
      default:
        return <MaterialCommunityIcons name="bell" size={24} color="#FFB300" />;
    }
  };

  const renderNotificationItem = ({ item }) => {
    const date = new Date(item.createdAt).toLocaleString();
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationIcon}>
          {getNotificationIcon(item.type)}
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationBody}>{item.body}</Text>
          <Text style={styles.notificationTime}>{date}</Text>
        </View>
        
        <MaterialCommunityIcons name="chevron-right" size={24} color="#A0A0A0" />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150x150/005792/FFFFFF?text=Empty' }}
          style={styles.emptyStateImage}
        />
        <Text style={styles.emptyStateTitle}>No notifications yet</Text>
        <Text style={styles.emptyStateMessage}>
          You'll see notifications here when there are updates about your orders, messages, or activity.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#00214D', '#005792', '#00BBE4']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Decorative bubbles */}
      <View style={styles.bubblesContainer}>
        <View style={[styles.bubble, styles.bubble1]} />
        <View style={[styles.bubble, styles.bubble2]} />
        <View style={[styles.bubble, styles.bubble3]} />
      </View>
      
      <Animatable.View 
        ref={headerAnimation}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchNotifications}
        >
          <MaterialCommunityIcons name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animatable.View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FFF" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchNotifications}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animatable.View 
          ref={listAnimation}
          style={styles.notificationsContainer}
        >
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
          />
        </Animatable.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00214D',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  bubblesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 150,
  },
  bubble1: {
    width: 100,
    height: 100,
    top: '10%',
    right: -20,
  },
  bubble2: {
    width: 150,
    height: 150,
    bottom: '20%',
    left: -50,
  },
  bubble3: {
    width: 80,
    height: 80,
    top: '50%',
    right: '30%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFF',
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  notificationsContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  unreadNotification: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5722',
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    height: '100%',
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
    opacity: 0.7,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NotificationScreen;
