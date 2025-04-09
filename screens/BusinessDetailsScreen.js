import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Mock data for products
const mockProducts = [
  { 
    id: '1', 
    name: 'Product One', 
    price: 12.99,
    description: 'This is a description for product one',
    imageUrl: 'https://via.placeholder.com/400x300/005792/FFFFFF?text=Product+One',
    inStock: true
  },
  { 
    id: '2', 
    name: 'Product Two', 
    price: 24.99,
    description: 'This is a description for product two',
    imageUrl: 'https://via.placeholder.com/400x300/00BBE4/FFFFFF?text=Product+Two',
    inStock: true
  },
  { 
    id: '3', 
    name: 'Product Three', 
    price: 8.99,
    description: 'This is a description for product three',
    imageUrl: 'https://via.placeholder.com/400x300/00214D/FFFFFF?text=Product+Three',
    inStock: false
  },
  { 
    id: '4', 
    name: 'Product Four', 
    price: 15.99,
    description: 'This is a description for product four',
    imageUrl: 'https://via.placeholder.com/400x300/005792/FFFFFF?text=Product+Four',
    inStock: true
  },
];

const BusinessDetailsScreen = ({ route, navigation }) => {
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [reviews, setReviews] = useState([
    {id: '1', user: 'John D.', rating: 4.5, text: 'Great products and service!', date: '2025-03-12'},
    {id: '2', user: 'Mary L.', rating: 5, text: 'Absolutely love this business. Will be back!', date: '2025-03-05'},
    {id: '3', user: 'Samuel T.', rating: 3, text: 'Good selection but a bit pricey.', date: '2025-02-28'},
  ]);
  
  // Animation references
  const headerAnimation = useRef(null);
  const contentAnimation = useRef(null);
  const tabsAnimation = useRef(null);

  useEffect(() => {
    // Run animations
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (tabsAnimation.current) tabsAnimation.current.fadeIn(800);
    }, 600);
    
    setTimeout(() => {
      if (contentAnimation.current) contentAnimation.current.fadeInUp(800);
    }, 900);
    
    // Load business data
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      // In a real app, we would fetch from API using route.params.businessId
      // For now, mock data
      const businessId = route.params?.businessId || '1';
      
      // Mock business data (in real app this would come from API/Firebase)
      const mockBusiness = {
        id: businessId,
        name: 'Business Name',
        description: 'This is a detailed description of the business. It provides services/products to customers and has been operating since 2020.',
        address: '123 Main Street, Yaoundé, Cameroon',
        phone: '+237 6XX XXX XXX',
        email: 'business@example.com',
        hours: 'Mon-Fri: 8am-6pm, Sat: 9am-3pm, Sun: Closed',
        website: 'www.businessexample.com',
        rating: 4.5,
        reviewCount: 28,
        coverImage: 'https://via.placeholder.com/800x600/00214D/FFFFFF?text=Business+Cover',
        profileImage: 'https://via.placeholder.com/400x400/005792/FFFFFF?text=Business+Logo',
        category: 'Retail'
      };
      
      setBusiness(mockBusiness);
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPlacement = (productId) => {
    const selectedProduct = products.find(product => product.id === productId);
    
    if (selectedProduct) {
      navigation.navigate('OrderPlacement', { 
        businessId: business.id, 
        businessName: business.name,
        product: selectedProduct 
      });
    }
  };

  const renderProductItem = ({ item }) => (
    <Animatable.View 
      animation="fadeIn" 
      duration={600} 
      delay={parseInt(item.id) * 100}
      style={styles.productCard}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.orderButton,
            !item.inStock && styles.orderButtonDisabled
          ]}
          disabled={!item.inStock}
          onPress={() => handleOrderPlacement(item.id)}
        >
          <Text style={styles.orderButtonText}>
            {item.inStock ? 'Order Now' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewUser}>{item.user}</Text>
        <View style={styles.ratingContainer}>
          <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.reviewRating}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
      <Text style={styles.reviewDate}>{item.date}</Text>
    </View>
  );
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BBE4" />
        <Text style={styles.loadingText}>Loading Business Details...</Text>
      </View>
    );
  }

  const handleMessageBusiness = () => {
    navigation.navigate('MessagingStack', {
      businessId: business.id,
      businessName: business.name,
      businessImage: business.profileImage
    });
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
        <View style={[styles.bubble, styles.bubble3]} />
      </View>

      {/* Floating Message Button */}
      <TouchableOpacity 
        style={styles.messageButton}
        onPress={handleMessageBusiness}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#005792', '#00BBE4']}
          style={styles.messageButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name="message" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
      
      <ScrollView 
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with business info */}
        <Animatable.View
          ref={headerAnimation}
          style={styles.headerContainer}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons 
              name="chevron-left" 
              size={28} 
              color="#FFF" 
            />
          </TouchableOpacity>
          
          <ImageBackground
            source={{ uri: business?.coverImage }}
            style={styles.coverImage}
            imageStyle={styles.coverImageStyle}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.coverGradient}
            >
              <View style={styles.businessProfileContainer}>
                <Image 
                  source={{ uri: business?.profileImage }}
                  style={styles.profileImage}
                />
                <View style={styles.businessInfoContainer}>
                  <Text style={styles.businessName}>{business?.name}</Text>
                  <View style={styles.businessCategory}>
                    <MaterialCommunityIcons name="tag" size={16} color="#FFF" />
                    <Text style={styles.categoryText}>{business?.category}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {business?.rating.toFixed(1)} ({business?.reviewCount} reviews)
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </Animatable.View>
        
        {/* Business Details */}
        <Animatable.View 
          style={styles.detailsCard}
          animation="fadeIn" 
          duration={800}
          delay={500}
        >
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#005792" />
            <Text style={styles.detailText}>{business?.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="phone" size={20} color="#005792" />
            <Text style={styles.detailText}>{business?.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#005792" />
            <Text style={styles.detailText}>{business?.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#005792" />
            <Text style={styles.detailText}>{business?.hours}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="web" size={20} color="#005792" />
            <Text style={styles.detailText}>{business?.website}</Text>
          </View>
          <View style={[styles.detailRow, styles.descriptionRow]}>
            <Text style={styles.descriptionText}>{business?.description}</Text>
          </View>
        </Animatable.View>
        
        {/* Tabs for Products & Reviews */}
        <Animatable.View
          ref={tabsAnimation}
          style={styles.tabContainer}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'products' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'products' && styles.activeTabText
            ]}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'reviews' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'reviews' && styles.activeTabText
            ]}>Reviews</Text>
          </TouchableOpacity>
        </Animatable.View>
        
        {/* Content based on active tab */}
        <Animatable.View
          ref={contentAnimation}
          style={styles.contentContainer}
        >
          {activeTab === 'products' ? (
            products.length > 0 ? (
              <FlatList
                data={products}
                renderItem={renderProductItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.productsList}
              />
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="store-off" size={48} color="#A0A0A0" />
                <Text style={styles.emptyStateText}>No products available</Text>
              </View>
            )
          ) : (
            reviews.length > 0 ? (
              <FlatList
                data={reviews}
                renderItem={renderReviewItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.reviewsList}
              />
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="message-off" size={48} color="#A0A0A0" />
                <Text style={styles.emptyStateText}>No reviews yet</Text>
              </View>
            )
          )}
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  messageButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  bubble3: {
    width: 60,
    height: 60,
    top: 160,
    left: 20,
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00214D',
  },
  loadingText: {
    marginTop: 12,
    color: '#FFF',
    fontSize: 16,
  },
  headerContainer: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: width,
    height: 200,
  },
  coverImageStyle: {
    opacity: 0.9,
  },
  coverGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  businessProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFF',
    marginRight: 16,
  },
  businessInfoContainer: {
    flex: 1,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  businessCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    color: '#FFF',
    marginLeft: 4,
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFF',
    marginLeft: 4,
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  descriptionRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeTabButton: {
    borderBottomColor: '#FFF',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '700',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  productsList: {
    paddingBottom: 16,
  },
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 160,
  },
  productDetails: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#005792',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  orderButton: {
    backgroundColor: '#005792',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  orderButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  reviewsList: {
    paddingBottom: 16,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewRating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
  reviewText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#A0A0A0',
    marginTop: 12,
  },
});

export default BusinessDetailsScreen;
