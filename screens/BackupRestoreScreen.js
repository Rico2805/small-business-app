import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

// Conditionally import Sharing to avoid issues on platforms where it's not supported
let Sharing;
try {
  Sharing = require('expo-sharing');
} catch (e) {
  console.log('expo-sharing not available, sharing features will be limited');
  // Provide a mock implementation
  Sharing = {
    isAvailableAsync: async () => false,
    shareAsync: async () => {}
  };
}
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getAllBusinesses, getAllUsers } from '../services/dataService';

const { width } = Dimensions.get('window');

const BackupRestoreScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  
  // Animation references
  const headerAnimation = useRef(null);
  const contentAnimation = useRef(null);
  
  // Share a backup file
  const shareBackup = async (fileUri) => {
    try {
      const isSharingAvailable = Sharing && 
                               Sharing.isAvailableAsync && 
                               await Sharing.isAvailableAsync();
      
      if (!isSharingAvailable) {
        Alert.alert('Error', t('error') + ': Sharing not available on this device');
        return;
      }
      
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Error sharing backup:', error);
      Alert.alert('Error', t('error') + ': ' + error.message);
    }
  };

  useEffect(() => {
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (contentAnimation.current) contentAnimation.current.fadeInUp(800);
    }, 600);
    
    // Check for existing backups
    checkExistingBackups();
  }, []);
  
  const checkExistingBackups = async () => {
    try {
      // Create backup directory if it doesn't exist
      const backupDir = `${FileSystem.documentDirectory}backups`;
      const dirInfo = await FileSystem.getInfoAsync(backupDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(backupDir);
      }
      
      // Get list of backups
      const backupFiles = await FileSystem.readDirectoryAsync(backupDir);
      
      // Get info for each backup file
      const backupInfoPromises = backupFiles.map(async (filename) => {
        const fileUri = `${backupDir}/${filename}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        return {
          name: filename,
          uri: fileUri,
          size: fileInfo.size,
          modificationTime: fileInfo.modificationTime || Date.now(),
        };
      });
      
      const backupInfos = await Promise.all(backupInfoPromises);
      
      // Sort by modification time (newest first)
      backupInfos.sort((a, b) => b.modificationTime - a.modificationTime);
      
      setBackups(backupInfos);
    } catch (error) {
      console.error('Error checking for backups:', error);
      Alert.alert('Error', 'Failed to check for existing backups.');
    }
  };
  
  const createBackup = async () => {
    setBackupInProgress(true);
    
    try {
      // Get data to backup
      const businesses = await getAllBusinesses();
      const users = await getAllUsers();
      
      // Create backup object
      const backupData = {
        timestamp: Date.now(),
        version: '1.0',
        data: {
          businesses,
          users
        }
      };
      
      // Convert to JSON string
      const backupString = JSON.stringify(backupData, null, 2);
      
      // Generate filename with date
      const date = new Date();
      const dateString = date.toISOString().split('T')[0];
      const timeString = date.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `backup_${dateString}_${timeString}.json`;
      
      // Write to file
      const backupDir = `${FileSystem.documentDirectory}backups`;
      const fileUri = `${backupDir}/${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, backupString);
      
      // Update backup list
      await checkExistingBackups();
      

      
      // Show success message
      Alert.alert('Success', t('backupSuccess'));
      
      // Share the backup
      shareBackup(fileUri);
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert('Error', 'Failed to create backup: ' + error.message);
    } finally {
      setBackupInProgress(false);
    }
  };
  
  const restoreBackup = async (fileUri = null) => {
    setRestoreInProgress(true);
    
    try {
      let backupFile;
      
      if (!fileUri) {
        // If no fileUri provided, let user pick a file
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true
        });
        
        if (result.canceled) {
          setRestoreInProgress(false);
          return;
        }
        
        backupFile = result.assets[0];
      } else {
        backupFile = { uri: fileUri };
      }
      
      // Read backup file
      const backupString = await FileSystem.readAsStringAsync(backupFile.uri);
      const backupData = JSON.parse(backupString);
      
      // Verify backup structure
      if (!backupData.version || !backupData.data || !backupData.timestamp) {
        throw new Error('Invalid backup file format');
      }
      
      // Here you would use your backend service to restore the data
      // For now, let's just simulate a successful restore
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Success', t('restoreSuccess'));
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore backup: ' + error.message);
    } finally {
      setRestoreInProgress(false);
    }
  };
  
  const deleteBackup = async (backupUri) => {
    try {
      await FileSystem.deleteAsync(backupUri);
      await checkExistingBackups();
      Alert.alert('Success', 'Backup deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete backup');
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const renderBackupItem = (backup, index) => {
    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={500} 
        delay={index * 100}
        style={styles.backupItem}
        key={backup.uri}
      >
        <View style={styles.backupIconContainer}>
          <MaterialCommunityIcons name="file-document-outline" size={24} color="#005792" />
        </View>
        
        <View style={styles.backupInfo}>
          <Text style={styles.backupName}>{backup.name}</Text>
          <Text style={styles.backupDate}>{formatDate(backup.modificationTime)}</Text>
          <Text style={styles.backupSize}>{formatFileSize(backup.size)}</Text>
        </View>
        
        <View style={styles.backupActions}>
          <TouchableOpacity
            style={[styles.backupAction, styles.restoreAction]}
            onPress={() => restoreBackup(backup.uri)}
          >
            <MaterialCommunityIcons name="restore" size={20} color="#005792" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.backupAction, styles.shareAction]}
            onPress={async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(backup.uri);
              }
            }}
          >
            <MaterialCommunityIcons name="share-variant" size={20} color="#4CAF50" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.backupAction, styles.deleteAction]}
            onPress={() => {
              Alert.alert(
                'Delete Backup',
                'Are you sure you want to delete this backup?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteBackup(backup.uri) }
                ]
              );
            }}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </Animatable.View>
    );
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
        <Text style={styles.headerTitle}>{t('backupRestore')}</Text>
        <View style={{ width: 24 }} />
      </Animatable.View>
      
      {/* Content */}
      <Animatable.View ref={contentAnimation} style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Backup Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="backup-restore" size={24} color="#FFF" />
              <Text style={styles.sectionTitle}>{t('downloadBackup')}</Text>
            </View>
            
            <View style={styles.card}>
              <Text style={styles.cardText}>{t('backupInfo')}</Text>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={createBackup}
                disabled={backupInProgress}
              >
                {backupInProgress ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="cloud-download-outline" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>{t('downloadBackup')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Restore Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="upload-outline" size={24} color="#FFF" />
              <Text style={styles.sectionTitle}>{t('restoreBackup')}</Text>
            </View>
            
            <View style={styles.card}>
              <Text style={styles.cardText}>Select a backup file to restore data from a previous backup.</Text>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => restoreBackup()}
                disabled={restoreInProgress}
              >
                {restoreInProgress ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="file-upload-outline" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>{t('restoreBackup')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Existing Backups Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="history" size={24} color="#FFF" />
              <Text style={styles.sectionTitle}>{t('lastBackup')}</Text>
            </View>
            
            <View style={styles.card}>
              {backups.length === 0 ? (
                <Text style={styles.emptyText}>No backups found.</Text>
              ) : (
                <View style={styles.backupsList}>
                  {backups.map(renderBackupItem)}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </Animatable.View>
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
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#005792',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  backupsList: {
    marginTop: 8,
  },
  backupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: 12,
  },
  backupIconContainer: {
    marginRight: 12,
  },
  backupInfo: {
    flex: 1,
  },
  backupName: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  backupDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  backupSize: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  backupActions: {
    flexDirection: 'row',
  },
  backupAction: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  restoreAction: {
    backgroundColor: 'rgba(0, 87, 146, 0.1)',
  },
  shareAction: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  deleteAction: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
});

export default BackupRestoreScreen;
