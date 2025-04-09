import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  Switch,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLanguagePreference } from '../i18n';

const { width } = Dimensions.get('window');

const SystemSettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Settings state
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  
  // System info
  const [systemInfo, setSystemInfo] = useState({
    appVersion: '1.0.0',
    databaseVersion: '2.1',
    serverStatus: 'Online',
    lastUpdate: new Date().toISOString(),
    activeUsers: 128,
    totalBusinesses: 42,
    pendingApprovals: 5,
    storageUsage: '245 MB',
    apiCalls: '12,456 / day'
  });
  
  // Animation references
  const headerAnimation = useRef(null);
  const contentAnimation = useRef(null);

  useEffect(() => {
    // Load settings
    loadSettings();
    
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (contentAnimation.current) contentAnimation.current.fadeInUp(800);
    }, 600);
  }, []);
  
  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load settings from AsyncStorage
      const darkModeSetting = await AsyncStorage.getItem('darkMode');
      const notificationsSetting = await AsyncStorage.getItem('notificationsEnabled');
      const maintenanceModeSetting = await AsyncStorage.getItem('maintenanceMode');
      const advancedModeSetting = await AsyncStorage.getItem('advancedMode');
      const languageSetting = await AsyncStorage.getItem('userLanguage');
      
      // Update state with loaded settings
      if (darkModeSetting !== null) setDarkMode(darkModeSetting === 'true');
      if (notificationsSetting !== null) setNotificationsEnabled(notificationsSetting === 'true');
      if (maintenanceModeSetting !== null) setMaintenanceMode(maintenanceModeSetting === 'true');
      if (advancedModeSetting !== null) setAdvancedMode(advancedModeSetting === 'true');
      if (languageSetting !== null) setLanguage(languageSetting);
      
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };
  
  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      // Save settings to AsyncStorage
      await AsyncStorage.setItem('darkMode', darkMode.toString());
      await AsyncStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
      await AsyncStorage.setItem('maintenanceMode', maintenanceMode.toString());
      await AsyncStorage.setItem('advancedMode', advancedMode.toString());
      
      // Show success message
      Alert.alert('Success', t('settingsSaved'));
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };
  
  const changeLanguage = async (newLanguage) => {
    if (newLanguage === language) return;
    
    setLoading(true);
    try {
      // Use the helper function from i18n.js
      await setLanguagePreference(newLanguage);
      setLanguage(newLanguage);
      
      // Show success message
      Alert.alert('Success', t('settingsSaved'));
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert('Error', 'Failed to change language');
    } finally {
      setLoading(false);
    }
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
      
      {/* Header */}
      <Animatable.View ref={headerAnimation} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('systemSettings')}</Text>
        <View style={{ width: 24 }} />
      </Animatable.View>
      
      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      ) : (
        <Animatable.View ref={contentAnimation} style={styles.content}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* App Settings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('settings')}</Text>
              
              <View style={styles.settingsCard}>
                {/* Language Setting */}
                <View style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <MaterialCommunityIcons name="translate" size={24} color="#005792" />
                    <Text style={styles.settingLabel}>{t('language')}</Text>
                  </View>
                  
                  <View style={styles.languageButtons}>
                    <TouchableOpacity 
                      style={[
                        styles.languageButton, 
                        language === 'en' && styles.activeLanguageButton
                      ]}
                      onPress={() => changeLanguage('en')}
                    >
                      <Text style={[
                        styles.languageButtonText,
                        language === 'en' && styles.activeLanguageButtonText
                      ]}>English</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.languageButton, 
                        language === 'fr' && styles.activeLanguageButton
                      ]}
                      onPress={() => changeLanguage('fr')}
                    >
                      <Text style={[
                        styles.languageButtonText,
                        language === 'fr' && styles.activeLanguageButtonText
                      ]}>Français</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Dark Mode Setting */}
                <View style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <MaterialCommunityIcons name="theme-light-dark" size={24} color="#005792" />
                    <Text style={styles.settingLabel}>{t('darkMode')}</Text>
                  </View>
                  
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: '#ccc', true: '#00BBE4' }}
                    thumbColor={darkMode ? '#005792' : '#f4f3f4'}
                  />
                </View>
                
                {/* Notifications Setting */}
                <View style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#005792" />
                    <Text style={styles.settingLabel}>{t('notificationSettings')}</Text>
                  </View>
                  
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: '#ccc', true: '#00BBE4' }}
                    thumbColor={notificationsEnabled ? '#005792' : '#f4f3f4'}
                  />
                </View>
                
                {/* Maintenance Mode */}
                <View style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <MaterialCommunityIcons name="tools" size={24} color="#005792" />
                    <Text style={styles.settingLabel}>{t('maintenance')}</Text>
                  </View>
                  
                  <Switch
                    value={maintenanceMode}
                    onValueChange={setMaintenanceMode}
                    trackColor={{ false: '#ccc', true: '#00BBE4' }}
                    thumbColor={maintenanceMode ? '#005792' : '#f4f3f4'}
                  />
                </View>
                
                {/* Advanced Mode */}
                <View style={styles.settingItem}>
                  <View style={styles.settingLabelContainer}>
                    <MaterialCommunityIcons name="cog-outline" size={24} color="#005792" />
                    <Text style={styles.settingLabel}>Advanced Mode</Text>
                  </View>
                  
                  <Switch
                    value={advancedMode}
                    onValueChange={setAdvancedMode}
                    trackColor={{ false: '#ccc', true: '#00BBE4' }}
                    thumbColor={advancedMode ? '#005792' : '#f4f3f4'}
                  />
                </View>
              </View>
              
              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveSettings}
                disabled={savingSettings}
              >
                {savingSettings ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="content-save-outline" size={20} color="#FFF" />
                    <Text style={styles.saveButtonText}>{t('save')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            {/* System Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Information</Text>
              
              <View style={styles.settingsCard}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('appVersion')}</Text>
                  <Text style={styles.infoValue}>{systemInfo.appVersion}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Database Version</Text>
                  <Text style={styles.infoValue}>{systemInfo.databaseVersion}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('serverStatus')}</Text>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]} />
                    <Text style={styles.infoValue}>{systemInfo.serverStatus}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Last Update</Text>
                  <Text style={styles.infoValue}>
                    {new Date(systemInfo.lastUpdate).toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('activeUsers')}</Text>
                  <Text style={styles.infoValue}>{systemInfo.activeUsers}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Total Businesses</Text>
                  <Text style={styles.infoValue}>{systemInfo.totalBusinesses}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Pending Approvals</Text>
                  <Text style={styles.infoValue}>{systemInfo.pendingApprovals}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Storage Usage</Text>
                  <Text style={styles.infoValue}>{systemInfo.storageUsage}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>API Calls</Text>
                  <Text style={styles.infoValue}>{systemInfo.apiCalls}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </Animatable.View>
      )}
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
  bubble3: {
    width: 60,
    height: 60,
    top: 160,
    left: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  languageButtons: {
    flexDirection: 'row',
  },
  languageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
    backgroundColor: '#F0F0F0',
  },
  activeLanguageButton: {
    backgroundColor: '#005792',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activeLanguageButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#005792',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#FFF',
    fontSize: 16,
  },
});

export default SystemSettingsScreen;
