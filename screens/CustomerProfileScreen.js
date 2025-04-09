import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { logoutUser } from '../services/logoutService';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const CustomerProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('customer@test.com');
  const [phoneNumber, setPhoneNumber] = useState('+237 677889900');
  const [address, setAddress] = useState('Yaoundé, Cameroon');
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/120x120/005792/FFFFFF?text=C');
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation references
  const headerAnimation = useRef(null);
  const profileAnimation = useRef(null);
  const formAnimation = useRef(null);

  useEffect(() => {
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (profileAnimation.current) profileAnimation.current.fadeIn(800);
    }, 600);
    
    setTimeout(() => {
      if (formAnimation.current) formAnimation.current.fadeInUp(800);
    }, 900);
  }, []);

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Valid email is required');
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    }
    return true;
  };
  
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            setIsLoading(true);
            try {
              await logoutUser(navigation);
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00214D" barStyle="light-content" />
      
      {/* Language Switcher */}
      <View style={styles.languageSwitcherContainer}>
        <LanguageSwitcher />
      </View>
      
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animatable.View 
          ref={headerAnimation}
          style={styles.headerContainer}
        >
          <Text style={styles.headerTitle}>{t('profile')}</Text>
        </Animatable.View>
        
        {/* Profile Image Section */}
        <Animatable.View 
          ref={profileAnimation}
          style={styles.profileSection}
        >
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <MaterialCommunityIcons name="camera" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </Animatable.View>
        
        {/* Form */}
        <Animatable.View 
          ref={formAnimation}
          style={styles.formContainer}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#A0A0A0"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor="#A0A0A0"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#A0A0A0"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#A0A0A0"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={handleUpdateProfile}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#005792', '#00BBE4']}
              style={styles.updateButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.updateButtonText}>Update Profile</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Sign Out Button */}
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  languageSwitcherContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
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
    width: '100%',
    height: '100%',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 150,
  },
  bubble1: {
    width: 100,
    height: 100,
    top: '10%',
    left: '10%',
  },
  bubble2: {
    width: 150,
    height: 150,
    top: '40%',
    right: '-5%',
  },
  bubble3: {
    width: 80,
    height: 80,
    bottom: '15%',
    left: '15%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#005792',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  updateButton: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  updateButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signOutButton: {
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 59, 59, 0.2)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 59, 0.3)',
  },
  signOutButtonText: {
    color: '#FF5B5B',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default CustomerProfileScreen;
