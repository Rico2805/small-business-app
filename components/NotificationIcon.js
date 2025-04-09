import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import * as messagingService from '../services/messagingService';

const NotificationIcon = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigation = useNavigation();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Initial fetch of unread messages
    fetchUnreadCount();

    // Set up polling to check for new messages every 30 seconds
    const intervalId = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(intervalId);
  }, [currentUser]);

  const fetchUnreadCount = async () => {
    if (!currentUser) return;
    
    try {
      const count = await messagingService.getUnreadMessageCount(currentUser.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handlePress = () => {
    navigation.navigate('Notification');
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="notifications" 
        size={22} 
        color="#fff" 
      />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginRight: 10,
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#00214D',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationIcon;
