import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { getOrdersByUserId } from '../services/orderService';

const MyOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // In a real app, you would get the current user ID from auth
      const userId = 'current-user-id'; // Placeholder
      const userOrders = await getOrdersByUserId(userId);
      setOrders(userOrders);
    } catch (error) {
      setError('Failed to load orders. Please try again.');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = (order) => {
    navigation.navigate('OrderTracking', { orderId: order.id });
  };

  const renderOrderItem = ({ item }) => {
    const date = new Date(item.createdAt).toLocaleDateString();
    
    return (
      <View style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>Order #{item.id.slice(0, 8)}</Text>
          <Text style={[
            styles.orderStatus, 
            getStatusStyle(item.status)
          ]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        
        <Text style={styles.orderDate}>Placed on: {date}</Text>
        
        <View style={styles.divider} />
        
        <View style={styles.orderItems}>
          {item.items.map((orderItem, index) => (
            <Text key={index} style={styles.item}>
              {orderItem.quantity}x {orderItem.name} - {orderItem.price * orderItem.quantity} CFA
            </Text>
          ))}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.orderFooter}>
          <Text style={styles.total}>
            Total: {calculateTotal(item.items)} CFA
          </Text>
          
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => handleTrackOrder(item)}
          >
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return { color: '#28a745' };
      case 'processing':
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchOrders}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noOrders}>You don't have any orders yet.</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => navigation.navigate('HomepageStack')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  orderItems: {
    marginVertical: 8,
  },
  item: {
    fontSize: 14,
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  trackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noOrders: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MyOrdersScreen;
