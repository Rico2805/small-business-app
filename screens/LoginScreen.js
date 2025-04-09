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
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { loginUser, loginDeveloper } from '../services/authService';
import { mockSignIn, getAuthMode, setAuthMode, AUTH_MODES } from '../services/mockAuthService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('customer'); // 'customer', 'business', or 'developer'
  const [isLoading, setIsLoading] = useState(false);
  const [useMockAuth, setUseMockAuth] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Animation references
  const headerAnimation = useRef(null);
  const formAnimation = useRef(null);
  const buttonAnimation = useRef(null);
  const logoAnimation = useRef(new Animated.Value(0)).current;
  
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
    
    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Check if we're using mock auth
    const checkAuthMode = async () => {
      const mode = await getAuthMode();
      setUseMockAuth(mode === AUTH_MODES.MOCK);
    };
    
    checkAuthMode();
  }, []);
  
  // Prepare logo scale animation
  const logoScale = logoAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const handleLogin = async () => {
    // Validate inputs
    if (!email.trim()) {
      Alert.alert(t('error'), t('emailRequired'));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t('error'), t('invalidEmail'));
      return;
    }
    
    if (!password.trim()) {
      Alert.alert(t('error'), t('passwordRequired'));
      return;
    }
    
    setIsLoading(true);
    try {
      // Run the button animation
      buttonAnimation.current.pulse(800);
      await new Promise(resolve => setTimeout(resolve, 800)); // for animation to complete
      
      let loginResult;
      
      // Use either mock or Firebase authentication based on the setting
      if (useMockAuth) {
        // Using mock authentication for testing
        loginResult = await mockSignIn(email, password);
      } else {
        // Using real Firebase authentication
        if (userType === 'developer') {
          const result = await loginDeveloper(email, password);
          if (result.success) {
            loginResult = { user: result.user, userType: 'developer' };
          }
        } else {
          const user = await loginUser(email, password);
          loginResult = { user, userType: user.type };
        }
      }
      
      // If we got here, login was successful
      formAnimation.current.fadeOutDown(500);
      headerAnimation.current.fadeOut(500);
      
      setTimeout(() => {
        // Navigate based on user type to the appropriate tab navigator
        if (loginResult.userType === 'developer') {
          navigation.navigate('DeveloperTabs');
        } else if (loginResult.userType === 'business') {
          navigation.navigate('BusinessTabs');
        } else {
          navigation.navigate('CustomerTabs');
        }
      }, 600);
    } catch (error) {
      console.error('Login error:', error);
      buttonAnimation.current.shake(800);
      Alert.alert('Login Failed', `Error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle between mock and real authentication
  const toggleAuthMode = async (value) => {
    setUseMockAuth(value);
    await setAuthMode(value ? AUTH_MODES.MOCK : AUTH_MODES.FIREBASE);
    // Show feedback to user
    Alert.alert(
      'Authentication Mode', 
      `Switched to ${value ? 'Test Mode' : 'Online Mode'}. ${value ? 'Using offline test accounts.' : 'Using Firebase authentication.'}`
    );
  };

  const switchUserType = (type) => {
    if (type !== userType) {
      setUserType(type);
      if (headerAnimation.current) headerAnimation.current.pulse(500);
    }
  };

  const renderUserTypeSelector = () => {
    const types = [
      { id: 'customer', label: 'Customer', icon: 'account' },
      { id: 'business', label: 'Business', icon: 'store' },
      { id: 'developer', label: 'Developer', icon: 'code-tags' }
    ];
    
    return (
      <View style={styles.userTypeSelectorContainer}>
        {types.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.userTypeButton,
              userType === type.id && styles.selectedUserTypeButton
            ]}
            onPress={() => switchUserType(type.id)}
            activeOpacity={0.7}
          >
            <Animatable.View
              animation={userType === type.id ? 'pulse' : undefined}
              duration={500}
              style={styles.userTypeInner}
            >
              <MaterialCommunityIcons 
                name={type.icon} 
                size={18} 
                color={userType === type.id ? '#005792' : '#666'} 
              />
              <Text
                style={[
                  styles.userTypeLabel,
                  userType === type.id && styles.selectedUserTypeLabel
                ]}
              >
                {type.label}
              </Text>
            </Animatable.View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00214D" barStyle="light-content" />
      
      {/* Language switcher moved to footer section */}
      
      {/* Background gradient */}
      <LinearGradient
        colors={['#00214D', '#005792', '#00BBE4']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Decorative bubbles */}
      <View style={styles.bubblesContainer}>
        <Animated.View 
          style={[
            styles.bubble, 
            styles.bubble1,
            { transform: [{ scale: logoScale }] }
          ]} 
        />
        <View style={[styles.bubble, styles.bubble2]} />
        <View style={[styles.bubble, styles.bubble3]} />
        <View style={[styles.bubble, styles.bubble4]} />
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
          >
            <Text style={styles.title}>{t('welcome')}</Text>
            <Text style={styles.subtitle}>{t('signInToContinue')}</Text>
            
            {/* User type header */}
            <Animatable.Text 
              animation="pulse" 
              iterationCount="infinite" 
              style={styles.userTypeHeader}
            >
              {t(userType.charAt(0).toUpperCase() + userType.slice(1))}
            </Animatable.Text>
          </Animatable.View>
          
          {/* Form Container */}
          <Animatable.View 
            ref={formAnimation}
            style={styles.formContainer}
          >
            {/* Offline Mode Toggle (Cameroon-friendly) */}
            <View style={styles.offlineModeContainer}>
              <Text style={styles.offlineModeText}>{t('testMode')}</Text>
              <Switch
                trackColor={{ false: '#767577', true: '#00BBE4' }}
                thumbColor={useMockAuth ? '#005792' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleAuthMode}
                value={useMockAuth}
              />
            </View>
            {/* User Type Selector */}
            {renderUserTypeSelector()}
            
            {/* Form Fields */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('email')}</Text>
              <TextInput
                style={styles.input}
                placeholder={userType === 'developer' ? t('enterUsername') : t('enterEmail')}
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('password')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('enterPassword')}
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            
            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
            </TouchableOpacity>
            
            {/* Login Button */}
            <Animatable.View
              ref={buttonAnimation}
            >
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#005792', '#00BBE4']}
                  style={styles.loginButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? 'Please wait...' : 'LOGIN'}
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
            {/* Language Switcher */}
            <View style={styles.footerLanguageSwitcher}>
              <LanguageSwitcher />
            </View>
            
            {/* Add spacing */}
            <View style={{ height: 10 }} />
            {userType === 'customer' && (
              <TouchableOpacity 
                onPress={() => navigation.navigate('Signup')}
                style={styles.signupButton}
              >
                <Text style={styles.signupText}>
                  Don't have an account? <Text style={styles.signupHighlight}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            )}
            
            {userType === 'business' && (
              <TouchableOpacity 
                onPress={() => navigation.navigate('BusinessRegistration')}
                style={styles.businessRegButton}
              >
                <Text style={styles.businessRegText}>
                  Register your Business
                </Text>
              </TouchableOpacity>
            )}
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  footerLanguageSwitcher: {
    alignSelf: 'center',
    marginBottom: 10,
    transform: [{ scale: 0.9 }], // Make switcher slightly smaller
  },
  offlineModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  offlineModeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
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
    top: height * 0.1,
    left: width * 0.1,
  },
  bubble2: {
    width: 140,
    height: 140,
    top: height * 0.2,
    right: -30,
  },
  bubble3: {
    width: 80,
    height: 80,
    bottom: height * 0.3,
    right: width * 0.3,
  },
  bubble4: {
    width: 120,
    height: 120,
    bottom: -30,
    left: width * 0.15,
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
  userTypeHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    textAlign: 'center',
    minWidth: 150,
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
  userTypeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  userTypeButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  userTypeInner: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userTypeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
  },
  selectedUserTypeButton: {
    borderColor: '#005792',
    backgroundColor: 'rgba(0, 87, 146, 0.1)',
  },
  selectedUserTypeLabel: {
    color: '#005792',
    fontWeight: 'bold',
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#005792',
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  signupButton: {
    marginVertical: 8,
  },
  signupText: {
    color: '#FFF',
    fontSize: 14,
  },
  signupHighlight: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  businessRegButton: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  businessRegText: {
    color: '#FFF',
    fontWeight: '500',
  },
});

export default LoginScreen;
