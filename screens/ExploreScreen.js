import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { 
  getPosts, 
  likePost, 
  unlikePost, 
  commentOnPost, 
  createPost 
} from '../services/socialService';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const ExploreScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [showPostInput, setShowPostInput] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const flatListRef = useRef(null);
  const headerAnimation = useRef(null);
  const contentAnimation = useRef(null);
  
  useEffect(() => {
    fetchPosts();
    
    // Run animations
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (contentAnimation.current) contentAnimation.current.fadeIn(800);
    }, 600);
  }, []);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      setError(null);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };
  
  const handleLikePost = async (postId) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    
    try {
      // Optimistic update
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const userLiked = post.likes?.includes(user.uid);
          
          return {
            ...post,
            likes: userLiked 
              ? post.likes.filter(id => id !== user.uid) 
              : [...(post.likes || []), user.uid],
            likeCount: userLiked ? (post.likeCount - 1) : (post.likeCount + 1)
          };
        }
        return post;
      });
      
      setPosts(updatedPosts);
      
      // Actual API call
      const post = posts.find(p => p.id === postId);
      const userLiked = post.likes?.includes(user.uid);
      
      if (userLiked) {
        await unlikePost(postId, user.uid);
      } else {
        await likePost(postId, user.uid);
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      Alert.alert('Error', 'Failed to like/unlike post');
      // Revert optimistic update
      fetchPosts();
    }
  };
  
  const handleCommentChange = (postId, text) => {
    setCommentInputs({
      ...commentInputs,
      [postId]: text
    });
  };
  
  const handlePostComment = async (postId) => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;
    
    try {
      // Clear input immediately for better UX
      setCommentInputs({
        ...commentInputs,
        [postId]: ''
      });
      
      // Add comment to post
      await commentOnPost(postId, user.uid, comment);
      
      // Optimistic update
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: `temp-${Date.now()}`,
                userId: user.uid,
                userName: user.displayName || 'User',
                text: comment,
                createdAt: new Date().toISOString()
              }
            ],
            commentCount: (post.commentCount || 0) + 1
          };
        }
        return post;
      });
      
      setPosts(updatedPosts);
      
      // Ensure comments for this post are expanded
      setExpandedComments({
        ...expandedComments,
        [postId]: true
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    }
  };
  
  const handleCreatePost = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }
    
    try {
      setCreatingPost(true);
      
      const newPost = await createPost(
        user.uid,
        newPostContent,
        newPostImage
      );
      
      // Add new post to the beginning of the list
      setPosts([newPost, ...posts]);
      
      // Reset form
      setNewPostContent('');
      setNewPostImage(null);
      setShowPostInput(false);
      
      // Scroll to top to show the new post
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setCreatingPost(false);
    }
  };
  
  const toggleComments = (postId) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId]
    });
  };
  
  const navigateToBusinessProfile = (businessId) => {
    navigation.navigate('BusinessDetails', { businessId });
  };
  
  const navigateToUserProfile = (userId) => {
    // For business users, navigate to business profile
    // For regular users, we could show a user profile screen
    if (userId === 'developer-id') {
      navigation.navigate('MessagingScreen', { 
        conversationId: 'developer-conversation', 
        recipientId: 'developer-id',
        recipientName: 'Developer Support'
      });
    } else {
      // Check if this is a business user
      // This would be implemented with proper user role checks
      const isBusiness = false; // Placeholder
      
      if (isBusiness) {
        navigation.navigate('BusinessDetails', { businessId: userId });
      } else {
        // We could navigate to a user profile in the future
        Alert.alert('Profile', 'User profile not implemented yet');
      }
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const renderPostItem = ({ item }) => {
    const userLiked = item.likes?.includes(user?.uid);
    const postComments = item.comments || [];
    const showAllComments = expandedComments[item.id];
    const displayedComments = showAllComments 
      ? postComments 
      : postComments.slice(0, 2);
    const hasMoreComments = postComments.length > 2 && !showAllComments;
    
    return (
      <View style={styles.postCard}>
        {/* Post header with user info */}
        <TouchableOpacity 
          style={styles.postHeader}
          onPress={() => navigateToBusinessProfile(item.businessId)}
        >
          <View style={styles.userAvatar}>
            {item.businessImage ? (
              <Image 
                source={{ uri: item.businessImage }} 
                style={styles.avatarImage} 
              />
            ) : (
              <MaterialCommunityIcons name="store" size={24} color="#FFF" />
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.businessName || 'Business'}</Text>
            <Text style={styles.postTimestamp}>{formatTimestamp(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Post content */}
        <Text style={styles.postContent}>{item.content}</Text>
        
        {/* Post image if available */}
        {item.imageUrl && (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
        
        {/* Post actions */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLikePost(item.id)}
          >
            <MaterialCommunityIcons 
              name={userLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={userLiked ? "#FF5252" : "#FFF"} 
            />
            <Text style={styles.actionText}>
              {item.likeCount || 0} {item.likeCount === 1 ? 'Like' : 'Likes'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => toggleComments(item.id)}
          >
            <MaterialCommunityIcons name="comment-outline" size={24} color="#FFF" />
            <Text style={styles.actionText}>
              {item.commentCount || 0} {item.commentCount === 1 ? 'Comment' : 'Comments'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Comments section */}
        {displayedComments.length > 0 && (
          <View style={styles.commentsContainer}>
            {displayedComments.map(comment => (
              <View key={comment.id} style={styles.commentItem}>
                <TouchableOpacity 
                  style={styles.commentUserAvatar}
                  onPress={() => navigateToUserProfile(comment.userId)}
                >
                  <MaterialCommunityIcons name="account-circle" size={20} color="#FFF" />
                </TouchableOpacity>
                
                <View style={styles.commentContent}>
                  <Text style={styles.commentUserName}>{comment.userName || 'User'}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <Text style={styles.commentTimestamp}>{formatTimestamp(comment.createdAt)}</Text>
                </View>
              </View>
            ))}
            
            {hasMoreComments && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => toggleComments(item.id)}
              >
                <Text style={styles.showMoreText}>
                  View all {postComments.length} comments
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Add comment input */}
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#A0A0A0"
            value={commentInputs[item.id] || ''}
            onChangeText={text => handleCommentChange(item.id, text)}
          />
          
          <TouchableOpacity
            style={[
              styles.postCommentButton,
              (!commentInputs[item.id] || !commentInputs[item.id].trim()) && styles.disabledButton
            ]}
            disabled={!commentInputs[item.id] || !commentInputs[item.id].trim()}
            onPress={() => handlePostComment(item.id)}
          >
            <MaterialCommunityIcons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="post-outline" size={64} color="#FFF" />
        <Text style={styles.emptyTitle}>No Posts Yet</Text>
        <Text style={styles.emptyText}>
          Be the first to share news about your business or interact with other businesses in Cameroon.
        </Text>
        
        {user && (
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => setShowPostInput(true)}
          >
            <Text style={styles.createPostButtonText}>Create First Post</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
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
      
      <Animatable.View 
        ref={headerAnimation}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Explore</Text>
        
        {user && (
          <TouchableOpacity
            style={styles.newPostButton}
            onPress={() => setShowPostInput(!showPostInput)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
            <Text style={styles.newPostButtonText}>New Post</Text>
          </TouchableOpacity>
        )}
      </Animatable.View>
      
      {showPostInput && (
        <Animatable.View 
          animation="slideInDown"
          style={styles.createPostContainer}
        >
          <Text style={styles.createPostTitle}>Create New Post</Text>
          
          <TextInput
            style={styles.postContentInput}
            placeholder="What's new with your business?"
            placeholderTextColor="#A0A0A0"
            multiline
            value={newPostContent}
            onChangeText={setNewPostContent}
          />
          
          {newPostImage && (
            <View style={styles.previewImageContainer}>
              <Image 
                source={{ uri: newPostImage }} 
                style={styles.previewImage} 
              />
              
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setNewPostImage(null)}
              >
                <MaterialCommunityIcons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.createPostActions}>
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={() => {
                // Image selection would be implemented here
                Alert.alert('Feature', 'Image selection not implemented in this demo');
              }}
            >
              <MaterialCommunityIcons name="image-plus" size={24} color="#FFF" />
              <Text style={styles.addImageText}>Add Image</Text>
            </TouchableOpacity>
            
            <View style={styles.createPostButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowPostInput(false);
                  setNewPostContent('');
                  setNewPostImage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.publishButton,
                  (!newPostContent.trim() || creatingPost) && styles.disabledButton
                ]}
                disabled={!newPostContent.trim() || creatingPost}
                onPress={handleCreatePost}
              >
                {creatingPost ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.publishButtonText}>Publish</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>
      )}
      
      <Animatable.View 
        ref={contentAnimation}
        style={styles.content}
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FFF" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchPosts}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.postsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}
      </Animatable.View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  newPostButtonText: {
    color: '#FFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  postsList: {
    padding: 10,
    paddingBottom: 80,
  },
  postCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 87, 146, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTimestamp: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  postContent: {
    color: '#FFF',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingBottom: 12,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    color: '#FFF',
    marginLeft: 8,
  },
  commentsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 87, 146, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 8,
  },
  commentUserName: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  commentText: {
    color: '#E0E0E0',
    fontSize: 14,
    marginBottom: 4,
  },
  commentTimestamp: {
    color: '#A0A0A0',
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  showMoreButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  showMoreText: {
    color: '#00BBE4',
    fontSize: 14,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#FFF',
    fontSize: 14,
    maxHeight: 100,
  },
  postCommentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#005792',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  createPostContainer: {
    backgroundColor: 'rgba(0, 33, 77, 0.9)',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    marginTop: 0,
  },
  createPostTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  postContentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  previewImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addImageText: {
    color: '#FFF',
    marginLeft: 8,
  },
  createPostButtons: {
    flexDirection: 'row',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#A0A0A0',
    fontWeight: 'bold',
  },
  publishButton: {
    backgroundColor: '#00BBE4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  publishButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#A0A0A0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createPostButton: {
    backgroundColor: '#00BBE4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createPostButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default ExploreScreen;
