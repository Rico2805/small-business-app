import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  ImageBackground,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { logoutUser } from '../services/logoutService';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const { width } = Dimensions.get('window');

const BusinessProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [businessName, setBusinessName] = useState('Bakery Delight');
  const [description, setDescription] = useState('Fresh, delicious pastries and breads made daily');
  const [email, setEmail] = useState('info@bakerydelight.com');
  const [phone, setPhone] = useState('+1 555-0123');
  const [address, setAddress] = useState('123 Main St, Bakery City');
  const [openHours, setOpenHours] = useState('9:00 AM - 6:00 PM');
  const [website, setWebsite] = useState('www.bakerydelight.com');
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState('https://via.placeholder.com/1200x600/00214D/FFFFFF?text=Bakery+Cover');
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/120x120/005792/FFFFFF?text=B');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const headerAnimation = React.createRef();
  const formAnimation = React.createRef();
  const businessInfoAnimation = React.createRef();

  useEffect(() => {
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (formAnimation.current) formAnimation.current.fadeInUp(800);
    }, 600);

    setTimeout(() => {
      if (businessInfoAnimation.current) businessInfoAnimation.current.fadeInUp(800);
    }, 1000);
  }, []);

  const handleUpdateBusinessProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Business profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update business profile');
    } finally {
      setLoading(false);
    }
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
            setLoading(true);
            try {
              await logoutUser(navigation);
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const validateForm = () => {
    if (!businessName.trim()) {
      Alert.alert('Error', 'Business name is required');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Valid email is required');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    }
    return true;
  };

  const handleImageUpload = async (type) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload an image.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Images], // Changed from MediaTypeOptions
        allowsEditing: true,
        aspect: type === 'cover' ? [16, 9] : [1, 1],
        quality: 0.8,
      });
  
      if (!result.canceled) {
        if (type === 'cover') {
          setCoverImage(result.assets[0].uri); // Changed from { uri: result.assets[0].uri }
        } else {
          setProfileImage(result.assets[0].uri); // Changed from { uri: result.assets[0].uri }
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const renderBusinessInfo = () => {
    return (
      <Animatable.View 
        ref={businessInfoAnimation}
        style={styles.businessInfoContainer}
      >
        <TouchableOpacity 
          style={styles.coverImageContainer}
          onPress={() => handleImageUpload('cover')}
        >
          <ImageBackground
            source={{ uri: coverImage }}
            style={styles.coverImage}
            imageStyle={styles.coverImageStyle}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.coverOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <TouchableOpacity 
                style={styles.editCoverButton}
              >
                <MaterialCommunityIcons 
                  name="camera-plus" 
                  size={24} 
                  color="#FFF" 
                />
              </TouchableOpacity>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        <View style={styles.businessDetails}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={() => handleImageUpload('profile')}
          >
            <View style={styles.profileImageWrapper}>
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            </View>
            <View style={styles.editProfileButton}>
              <MaterialCommunityIcons 
                name="camera-plus" 
                size={20} 
                color="#FFF" 
              />
            </View>
          </TouchableOpacity>

          <Text style={styles.businessName}>{businessName}</Text>
          <Text style={styles.businessDescription}>{description}</Text>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <MaterialCommunityIcons 
                name="email" 
                size={20} 
                color="#FFF" 
              />
              <Text style={styles.contactText}>{email}</Text>
            </View>
            <View style={styles.contactItem}>
              <MaterialCommunityIcons 
                name="phone" 
                size={20} 
                color="#FFF" 
              />
              <Text style={styles.contactText}>{phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={20} 
                color="#FFF" 
              />
              <Text style={styles.contactText}>{address}</Text>
            </View>
            <View style={styles.contactItem}>
              <MaterialCommunityIcons 
                name="clock" 
                size={20} 
                color="#FFF" 
              />
              <Text style={styles.contactText}>{openHours}</Text>
            </View>
          </View>
        </View>
      </Animatable.View>
    );
  };

  const renderForm = () => {
    return (
      <Animatable.View 
        ref={formAnimation}
        style={styles.formContainer}
      >
        {/* Basic Info Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Business Name"
              value={businessName}
              onChangeText={setBusinessName}
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
          </View>
        </View>

        {/* Contact Info Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#A0A0A0"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#A0A0A0"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Location & Hours Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Location & Hours</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#A0A0A0"
            />
            <TextInput
              style={styles.input}
              placeholder="Business Hours"
              value={openHours}
              onChangeText={setOpenHours}
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>

        {/* Advanced Options Section */}
        <TouchableOpacity 
          style={styles.advancedSection}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.sectionTitle}>Advanced Options</Text>
          <MaterialCommunityIcons 
            name={showAdvanced ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color="#FFF"
          />
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Website"
                value={website}
                onChangeText={setWebsite}
                placeholderTextColor="#A0A0A0"
                keyboardType="url"
              />
              {/* Add more advanced options here */}
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonLoading]}
          onPress={handleUpdateBusinessProfile}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator 
                size="small" 
                color="#FFF" 
              />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        
        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons 
              name="chevron-left" 
              size={24} 
              color="#FFF" 
            />
          </TouchableOpacity>
          
          <Text style={styles.title}>{t('businessProfile')}</Text>
        </Animatable.View>

        {renderBusinessInfo()}
        {renderForm()}
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
  businessInfoContainer: {
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  coverImageContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  coverImage: {
    width: width - 32,
    height: 200,
  },
  coverImageStyle: {
    opacity: 0.9,
  },
  coverOverlay: {
    flex: 1,
  },
  editCoverButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    padding: 8,
  },
  businessDetails: {
    padding: 24,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 4,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  businessDescription: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 24,
  },
  contactInfo: {
    marginTop: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    color: '#FFF',
    marginLeft: 12,
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
  advancedSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButton: {
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
  saveButtonLoading: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  signOutButton: {
    marginTop: 20,
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
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});

export default BusinessProfileScreen;
