import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { 
  getBusinessReviews,
  addReview,
  updateReview,
  getUserReviewForBusiness,
  getBusinessReviewStatistics,
  markReviewAsHelpful
} from '../services/reviewService';
import { getBusinessById } from '../services/businessService';

const { width, height } = Dimensions.get('window');

const BusinessReviewsScreen = ({ route, navigation }) => {
  const { businessId } = route.params;
  const { user } = useAuth();
  
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [userReviewLoading, setUserReviewLoading] = useState(false);
  const [existingUserReview, setExistingUserReview] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState('recent'); // 'recent', 'helpful', 'high', 'low'
  
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Animation refs
  const headerAnimation = useRef(null);
  const statsAnimation = useRef(null);
  const listAnimation = useRef(null);
  
  useEffect(() => {
    // Start animations
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    setTimeout(() => {
      if (statsAnimation.current) statsAnimation.current.fadeIn(800);
    }, 600);
    setTimeout(() => {
      if (listAnimation.current) listAnimation.current.fadeIn(800);
    }, 900);
    
    // Load data
    loadData();
  }, [businessId]);
  
  // Function to fetch all required data
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch business details
      const businessData = await getBusinessById(businessId);
      setBusiness(businessData);
      
      // Fetch reviews
      const reviewsData = await getBusinessReviews(businessId);
      setReviews(reviewsData);
      
      // Fetch statistics
      const statsData = await getBusinessReviewStatistics(businessId);
      setStatistics(statsData);
      
      // Check if user has already reviewed this business
      if (user) {
        const userReviewData = await getUserReviewForBusiness(user.uid, businessId);
        setExistingUserReview(userReviewData);
        
        if (userReviewData) {
          setUserRating(userReviewData.rating);
          setUserReview(userReviewData.comment || '');
        }
      }
    } catch (error) {
      console.error('Error loading review data:', error);
      Alert.alert('Error', 'Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle rating selection
  const handleRatingSelect = (rating) => {
    setUserRating(rating);
  };
  
  // Handle review submission
  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'You need to be logged in to leave a review.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Log In', 
            onPress: () => {
              setReviewModalVisible(false);
              navigation.navigate('Login');
            }
          }
        ]
      );
      return;
    }
    
    if (userRating === 0) {
      Alert.alert('Error', 'Please select a rating before submitting.');
      return;
    }
    
    try {
      setUserReviewLoading(true);
      
      const reviewData = {
        rating: userRating,
        comment: userReview.trim()
      };
      
      if (existingUserReview) {
        // Update existing review
        await updateReview(existingUserReview.id, reviewData);
      } else {
        // Add new review
        await addReview(businessId, user.uid, reviewData);
      }
      
      // Refresh data
      await loadData();
      
      // Close modal
      setReviewModalVisible(false);
      
      // Show success message
      Alert.alert(
        'Success',
        existingUserReview ? 'Your review has been updated.' : 'Your review has been submitted.'
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again later.');
    } finally {
      setUserReviewLoading(false);
    }
  };
  
  // Handle marking a review as helpful
  const handleMarkHelpful = async (reviewId) => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'You need to be logged in to mark reviews as helpful.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Log In', 
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      return;
    }
    
    try {
      await markReviewAsHelpful(reviewId, user.uid);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      Alert.alert('Error', 'Failed to mark review as helpful. Please try again later.');
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  // Sort reviews based on selected option
  const getSortedReviews = () => {
    if (!reviews) return [];
    
    const sortedReviews = [...reviews];
    
    switch (sortOption) {
      case 'recent':
        return sortedReviews.sort((a, b) => b.createdAt - a.createdAt);
      case 'helpful':
        return sortedReviews.sort((a, b) => b.helpful - a.helpful);
      case 'high':
        return sortedReviews.sort((a, b) => b.rating - a.rating);
      case 'low':
        return sortedReviews.sort((a, b) => a.rating - b.rating);
      default:
        return sortedReviews;
    }
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  // Render stars for a rating
  const renderRatingStars = (rating, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <MaterialCommunityIcons key={`star-${i}`} name="star" size={size} color="#FFD700" />
        );
      } else if (i === fullStars + 1 && halfStar) {
        stars.push(
          <MaterialCommunityIcons key={`star-${i}`} name="star-half-full" size={size} color="#FFD700" />
        );
      } else {
        stars.push(
          <MaterialCommunityIcons key={`star-${i}`} name="star-outline" size={size} color="#FFD700" />
        );
      }
    }
    
    return (
      <View style={styles.ratingStarsContainer}>
        {stars}
      </View>
    );
  };
  
  // Render sort options
  const renderSortOptions = () => {
    return (
      <View style={styles.sortOptionsContainer}>
        <Text style={styles.sortOptionsLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'recent' && styles.sortOptionSelected]}
            onPress={() => setSortOption('recent')}
          >
            <Text style={[styles.sortOptionText, sortOption === 'recent' && styles.sortOptionTextSelected]}>
              Most Recent
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'helpful' && styles.sortOptionSelected]}
            onPress={() => setSortOption('helpful')}
          >
            <Text style={[styles.sortOptionText, sortOption === 'helpful' && styles.sortOptionTextSelected]}>
              Most Helpful
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'high' && styles.sortOptionSelected]}
            onPress={() => setSortOption('high')}
          >
            <Text style={[styles.sortOptionText, sortOption === 'high' && styles.sortOptionTextSelected]}>
              Highest Rating
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortOption, sortOption === 'low' && styles.sortOptionSelected]}
            onPress={() => setSortOption('low')}
          >
            <Text style={[styles.sortOptionText, sortOption === 'low' && styles.sortOptionTextSelected]}>
              Lowest Rating
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };
  
  // Render a single review item
  const renderReviewItem = ({ item }) => {
    const isHelpful = user && item.helpfulBy?.includes(user.uid);
    
    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={500} 
        delay={200}
        style={styles.reviewItem}
      >
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUser}>
            {item.userPhotoUrl ? (
              <Image source={{ uri: item.userPhotoUrl }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Text style={styles.userAvatarPlaceholderText}>
                  {item.userName?.charAt(0) || 'A'}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.userName}>{item.userName}</Text>
              <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          {renderRatingStars(item.rating)}
        </View>
        
        {item.comment && (
          <Text style={styles.reviewText}>{item.comment}</Text>
        )}
        
        <View style={styles.reviewActions}>
          <TouchableOpacity 
            style={[styles.helpfulButton, isHelpful && styles.helpfulButtonActive]}
            onPress={() => handleMarkHelpful(item.id)}
          >
            <MaterialCommunityIcons 
              name={isHelpful ? "thumb-up" : "thumb-up-outline"} 
              size={16} 
              color={isHelpful ? "#FFF" : "#A0A0A0"} 
            />
            <Text style={[styles.helpfulButtonText, isHelpful && styles.helpfulButtonTextActive]}>
              Helpful {item.helpful > 0 && `(${item.helpful})`}
            </Text>
          </TouchableOpacity>
          
          {user && item.userId === user.uid && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setUserRating(item.rating);
                setUserReview(item.comment || '');
                setExistingUserReview(item);
                setReviewModalVisible(true);
              }}
            >
              <MaterialCommunityIcons name="pencil" size={16} color="#A0A0A0" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animatable.View>
    );
  };
  
  // Render statistics section
  const renderStatistics = () => {
    if (!statistics) return null;
    
    const { averageRating, totalReviews, ratingCounts } = statistics;
    
    return (
      <Animatable.View ref={statsAnimation} style={styles.statisticsContainer}>
        <View style={styles.averageRatingContainer}>
          <Text style={styles.averageRatingValue}>
            {averageRating.toFixed(1)}
          </Text>
          {renderRatingStars(averageRating, 24)}
          <Text style={styles.totalReviewsText}>
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </Text>
        </View>
        
        <View style={styles.ratingBreakdown}>
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingCounts[rating] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <View key={`rating-${rating}`} style={styles.ratingBarContainer}>
                <Text style={styles.ratingBarLabel}>{rating}</Text>
                <View style={styles.ratingBarBackground}>
                  <View 
                    style={[styles.ratingBarFill, { width: `${percentage}%` }]} 
                  />
                </View>
                <Text style={styles.ratingBarCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      </Animatable.View>
    );
  };
  
  // Render review modal
  const renderReviewModal = () => {
    return (
      <Modal
        visible={reviewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {existingUserReview ? 'Edit Your Review' : 'Write a Review'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setReviewModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.ratingSelector}>
              <Text style={styles.ratingSelectorLabel}>Your Rating:</Text>
              <View style={styles.ratingStarsSelector}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <TouchableOpacity
                    key={`select-${rating}`}
                    onPress={() => handleRatingSelect(rating)}
                  >
                    <MaterialCommunityIcons 
                      name={rating <= userRating ? "star" : "star-outline"} 
                      size={36} 
                      color="#FFD700" 
                      style={styles.ratingStar}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TextInput
              style={styles.reviewInput}
              placeholder="Share your experience (optional)"
              placeholderTextColor="#A0A0A0"
              value={userReview}
              onChangeText={setUserReview}
              multiline
              textAlignVertical="top"
            />
            
            <TouchableOpacity
              style={[styles.submitButton, (userRating === 0 || userReviewLoading) && styles.submitButtonDisabled]}
              onPress={handleSubmitReview}
              disabled={userRating === 0 || userReviewLoading}
            >
              {userReviewLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {existingUserReview ? 'Update Review' : 'Submit Review'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };
  
  // Main render
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
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        <Animatable.View ref={headerAnimation} style={styles.header}>
          {business && (
            <View style={styles.businessHeader}>
              {business.profileImageUrl ? (
                <Image source={{ uri: business.profileImageUrl }} style={styles.businessImage} />
              ) : (
                <View style={styles.businessImagePlaceholder}>
                  <Text style={styles.businessImagePlaceholderText}>
                    {business.name?.charAt(0) || 'B'}
                  </Text>
                </View>
              )}
              <View style={styles.businessInfo}>
                <Text style={styles.businessName}>{business.name}</Text>
                {business.averageRating > 0 && (
                  <View style={styles.businessRating}>
                    {renderRatingStars(business.averageRating)}
                    <Text style={styles.businessRatingText}>
                      {business.averageRating.toFixed(1)} ({business.reviewCount || 0})
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.writeReviewButton}
            onPress={() => {
              // Reset form if opening to write a new review
              if (!existingUserReview) {
                setUserRating(0);
                setUserReview('');
              }
              setReviewModalVisible(true);
            }}
          >
            <LinearGradient
              colors={['#005792', '#00BBE4']}
              style={styles.writeReviewButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="pencil" size={18} color="#FFF" />
              <Text style={styles.writeReviewButtonText}>
                {existingUserReview ? 'Edit Your Review' : 'Write a Review'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
        
        {/* Statistics section */}
        {!loading && renderStatistics()}
        
        {/* Reviews section */}
        <Animatable.View ref={listAnimation} style={styles.reviewsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFF" />
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          ) : (
            <>
              {renderSortOptions()}
              
              {getSortedReviews().length === 0 ? (
                <View style={styles.emptyReviewsContainer}>
                  <MaterialCommunityIcons name="comment-text-outline" size={64} color="#A0A0A0" />
                  <Text style={styles.emptyReviewsText}>
                    No reviews yet. Be the first to review!
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={getSortedReviews()}
                  renderItem={renderReviewItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false} // Disable scrolling since we're in a ScrollView
                />
              )}
            </>
          )}
        </Animatable.View>
      </Animated.ScrollView>
      
      {/* Review Modal */}
      {renderReviewModal()}
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
    height: height,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 150,
  },
  bubble1: {
    width: 100,
    height: 100,
    top: -30,
    right: -30,
  },
  bubble2: {
    width: 150,
    height: 150,
    bottom: -50,
    left: -50,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  businessImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  businessImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  businessImagePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  businessRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessRatingText: {
    color: '#FFD700',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  writeReviewButton: {
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  writeReviewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  writeReviewButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  statisticsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    margin: 20,
    padding: 20,
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  averageRatingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  totalReviewsText: {
    color: '#A0A0A0',
    marginTop: 8,
  },
  ratingBreakdown: {
    marginTop: 16,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBarLabel: {
    color: '#FFF',
    width: 20,
    textAlign: 'center',
  },
  ratingBarBackground: {
    height: 8,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  ratingBarCount: {
    color: '#A0A0A0',
    width: 30,
    textAlign: 'right',
  },
  reviewsContainer: {
    margin: 20,
    marginTop: 0,
  },
  sortOptionsContainer: {
    marginBottom: 16,
  },
  sortOptionsLabel: {
    color: '#FFF',
    marginBottom: 8,
  },
  sortOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sortOptionSelected: {
    backgroundColor: '#005792',
  },
  sortOptionText: {
    color: '#A0A0A0',
  },
  sortOptionTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 16,
  },
  emptyReviewsContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  emptyReviewsText: {
    color: '#FFF',
    marginTop: 16,
    textAlign: 'center',
  },
  reviewItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarPlaceholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userName: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewDate: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  ratingStarsContainer: {
    flexDirection: 'row',
  },
  reviewText: {
    color: '#E0E0E0',
    marginBottom: 16,
    lineHeight: 22,
  },
  reviewActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  helpfulButtonActive: {
    backgroundColor: 'rgba(0, 187, 228, 0.3)',
  },
  helpfulButtonText: {
    color: '#A0A0A0',
    marginLeft: 4,
  },
  helpfulButtonTextActive: {
    color: '#FFF',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    marginLeft: 16,
  },
  editButtonText: {
    color: '#A0A0A0',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#00214D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalCloseButton: {
    padding: 4,
  },
  ratingSelector: {
    marginBottom: 20,
  },
  ratingSelectorLabel: {
    color: '#FFF',
    marginBottom: 10,
    fontSize: 16,
  },
  ratingStarsSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ratingStar: {
    marginHorizontal: 8,
  },
  reviewInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    color: '#FFF',
    height: 150,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#00BBE4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BusinessReviewsScreen;
