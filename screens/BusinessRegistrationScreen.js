import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  Alert,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { registerBusiness } from '../services/businessService';

const { width, height } = Dimensions.get('window');

const BusinessRegistrationScreen = ({ navigation }) => {
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [region, setRegion] = useState({
    latitude: 4.0435,  // Cameroon's coordinates as default
    longitude: 9.7860,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Animation references
  const headerAnimation = useRef(null);
  const formAnimation = useRef(null);
  const buttonAnimation = useRef(null);
  const mapAnimation = useRef(null);
  const imageAnimation = useRef(null);

  useEffect(() => {
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 200);
    
    setTimeout(() => {
      if (formAnimation.current) formAnimation.current.fadeInUp(800);
    }, 500);
    
    setTimeout(() => {
      if (mapAnimation.current) mapAnimation.current.fadeIn(800);
    }, 800);
    
    setTimeout(() => {
      if (buttonAnimation.current) buttonAnimation.current.fadeIn(800);
    }, 1100);
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        
        if (imageAnimation.current) {
          imageAnimation.current.pulse(500);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const handleMapPress = (e) => {
    setRegion({
      ...region,
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    });
    
    if (mapAnimation.current) {
      mapAnimation.current.pulse(500);
    }
  };

  const handleRegister = async () => {
    // Validate inputs
    if (!businessName.trim()) {
      Alert.alert('Error', 'Please enter your business name');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (!image) {
      Alert.alert('Error', 'Please add a business image');
      return;
    }
    
    setIsLoading(true);
    try {
      buttonAnimation.current.pulse(800);
      await new Promise(resolve => setTimeout(resolve, 800)); // for animation to complete
      
      // Call the actual business registration service
      await registerBusiness(
        businessName, 
        description, 
        image, 
        {
          latitude: region.latitude,
          longitude: region.longitude
        },
        email,
        password
      );
      
      formAnimation.current.fadeOutDown(500);
      headerAnimation.current.fadeOut(500);
      
      setTimeout(() => {
        Alert.alert('Success', 'Business registered successfully! Awaiting approval.');
        navigation.navigate('Login');
      }, 600);
    } catch (error) {
      buttonAnimation.current.shake(800);
      Alert.alert('Registration Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00214D" barStyle="light-content" />
      
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
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animatable.View 
            ref={headerAnimation}
            style={styles.headerContainer}
          >
            <Text style={styles.title}>Business Registration</Text>
            <Text style={styles.subtitle}>Grow your business with us</Text>
          </Animatable.View>
          
          {/* Form Container */}
          <Animatable.View 
            ref={formAnimation}
            style={styles.formContainer}
          >
            {/* Form Fields */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your business name"
                placeholderTextColor="#A0A0A0"
                value={businessName}
                onChangeText={setBusinessName}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your business"
                placeholderTextColor="#A0A0A0"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter business email"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            
            {/* Map Section */}
            <View style={styles.mapSection}>
              <Text style={styles.inputLabel}>Business Location</Text>
              <Text style={styles.mapHelp}>Tap on the map to set your business location</Text>
              
              <Animatable.View
                ref={mapAnimation}
                style={styles.mapContainer}
              >
                <MapView
                  style={styles.map}
                  region={region}
                  onPress={handleMapPress}
                >
                  <Marker coordinate={region} />
                </MapView>
              </Animatable.View>
            </View>
            
            {/* Image Picker */}
            <View style={styles.imagePickerSection}>
              <Text style={styles.inputLabel}>Business Image</Text>
              
              <TouchableOpacity 
                style={styles.imagePickerButton}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#005792', '#00BBE4']}
                  style={styles.imagePickerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.imagePickerText}>
                    {image ? 'Change Image' : 'Select Image'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {image && (
                <Animatable.View
                  ref={imageAnimation}
                  style={styles.imagePreviewContainer}
                >
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                </Animatable.View>
              )}
            </View>
            
            {/* Register Button */}
            <Animatable.View
              ref={buttonAnimation}
              style={styles.buttonContainer}
            >
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#005792', '#00BBE4']}
                  style={styles.registerButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.registerButtonText}>
                    {isLoading ? 'REGISTERING...' : 'REGISTER BUSINESS'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          </Animatable.View>
          
          {/* Footer */}
          <Animatable.View
            animation="fadeIn"
            delay={1200}
            style={styles.footer}
          >
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              style={styles.backButton}
            >
              <Text style={styles.backText}>
                <Text style={styles.backHighlight}>← Back to Login</Text>
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerContainer: {
    width: width * 0.85,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E0E0',
    marginTop: 8,
  },
  formContainer: {
    width: width * 0.9,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  mapSection: {
    marginBottom: 20,
  },
  mapHelp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  mapContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: 200,
  },
  imagePickerSection: {
    marginBottom: 20,
  },
  imagePickerButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imagePickerGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  imagePreview: {
    width: width * 0.7,
    height: width * 0.5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  buttonContainer: {
    marginTop: 10,
  },
  registerButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  registerButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  backButton: {
    marginVertical: 8,
  },
  backText: {
    color: '#FFF',
    fontSize: 14,
  },
  backHighlight: {
    fontWeight: 'bold',
  }
});

export default BusinessRegistrationScreen;
