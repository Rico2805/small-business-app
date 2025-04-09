import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ImageBackground,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const businesses = [
  { 
    id: '1', 
    name: 'Bakery Delight', 
    type: 'Bakery',
    rating: 4.5,
    distance: 2.3,
    imageUrl: 'https://via.placeholder.com/800x600/00214D/FFFFFF?text=Bakery+Delight',
    category: 'Food & Beverages'
  },
  { 
    id: '2', 
    name: 'Tech Solutions', 
    type: 'Electronics',
    rating: 4.8,
    distance: 1.5,
    imageUrl: 'https://via.placeholder.com/800x600/005792/FFFFFF?text=Tech+Solutions',
    category: 'Electronics'
  },
  { 
    id: '3', 
    name: 'Fresh Groceries', 
    type: 'Grocery',
    rating: 4.7,
    distance: 0.8,
    imageUrl: 'https://via.placeholder.com/800x600/00BBE4/FFFFFF?text=Fresh+Groceries',
    category: 'Groceries'
  },
  { 
    id: '4', 
    name: 'Fashion Hub', 
    type: 'Fashion',
    rating: 4.6,
    distance: 1.8,
    imageUrl: 'https://via.placeholder.com/800x600/00214D/FFFFFF?text=Fashion+Hub',
    category: 'Fashion & Accessories'
  },
];

const HomepageScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([
    { id: '1', name: 'All', active: true },
    { id: '2', name: 'Food', active: false },
    { id: '3', name: 'Electronics', active: false },
    { id: '4', name: 'Fashion', active: false },
    { id: '5', name: 'Services', active: false },
  ]);
  
  // Animation references
  const headerAnimation = useRef(null);
  const categoriesAnimation = useRef(null);
  const searchAnimation = useRef(null);

  useEffect(() => {
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (categoriesAnimation.current) categoriesAnimation.current.fadeInUp(800);
    }, 600);
    
    setTimeout(() => {
      if (searchAnimation.current) searchAnimation.current.fadeIn(800);
    }, 900);
  }, []);

  const filteredBusinesses = businesses.filter((business) => {
    // Filter by search query
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by active category
    const activeCategory = categories.find(cat => cat.active);
    const matchesCategory = activeCategory.name === 'All' || 
      business.category.includes(activeCategory.name) || 
      business.type.includes(activeCategory.name);
    
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (categoryId) => {
    setCategories(categories.map(cat => ({
      ...cat,
      active: cat.id === categoryId
    })));
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
      
      <ScrollView 
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animatable.View 
          ref={headerAnimation}
          style={styles.headerContainer}
        >
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Discover amazing businesses near you</Text>
        </Animatable.View>

        {/* Categories Section */}
        <Animatable.View 
          ref={categoriesAnimation}
          style={styles.categoriesContainer}
        >
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  category.active && styles.categoryButtonActive
                ]}
                onPress={() => toggleCategory(category.id)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.categoryText,
                  category.active && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animatable.View>

        {/* Search Section */}
        <Animatable.View 
          ref={searchAnimation}
          style={styles.searchContainer}
        >
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons 
              name="magnify" 
              size={24} 
              color="#666" 
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search businesses..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </Animatable.View>

        {/* Featured Businesses Section */}
        <View style={styles.businessesContainer}>
          <Text style={styles.sectionTitle}>Featured Businesses</Text>
          <FlatList
            data={filteredBusinesses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.businessCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('BusinessDetails', { businessId: item.id })}
              >
                <ImageBackground
                  source={{ uri: item.imageUrl }}
                  style={styles.businessImage}
                  imageStyle={styles.businessImageStyle}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.businessOverlay}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <View style={styles.businessInfo}>
                      <Text style={styles.businessName}>{item.name}</Text>
                      <View style={styles.businessDetails}>
                        <View style={styles.ratingContainer}>
                          <MaterialCommunityIcons 
                            name="star" 
                            size={16} 
                            color="#FFD700"
                          />
                          <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                        <Text style={styles.distanceText}>{item.distance}km away</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            )}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.businessesList}
          />
        </View>
      </ScrollView>
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
    height: height,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 150,
  },
  bubble1: {
    width: 120,
    height: 120,
    top: height * 0.05,
    right: -30,
  },
  bubble2: {
    width: 80,
    height: 80,
    top: height * 0.3,
    left: 20,
  },
  bubble3: {
    width: 140,
    height: 140,
    bottom: height * 0.1,
    right: width * 0.3,
  },
  scrollView: {
    flexGrow: 1,
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 8,
    textAlign: 'center',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryButtonActive: {
    backgroundColor: '#005792',
  },
  categoryText: {
    color: '#FFF',
    fontSize: 14,
  },
  categoryTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    marginLeft: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  businessesContainer: {
    flex: 1,
  },
  businessesList: {
    paddingVertical: 8,
  },
  businessCard: {
    margin: 8,
    borderRadius: 15,
    overflow: 'hidden',
  },
  businessImage: {
    width: (width - 32 - 16) / 2,
    height: 200,
    justifyContent: 'flex-end',
  },
  businessImageStyle: {
    opacity: 0.9,
  },
  businessOverlay: {
    flex: 1,
  },
  businessInfo: {
    padding: 16,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  businessDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFD700',
    marginLeft: 4,
    fontSize: 14,
  },
  distanceText: {
    color: '#FFF',
    fontSize: 14,
  },
});

export default HomepageScreen;
