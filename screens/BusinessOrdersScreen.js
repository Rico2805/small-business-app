import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getOrdersByBusinessId, updateOrderStatus } from '../services/orderService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const BusinessOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [message, setMessage] = useState('');

  const headerAnimation = useRef(null);
  const contentAnimation = useRef(null);
  
  useEffect(() => {
    fetchOrders();
    
    // Run entrance animations
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (contentAnimation.current) contentAnimation.current.fadeIn(800);
    }, 600);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // In a real app, you would get the current business ID from auth
      const businessId = 'current-business-id'; // Placeholder
      const businessOrders = await getOrdersByBusinessId(businessId);
      setOrders(businessOrders);
    } catch (error) {
      setError('Failed to load orders. Please try again.');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (order) => {
    try {
      setLoading(true);
      await updateOrderStatus(order.id, 'confirmed');
      
      // Update local state
      const updatedOrders = orders.map(o => 
        o.id === order.id ? { ...o, status: 'confirmed' } : o
      );
      setOrders(updatedOrders);
      Alert.alert('Success', 'Order confirmed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm order');
      console.error('Error confirming order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageCustomer = (order) => {
    setCurrentOrder(order);
    setMessage('');
    setMessageModalVisible(true);
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      // In a real app, you would send this message to the customer
      // This is just a placeholder implementation
      Alert.alert('Success', `Message sent to customer: ${message}`);
      setMessageModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  const renderOrderItem = ({ item }) => {
    const date = new Date(item.createdAt).toLocaleDateString();
    
    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={800} 
        style={styles.orderCard}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>Order #{item.id.slice(0, 8)}</Text>
            <Text style={styles.orderDate}>Placed on: {date}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.orderStatus, 
              getStatusStyle(item.status)
            ]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.customerInfo}>
          <MaterialCommunityIcons name="account" size={20} color="#FFF" />
          <Text style={styles.customerName}>{item.customerName || 'Customer'}</Text>
        </View>
        
        <View style={styles.orderItems}>
          {item.items && item.items.map((orderItem, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemQuantity}>{orderItem.quantity}x</Text>
              <Text style={styles.itemName}>{orderItem.name}</Text>
              <Text style={styles.itemPrice}>{orderItem.price * orderItem.quantity} CFA</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.orderFooter}>
          <Text style={styles.total}>
            Total: {calculateTotal(item.items || [])} CFA
          </Text>
          
          <View style={styles.actionButtons}>
            {item.status === 'pending' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => handleConfirmOrder(item)}
              >
                <Text style={styles.buttonText}>Confirm Order</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.messageButton]}
              onPress={() => handleMessageCustomer(item)}
            >
              <Text style={styles.buttonText}>Message Customer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animatable.View>
    );
  };

  const renderEmptyState = () => {
    return (
      <Animatable.View 
        ref={contentAnimation}
        style={styles.emptyContainer} 
        animation="fadeIn"
        duration={800}
      >
        <Image
          source={{ uri: 'https://via.placeholder.com/200x200/005792/FFFFFF?text=No+Orders' }}
          style={{ width: 120, height: 120, opacity: 0.3 }}
        />
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptyText}>
          You don't have any orders to manage at the moment. 
          Orders will appear here when customers place them.
        </Text>
      </Animatable.View>
    );
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return { color: '#28a745' };
      case 'processing':
      case 'confirmed':
        return { color: '#007bff' };
      case 'pending':
        return { color: '#ffc107' };
      case 'cancelled':
        return { color: '#dc3545' };
      default:
        return {};
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
      </View>
      
      <Animatable.View 
        ref={headerAnimation}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Orders Management</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchOrders}
        >
          <MaterialCommunityIcons name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animatable.View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#FFF" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchOrders}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Message Modal */}
      <Modal
        visible={messageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMessageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Message Customer</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setMessageModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            {currentOrder && (
              <View style={styles.orderSummary}>
                <Text style={styles.orderSummaryText}>
                  Order #{currentOrder.id.slice(0, 8)} - {currentOrder.customerName || 'Customer'}
                </Text>
              </View>
            )}
            
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message here..."
              placeholderTextColor="#A0A0A0"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
            />
            
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
            >
              <Text style={styles.sendButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    width: width,
    height: '100%',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 150,
  },
  bubble1: {
    width: 80,
    height: 80,
    top: 40,
    right: 20,
  },
  bubble2: {
    width: 120,
    height: 120,
    bottom: 80,
    left: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#005792',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  statusContainer: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 8,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#FFF',
    width: 30,
  },
  itemName: {
    fontSize: 14,
    color: '#FFF',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  orderFooter: {
    marginTop: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  messageButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#002F6C',
    borderRadius: 20,
    width: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    padding: 4,
  },
  orderSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  orderSummaryText: {
    color: '#FFF',
    fontSize: 14,
  },
  messageInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    height: 120,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BusinessOrdersScreen;
