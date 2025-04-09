import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { 
  getAvailablePaymentMethods,
  validateMomoNumber,
  initiateMomoPayment 
} from '../services/paymentService';
import { markOrderAsPaid } from '../services/orderService';

const PaymentScreen = ({ route, navigation }) => {
  const { orderId, amount, businessId } = route.params;
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customPaymentDetails, setCustomPaymentDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load available payment methods
    const methods = getAvailablePaymentMethods();
    setPaymentMethods(methods);
  }, []);

  const handleSelectPayment = (method) => {
    setSelectedPayment(method);
    setError(null);
  };

  const handleMomoPayment = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your MTN Mobile Money number');
      return;
    }

    // Validate phone number
    const validation = validateMomoNumber(phoneNumber);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Initiate payment
      const result = await initiateMomoPayment(phoneNumber, amount, orderId);
      
      if (result.success) {
        // Mark order as paid
        await markOrderAsPaid(orderId);
        
        // Navigate to confirmation
        navigation.navigate('PaymentConfirmation', {
          paymentReference: result.paymentReference,
          amount,
          method: 'MTN Mobile Money'
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCashOnDelivery = async () => {
    setLoading(true);
    setError(null);

    try {
      // Update order payment method
      await markOrderAsPaid(orderId);
      
      // Navigate to confirmation
      navigation.navigate('PaymentConfirmation', {
        paymentReference: `COD-${orderId}`,
        amount,
        method: 'Cash on Delivery'
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPayment = async () => {
    if (!customPaymentDetails.trim()) {
      setError('Please enter payment details');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update order with custom payment details
      await markOrderAsPaid(orderId);
      
      // Navigate to confirmation
      navigation.navigate('PaymentConfirmation', {
        paymentReference: `CUSTOM-${orderId}`,
        amount,
        method: 'Custom Payment'
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethod = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.paymentMethod,
        selectedPayment?.id === item.id && styles.selectedPayment
      ]}
      onPress={() => handleSelectPayment(item)}
    >
      <Text style={styles.paymentMethodName}>{item.name}</Text>
      <Text style={styles.paymentMethodDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderPaymentForm = () => {
    if (!selectedPayment) return null;

    switch (selectedPayment.id) {
      case 'mtn_momo':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.label}>MTN Mobile Money Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your MTN MOMO number (e.g., 677123456)"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            <Button title="Pay Now" onPress={handleMomoPayment} disabled={loading} />
          </View>
        );
      case 'cash_delivery':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.infoText}>
              You'll pay {amount} CFA when your order is delivered.
            </Text>
            <Button title="Confirm" onPress={handleCashOnDelivery} disabled={loading} />
          </View>
        );
      case 'custom_payment':
        return (
          <View style={styles.paymentForm}>
            <Text style={styles.label}>Payment Details</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter payment details or instructions for the seller"
              value={customPaymentDetails}
              onChangeText={setCustomPaymentDetails}
              multiline
              numberOfLines={4}
            />
            <Button title="Submit" onPress={handleCustomPayment} disabled={loading} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>
      <Text style={styles.amount}>Amount: {amount} CFA</Text>

      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentMethod}
        keyExtractor={(item) => item.id}
        style={styles.paymentMethodsList}
      />

      {renderPaymentForm()}

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Processing payment...</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    marginBottom: 16,
  },
  paymentMethodsList: {
    marginBottom: 16,
  },
  paymentMethod: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPayment: {
    borderColor: '#007bff',
    backgroundColor: '#f0f8ff',
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#666',
  },
  paymentForm: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginTop: 16,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default PaymentScreen;
