import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { logoutUser } from '../services/logoutService';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const { width } = Dimensions.get('window');

const DeveloperProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [developerInfo, setDeveloperInfo] = useState({
    name: 'Franco',
    email: 'developer@camsmallbusiness.com',
    role: 'System Administrator',
    lastLogin: '2025-04-05 08:30 AM',
    actionsCompleted: 147,
    accountCreated: '2024-01-15'
  });

  // Animation references
  const headerAnimation = useRef(null);
  const contentAnimation = useRef(null);

  useEffect(() => {
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (contentAnimation.current) contentAnimation.current.fadeInUp(800);
    }, 600);
  }, []);

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
        <View style={[styles.bubble, styles.bubble3]} />
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
          <Text style={styles.title}>{t('developerProfile')}</Text>
        </Animatable.View>

        {/* Profile Section */}
        <Animatable.View 
          ref={contentAnimation}
          style={styles.profileCard}
        >
          <View style={styles.profileIconContainer}>
            <MaterialCommunityIcons name="account-tie" size={64} color="#005792" />
          </View>
          
          <Text style={styles.profileName}>{developerInfo.name}</Text>
          <Text style={styles.profileRole}>{developerInfo.role}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#005792" />
            <Text style={styles.infoText}>{developerInfo.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#005792" />
            <Text style={styles.infoText}>Last login: {developerInfo.lastLogin}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#005792" />
            <Text style={styles.infoText}>Account created: {developerInfo.accountCreated}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#005792" />
            <Text style={styles.infoText}>Actions completed: {developerInfo.actionsCompleted}</Text>
          </View>
        </Animatable.View>
        
        {/* Administration Options */}
        <Animatable.View 
          animation="fadeIn" 
          duration={800}
          delay={800}
          style={styles.actionsCard}
        >
          <Text style={styles.sectionTitle}>{t('administration')}</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.getParent().navigate('DeveloperStack')}
          >
            <MaterialCommunityIcons name="shield-account" size={24} color="#005792" />
            <Text style={styles.actionText}>{t('adminDashboard')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('SystemLogs')}
          >
            <MaterialCommunityIcons name="database" size={24} color="#005792" />
            <Text style={styles.actionText}>{t('systemLogs')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('BackupRestore')}
          >
            <MaterialCommunityIcons name="backup-restore" size={24} color="#005792" />
            <Text style={styles.actionText}>{t('backupRestore')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('SystemSettings')}
          >
            <MaterialCommunityIcons name="cog-outline" size={24} color="#005792" />
            <Text style={styles.actionText}>{t('systemSettings')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </Animatable.View>
        
        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="logout" size={20} color="#FFF" />
              <Text style={styles.signOutText}>{t('signOut')}</Text>
            </>
          )}
        </TouchableOpacity>
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
  bubble3: {
    width: 60,
    height: 60,
    top: 160,
    left: 20,
  },
  scrollView: {
    flexGrow: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 87, 146, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    width: '100%',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  actionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  signOutButton: {
    backgroundColor: '#E53935',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signOutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default DeveloperProfileScreen;
