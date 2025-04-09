import { db, storage } from '../config/firebase';
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
  arrayUnion,
  arrayRemove,
  Timestamp,
  limit,
  increment 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Get all posts with latest first
export const getPosts = async (limitCount = 20) => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const postsSnapshot = await getDocs(postsQuery);
    const posts = [];
    
    for (const postDoc of postsSnapshot.docs) {
      const postData = postDoc.data();
      const postId = postDoc.id;
      
      // Fetch business details
      let businessName = 'Business';
      let businessImage = null;
      
      if (postData.businessId) {
        try {
          const businessDoc = await getDoc(doc(db, 'businesses', postData.businessId));
          if (businessDoc.exists()) {
            const businessData = businessDoc.data();
            businessName = businessData.name;
            businessImage = businessData.profileImageUrl;
          }
        } catch (error) {
          console.error('Error fetching business details for post:', error);
        }
      }
      
      // Fetch comments
      let comments = [];
      try {
        const commentsQuery = query(
          collection(db, `posts/${postId}/comments`),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const commentsSnapshot = await getDocs(commentsQuery);
        comments = commentsSnapshot.docs.map(commentDoc => ({
          id: commentDoc.id,
          ...commentDoc.data(),
          createdAt: commentDoc.data().createdAt?.toDate?.() || new Date()
        }));
      } catch (error) {
        console.error('Error fetching comments for post:', error);
      }
      
      posts.push({
        id: postId,
        ...postData,
        businessName,
        businessImage,
        comments,
        createdAt: postData.createdAt?.toDate?.() || new Date(),
      });
    }
    
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Get posts for a specific business
export const getBusinessPosts = async (businessId, limitCount = 10) => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      where('businessId', '==', businessId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const postsSnapshot = await getDocs(postsQuery);
    const posts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
    
    return posts;
  } catch (error) {
    console.error('Error fetching business posts:', error);
    throw error;
  }
};

// Create a new post
export const createPost = async (businessId, content, imageUri = null) => {
  try {
    let imageUrl = null;
    
    // Upload image if provided
    if (imageUri) {
      imageUrl = await uploadPostImage(imageUri, businessId);
    }
    
    // Create post document
    const postData = {
      businessId,
      content,
      imageUrl,
      likeCount: 0,
      commentCount: 0,
      likes: [],
      createdAt: Timestamp.now()
    };
    
    const postRef = await addDoc(collection(db, 'posts'), postData);
    
    return {
      id: postRef.id,
      ...postData,
      createdAt: new Date(),
      comments: []
    };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Upload post image to Firebase Storage
const uploadPostImage = async (imageUri, businessId) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    const imageName = `post_${businessId}_${Date.now()}`;
    const storageRef = ref(storage, `posts/${imageName}`);
    
    await uploadBytes(storageRef, blob);
    const imageUrl = await getDownloadURL(storageRef);
    
    return imageUrl;
  } catch (error) {
    console.error('Error uploading post image:', error);
    throw error;
  }
};

// Like a post
export const likePost = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    
    await updateDoc(postRef, {
      likes: arrayUnion(userId),
      likeCount: increment(1)
    });
    
    return true;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    
    await updateDoc(postRef, {
      likes: arrayRemove(userId),
      likeCount: increment(-1)
    });
    
    return true;
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

// Add a comment to a post
export const commentOnPost = async (postId, userId, comment) => {
  try {
    // Get user details
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userName = userDoc.exists() ? userDoc.data().displayName || 'User' : 'User';
    
    // Add comment to post's comments collection
    const commentData = {
      userId,
      userName,
      text: comment,
      createdAt: Timestamp.now()
    };
    
    const commentRef = await addDoc(collection(db, `posts/${postId}/comments`), commentData);
    
    // Update comment count on post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(1)
    });
    
    return {
      id: commentRef.id,
      ...commentData,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error commenting on post:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    // Delete the post document
    await deleteDoc(doc(db, 'posts', postId));
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Get likes for a post
export const getPostLikes = async (postId) => {
  try {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const likes = postDoc.data().likes || [];
    return likes;
  } catch (error) {
    console.error('Error getting post likes:', error);
    throw error;
  }
};

// Get comments for a post
export const getPostComments = async (postId, limitCount = 20) => {
  try {
    const commentsQuery = query(
      collection(db, `posts/${postId}/comments`),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
    
    return comments;
  } catch (error) {
    console.error('Error getting post comments:', error);
    throw error;
  }
};

// Search posts by content
export const searchPosts = async (searchQuery) => {
  try {
    // Note: Firestore doesn't support full-text search
    // In a real app, you would use a service like Algolia or ElasticSearch
    // This is a simple implementation that searches for exact matches
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );
    
    const postsSnapshot = await getDocs(postsQuery);
    const allPosts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Client-side filtering
    const filteredPosts = allPosts.filter(post => 
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return filteredPosts;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};
