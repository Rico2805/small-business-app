import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView 
} from 'react-native';
import { checkMomoPaymentStatus } from '../services/paymentService';

const PaymentConfirmationScreen = ({ route, navigation }) => {
  const { paymentReference, amount, method } = route.params;
  const [status, setStatus] = useState('Processing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiptDetails, setReceiptDetails] = useState({
    date: new Date().toLocaleString(),
    reference: paymentReference,
    amount,
    method
  });

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    setLoading(true);
    
    try {
      if (method === 'MTN Mobile Money') {
        // Check actual payment status for MTN MOMO
        const result = await checkMomoPaymentStatus(paymentReference);
        setStatus(result.status);
      } else {
        // For Cash on Delivery and Custom Payment, consider it confirmed
        setStatus('CONFIRMED');
      }
    } catch (error) {
      setError('Failed to check payment status. Please contact support.');
      setStatus('UNKNOWN');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToOrders = () => {
    navigation.navigate('MyOrders');
  };

  const handleGoToHome = () => {
    navigation.navigate('Homepage');
  };

  const getStatusColor = () => {
    switch (status) {
      case 'SUCCESSFUL':
      case 'CONFIRMED':
        return '#28a745';
      case 'PENDING':
        return '#ffc107';
      case 'FAILED':
      case 'UNKNOWN':
        return '#dc3545';
      default:
        return '#007bff';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Payment {status.toLowerCase()}</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
            
            <View style={styles.receiptContainer}>
              <Text style={styles.receiptTitle}>Receipt</Text>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Date:</Text>
                <Text style={styles.receiptValue}>{receiptDetails.date}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Reference:</Text>
                <Text style={styles.receiptValue}>{receiptDetails.reference}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Amount:</Text>
                <Text style={styles.receiptValue}>{receiptDetails.amount} CFA</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Method:</Text>
                <Text style={styles.receiptValue}>{receiptDetails.method}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Status:</Text>
                <Text style={[styles.receiptValue, { color: getStatusColor() }]}>{status}</Text>
              </View>
            </View>
            
            {error && <Text style={styles.error}>{error}</Text>}
            
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={handleGoToOrders}
              >
                <Text style={styles.buttonText}>View My Orders</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={handleGoToHome}
              >
                <Text style={styles.buttonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusIndicator: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  receiptContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  error: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonsContainer: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PaymentConfirmationScreen;
