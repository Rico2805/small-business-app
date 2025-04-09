import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  StatusBar,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { registerUser } from '../services/authService';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation references
  const headerAnimation = useRef(null);
  const formAnimation = useRef(null);
  const buttonAnimation = useRef(null);

  useEffect(() => {
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (formAnimation.current) formAnimation.current.fadeInUpBig(800);
    }, 600);
    
    setTimeout(() => {
      if (buttonAnimation.current) buttonAnimation.current.fadeIn(800);
    }, 1200);
  }, []);

  const handleSignup = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
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
    
    setIsLoading(true);
    try {
      buttonAnimation.current.pulse(800);
      await new Promise(resolve => setTimeout(resolve, 800)); // for animation to complete
      
      // Call the actual registration service
      await registerUser(email.trim(), password, {
        name: name.trim(),
        type: 'customer'
      });
      
      formAnimation.current.fadeOutDown(500);
      headerAnimation.current.fadeOut(500);
      
      setTimeout(() => {
        Alert.alert('Success', 'Account created successfully!');
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to join our community</Text>
          </Animatable.View>
          
          {/* Form Container */}
          <Animatable.View 
            ref={formAnimation}
            style={styles.formContainer}
          >
            {/* Form Fields */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#A0A0A0"
                value={name}
                onChangeText={setName}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
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
            
            {/* Signup Button */}
            <Animatable.View
              ref={buttonAnimation}
            >
              <TouchableOpacity
                style={styles.signupButton}
                onPress={handleSignup}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#005792', '#00BBE4']}
                  style={styles.signupButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.signupButtonText}>
                    {isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          </Animatable.View>
          
          {/* Footer */}
          <Animatable.View
            animation="fadeIn"
            delay={1000}
            style={styles.footer}
          >
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginHighlight}>Login</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  headerContainer: {
    width: width * 0.85,
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
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
    width: width * 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 24,
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
    fontSize: 14,
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
  signupButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 10,
  },
  signupButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginButton: {
    marginVertical: 8,
  },
  loginText: {
    color: '#FFF',
    fontSize: 14,
  },
  loginHighlight: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;
