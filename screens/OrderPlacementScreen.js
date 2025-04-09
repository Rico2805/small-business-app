import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const OrderPlacementScreen = ({ navigation, route }) => {
  const { business } = route.params || {};
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Animation references
  const headerAnimation = useRef(null);
  const formAnimation = useRef(null);

  useEffect(() => {
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (formAnimation.current) formAnimation.current.fadeInUp(800);
    }, 600);

    // Listen for keyboard events
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handlePlaceOrder = async () => {
    if (!productName || !quantity || !deliveryAddress || !deliveryDate) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Order Success', 'Your order has been placed successfully!');
      navigation.navigate('OrderTracking');
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (text) => {
    const num = parseInt(text);
    if (isNaN(num) || num < 1) {
      setQuantity('1');
      return;
    }
    setQuantity(num.toString());
  };

  const handleDateChange = (selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeliveryDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const renderDatePicker = () => {
    const today = new Date();
    const dates = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Delivery Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dateList}>
              {dates.map((date) => (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={[
                    styles.dateOption,
                    deliveryDate === date.toISOString().split('T')[0] && styles.dateOptionSelected
                  ]}
                  onPress={() => handleDateChange(date)}
                >
                  <Text style={[
                    styles.dateOptionText,
                    deliveryDate === date.toISOString().split('T')[0] && styles.dateOptionTextSelected
                  ]}>
                    {date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollView, { paddingBottom: keyboardHeight }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animatable.View 
            ref={headerAnimation}
            style={styles.headerContainer}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="chevron-left" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <Text style={styles.title}>Place Order</Text>
          </Animatable.View>

          {/* Business Header */}
          <View style={styles.businessHeader}>
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{business?.name || 'Business Name'}</Text>
              <Text style={styles.businessCategory}>{business?.category || 'Business Category'}</Text>
              <View style={styles.businessRating}>
                <MaterialCommunityIcons 
                  name="star" 
                  size={18} 
                  color="#FFD700"
                />
                <Text style={styles.ratingText}>{business?.rating || '4.5'}</Text>
              </View>
            </View>
          </View>

          {/* Order Form Section */}
          <Animatable.View 
            ref={formAnimation}
            style={styles.formContainer}
          >
            {/* Order Details */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Order Details</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Product Name"
                  value={productName}
                  onChangeText={setProductName}
                  placeholderTextColor="#A0A0A0"
                />
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityText}>Quantity:</Text>
                  <TextInput
                    style={styles.quantityInput}
                    placeholder="1"
                    value={quantity}
                    onChangeText={handleQuantityChange}
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Delivery Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Delivery Information</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Delivery Address"
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  placeholderTextColor="#A0A0A0"
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.datePickerContent}>
                    <MaterialCommunityIcons 
                      name="calendar" 
                      size={20} 
                      color="#FFF"
                    />
                    <Text style={styles.datePickerText}>
                      {deliveryDate ? new Date(deliveryDate).toLocaleDateString() : 'Select Delivery Date'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Special Instructions */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Special Instructions</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, styles.instructionsInput]}
                  placeholder="Any special instructions for the delivery?"
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                  placeholderTextColor="#A0A0A0"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Place Order Button */}
            <TouchableOpacity
              style={[
                styles.placeOrderButton,
                loading && styles.placeOrderButtonLoading
              ]}
              onPress={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator 
                    size="small" 
                    color="#FFF" 
                  />
                  <Text style={styles.placeOrderButtonText}>Placing Order...</Text>
                </View>
              ) : (
                <Text style={styles.placeOrderButtonText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderDatePicker()}
    </SafeAreaView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  businessHeader: {
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  businessCategory: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 12,
  },
  businessRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFD700',
    marginLeft: 4,
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  inputGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#FFF',
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityText: {
    color: '#FFF',
    marginRight: 8,
    fontSize: 16,
  },
  quantityInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  datePickerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePickerText: {
    color: '#FFF',
    fontSize: 16,
  },
  instructionsInput: {
    textAlignVertical: 'top',
  },
  placeOrderButton: {
    backgroundColor: '#005792',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  placeOrderButtonLoading: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModal: {
    backgroundColor: '#00214D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: height * 0.7,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    padding: 8,
  },
  dateList: {
    maxHeight: height * 0.6,
  },
  dateOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateOptionSelected: {
    backgroundColor: '#005792',
  },
  dateOptionText: {
    color: '#FFF',
    fontSize: 16,
  },
  dateOptionTextSelected: {
    fontWeight: 'bold',
  },
});
export default OrderPlacementScreen;
