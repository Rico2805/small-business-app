import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { 
  getBusinessProducts, 
  addBusinessProduct, 
  updateBusinessProduct,
  deleteBusinessProduct 
} from '../services/businessService';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const BusinessProductsScreen = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState(true);
  const [stockQuantity, setStockQuantity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const headerAnimation = React.createRef();
  const productsAnimation = React.createRef();

  useEffect(() => {
    loadProducts();
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (productsAnimation.current) productsAnimation.current.fadeInUp(800);
    }, 600);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const businessId = 'current-business-id'; // Placeholder
      const businessProducts = await getBusinessProducts(businessId);
      setProducts(businessProducts);
      setFilteredProducts(businessProducts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setIsEditing(false);
    resetForm();
    setModalVisible(true);
  };

  const handleEditProduct = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCategory(product.category || '');
    setImageUri(product.imageUrl || null);
    setAvailability(product.available !== false);
    setStockQuantity(product.stockQuantity ? product.stockQuantity.toString() : '0');
    setModalVisible(true);
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${product.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const businessId = 'current-business-id';
              await deleteBusinessProduct(businessId, product.id);
              setProducts(products.filter(p => p.id !== product.id));
              setFilteredProducts(filteredProducts.filter(p => p.id !== product.id));
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
              console.error('Error deleting product:', error);
            }
          },
        },
      ]
    );
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const businessId = 'current-business-id';
      const productData = {
        name,
        description,
        price: parseFloat(price),
        imageUrl: imageUri,
        category,
        available: availability,
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
        createdAt: new Date().toISOString()
      };

      if (isEditing && currentProduct) {
        await updateBusinessProduct(businessId, currentProduct.id, productData);
        const updatedProducts = products.map(p => 
          p.id === currentProduct.id ? { ...p, ...productData } : p
        );
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        // For development, create a product with a temporary ID if the API call fails
        try {
          const newProduct = await addBusinessProduct(businessId, productData);
          setProducts([...products, newProduct]);
          setFilteredProducts([...filteredProducts, newProduct]);
          Alert.alert('Success', 'Product added successfully');
        } catch (e) {
          // If API call fails, add a temporary product for development
          const tempProduct = {
            id: `temp-${Date.now()}`,
            ...productData
          };
          setProducts([...products, tempProduct]);
          setFilteredProducts([...filteredProducts, tempProduct]);
          Alert.alert('Note', 'Product added locally (Firebase connection issue)');
          console.error('Using local product as fallback:', e);
        }
      }

      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save product');
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!name) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    
    if (!description) {
      Alert.alert('Error', 'Product description is required');
      return false;
    }
    
    if (!price || isNaN(parseFloat(price))) {
      Alert.alert('Error', 'Valid price is required');
      return false;
    }

    if (stockQuantity !== '' && (isNaN(parseInt(stockQuantity)) || parseInt(stockQuantity) < 0)) {
      Alert.alert('Error', 'Stock quantity must be a valid number');
      return false;
    }
    
    return true;
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImageUri(null);
    setAvailability(true);
    setStockQuantity('');
    setIsEditing(false);
    setCurrentProduct(null);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const renderProductItem = ({ item }) => {
    const productImage = item.imageUrl || 'https://via.placeholder.com/300x300/005792/FFFFFF?text=Product+Image';
    return (
      <Animatable.View 
        animation="fadeInUp"
        duration={800}
        style={styles.productCard}
      >
        <TouchableOpacity 
          style={styles.productImageContainer}
          onPress={() => handleEditProduct(item)}
        >
          <Image
            source={{ uri: productImage }}
            style={styles.productImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.productOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.productActions}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              item.available ? styles.availableButton : styles.unavailableButton
            ]}
            onPress={() => {
              const updatedProduct = { ...item, available: !item.available };
              setProducts(products.map(p => p.id === item.id ? updatedProduct : p));
              setFilteredProducts(filteredProducts.map(p => p.id === item.id ? updatedProduct : p));
            }}
          >
            <Text style={styles.availabilityButtonText}>
              {item.available ? 'Available' : 'Not Available'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              styles.deleteButton
            ]}
            onPress={() => handleDeleteProduct(item)}
          >
            <MaterialCommunityIcons 
              name="trash-can-outline" 
              size={20} 
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      </Animatable.View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/200x200/005792/FFFFFF?text=No+Products' }}
          style={{ width: 100, height: 100, opacity: 0.3 }}
        />
        <Text style={styles.emptyText}>No products found</Text>
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={handleAddProduct}
        >
          <Text style={styles.emptyButtonText}>Add New Product</Text>
        </TouchableOpacity>
      </View>
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

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={renderProductItem}
        ListHeaderComponent={() => (
          <Animatable.View 
            ref={headerAnimation}
            style={styles.headerContainer}
          >
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons 
                name="magnify" 
                size={24} 
                color="#FFF" 
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor="#A0A0A0"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <MaterialCommunityIcons 
                name="filter" 
                size={24} 
                color="#FFF"
              />
              <Text style={styles.filterButtonText}>Filters</Text>
            </TouchableOpacity>

            {showFilters && (
              <View style={styles.filtersContainer}>
                {/* Add filter options here */}
              </View>
            )}

            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddProduct}
            >
              <MaterialCommunityIcons 
                name="plus" 
                size={24} 
                color="#FFF"
              />
              <Text style={styles.addButtonText}>Add Product</Text>
            </TouchableOpacity>
          </Animatable.View>
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.productsGrid}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
      />

      {/* Product Modal */}
      <Modal 
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View 
            ref={productsAnimation}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialCommunityIcons 
                  name="close" 
                  size={24} 
                  color="#FFF"
                />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingContainer}>
              <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.previewImage}
                  />
                ) : (
                  <TouchableOpacity 
                    style={styles.imagePickerButton}
                    onPress={pickImage}
                  >
                    <MaterialIcons name="photo-library" size={48} color="#FFF" />
                    <Text style={styles.imagePickerText}>Add Product Image</Text>
                  </TouchableOpacity>
                )}
                </View>

                <View style={styles.imageButtons}>
                  <TouchableOpacity 
                    style={[styles.imagePickerButton, styles.galleryButton]}
                    onPress={pickImage}
                  >
                    <MaterialIcons name="photo-library" size={20} color="#FFF" />
                    <Text style={styles.imagePickerButtonText}>
                      Gallery
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.imagePickerButton, styles.cameraButton]}
                    onPress={takePhoto}
                  >
                    <MaterialIcons name="camera-alt" size={20} color="#FFF" />
                    <Text style={styles.imagePickerButtonText}>
                      Camera
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Product Name"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#A0A0A0"
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Description"
                    value={description}
                    onChangeText={setDescription}
                    placeholderTextColor="#A0A0A0"
                    multiline
                    numberOfLines={3}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Price"
                    value={price}
                    onChangeText={setPrice}
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Stock Quantity"
                    value={stockQuantity}
                    onChangeText={setStockQuantity}
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                  />

                  <View style={styles.categoryContainer}>
                    <Text style={styles.categoryLabel}>Category</Text>
                    <TextInput
                      style={styles.categoryInput}
                      placeholder="Enter category"
                      value={category}
                      onChangeText={setCategory}
                      placeholderTextColor="#A0A0A0"
                    />
                  </View>

                  <View style={styles.availabilityContainer}>
                    <Text style={styles.availabilityLabel}>Availability</Text>
                    <TouchableOpacity 
                      style={[styles.availabilityButton, {
                        backgroundColor: availability ? '#4CAF50' : '#A0A0A0',
                      }]}
                      onPress={() => setAvailability(!availability)}
                    >
                      <Text style={styles.availabilityButtonText}>
                        {availability ? 'Available' : 'Not Available'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveProduct}
                >
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Update Product' : 'Add Product'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </Animatable.View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}
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
  headerContainer: {
    padding: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    marginLeft: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
  },
  filterButtonText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 14,
  },
  filtersContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005792',
    padding: 16,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  productsGrid: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    margin: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  productImageContainer: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  productOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  availableButton: {
    backgroundColor: '#4CAF50',
  },
  unavailableButton: {
    backgroundColor: '#A0A0A0',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#A0A0A0',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#005792',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#002F6C',
    borderRadius: 20,
    margin: 16,
    padding: 16,
    height: '90%',
    width: '90%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    padding: 8,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    width: '100%',
  },
  modalScrollContent: {
    padding: 16,
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  imagePickerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerText: {
    color: '#FFF',
    marginTop: 8,
    fontSize: 14,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 10,
  },
  galleryButton: {
    backgroundColor: '#007bff',
  },
  cameraButton: {
    backgroundColor: '#28a745',
  },
  imagePickerButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  formContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    color: '#FFF',
    fontSize: 18,
    height: 55,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryLabel: {
    color: '#FFF',
    marginBottom: 8,
    fontSize: 14,
  },
  categoryInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 18,
    height: 55,
  },
  availabilityContainer: {
    marginBottom: 24,
  },
  availabilityLabel: {
    color: '#FFF',
    marginBottom: 8,
    fontSize: 14,
  },
  availabilityButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  availabilityButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#005792',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default BusinessProductsScreen;
