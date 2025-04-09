import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';

// Add a new review
export const addReview = async (businessId, userId, review) => {
  try {
    // Ensure we have all required data
    if (!businessId || !userId || !review.rating) {
      throw new Error('Missing required review data');
    }
    
    // Check if user has already reviewed this business
    const existingReview = await getUserReviewForBusiness(userId, businessId);
    
    // If user already has a review, update it instead of creating a new one
    if (existingReview) {
      return updateReview(existingReview.id, review);
    }
    
    // Create new review document
    const reviewData = {
      businessId,
      userId,
      rating: review.rating,
      comment: review.comment || '',
      images: review.images || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      helpful: 0,
      helpfulBy: [],
    };
    
    const reviewRef = await addDoc(collection(db, 'reviews'), reviewData);
    
    // Update business average rating
    await updateBusinessRating(businessId);
    
    return {
      id: reviewRef.id,
      ...reviewData,
      createdAt: reviewData.createdAt.toDate(),
      updatedAt: reviewData.updatedAt.toDate()
    };
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Update an existing review
export const updateReview = async (reviewId, updatedData) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }
    
    const reviewData = reviewDoc.data();
    const businessId = reviewData.businessId;
    
    // Update the review
    await updateDoc(reviewRef, {
      ...updatedData,
      updatedAt: Timestamp.now()
    });
    
    // Update business average rating
    await updateBusinessRating(businessId);
    
    return {
      id: reviewId,
      ...reviewData,
      ...updatedData,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }
    
    const businessId = reviewDoc.data().businessId;
    
    // Delete the review
    await deleteDoc(reviewRef);
    
    // Update business average rating
    await updateBusinessRating(businessId);
    
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Get all reviews for a business
export const getBusinessReviews = async (businessId, limitCount = 20) => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviews = [];
    
    for (const doc of reviewsSnapshot.docs) {
      const reviewData = doc.data();
      
      // Get user info for each review
      let userName = 'Anonymous';
      let userPhotoUrl = null;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', reviewData.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userName = userData.displayName || userData.email || 'Anonymous';
          userPhotoUrl = userData.photoURL || null;
        }
      } catch (userError) {
        console.error('Error fetching user for review:', userError);
      }
      
      reviews.push({
        id: doc.id,
        ...reviewData,
        userName,
        userPhotoUrl,
        createdAt: reviewData.createdAt.toDate(),
        updatedAt: reviewData.updatedAt.toDate()
      });
    }
    
    return reviews;
  } catch (error) {
    console.error('Error getting business reviews:', error);
    throw error;
  }
};

// Get a specific review
export const getReview = async (reviewId) => {
  try {
    const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));
    
    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }
    
    const reviewData = reviewDoc.data();
    
    // Get user info
    let userName = 'Anonymous';
    let userPhotoUrl = null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', reviewData.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userName = userData.displayName || userData.email || 'Anonymous';
        userPhotoUrl = userData.photoURL || null;
      }
    } catch (userError) {
      console.error('Error fetching user for review:', userError);
    }
    
    return {
      id: reviewDoc.id,
      ...reviewData,
      userName,
      userPhotoUrl,
      createdAt: reviewData.createdAt.toDate(),
      updatedAt: reviewData.updatedAt.toDate()
    };
  } catch (error) {
    console.error('Error getting review:', error);
    throw error;
  }
};

// Get user's review for a specific business
export const getUserReviewForBusiness = async (userId, businessId) => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('businessId', '==', businessId),
      where('userId', '==', userId),
      limit(1)
    );
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    
    if (reviewsSnapshot.empty) {
      return null;
    }
    
    const reviewDoc = reviewsSnapshot.docs[0];
    const reviewData = reviewDoc.data();
    
    return {
      id: reviewDoc.id,
      ...reviewData,
      createdAt: reviewData.createdAt.toDate(),
      updatedAt: reviewData.updatedAt.toDate()
    };
  } catch (error) {
    console.error('Error getting user review for business:', error);
    throw error;
  }
};

// Get all reviews by a user
export const getUserReviews = async (userId) => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviews = reviewsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      };
    });
    
    return reviews;
  } catch (error) {
    console.error('Error getting user reviews:', error);
    throw error;
  }
};

// Mark a review as helpful
export const markReviewAsHelpful = async (reviewId, userId) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (!reviewDoc.exists()) {
      throw new Error('Review not found');
    }
    
    const reviewData = reviewDoc.data();
    
    // Check if user already marked this review as helpful
    if (reviewData.helpfulBy.includes(userId)) {
      // User already marked this review as helpful, so remove their mark
      await updateDoc(reviewRef, {
        helpful: reviewData.helpful - 1,
        helpfulBy: reviewData.helpfulBy.filter(id => id !== userId)
      });
      
      return false; // Returned value indicates user unmarked as helpful
    } else {
      // User has not marked this review as helpful yet
      await updateDoc(reviewRef, {
        helpful: reviewData.helpful + 1,
        helpfulBy: [...reviewData.helpfulBy, userId]
      });
      
      return true; // Returned value indicates user marked as helpful
    }
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    throw error;
  }
};

// Update the average rating for a business
export const updateBusinessRating = async (businessId) => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('businessId', '==', businessId)
    );
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    
    if (reviewsSnapshot.empty) {
      // No reviews, set rating to 0
      const businessRef = doc(db, 'businesses', businessId);
      await updateDoc(businessRef, {
        averageRating: 0,
        reviewCount: 0
      });
      
      return {
        averageRating: 0,
        reviewCount: 0
      };
    }
    
    // Calculate average rating
    let totalRating = 0;
    reviewsSnapshot.docs.forEach(doc => {
      totalRating += doc.data().rating;
    });
    
    const reviewCount = reviewsSnapshot.size;
    const averageRating = totalRating / reviewCount;
    
    // Update business document
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
      averageRating,
      reviewCount
    });
    
    return {
      averageRating,
      reviewCount
    };
  } catch (error) {
    console.error('Error updating business rating:', error);
    throw error;
  }
};

// Get review statistics for a business
export const getBusinessReviewStatistics = async (businessId) => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('businessId', '==', businessId)
    );
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    
    // Count reviews by rating
    const ratingCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    reviews.forEach(review => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating]++;
      }
    });
    
    return {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 ? 
        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
      ratingCounts
    };
  } catch (error) {
    console.error('Error getting business review statistics:', error);
    throw error;
  }
};
