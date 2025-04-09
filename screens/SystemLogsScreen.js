import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getSystemLogs } from '../services/logsService';

const { width } = Dimensions.get('window');

const SystemLogsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [logType, setLogType] = useState('all'); // 'all', 'user', 'business', 'system'
  
  // Animation references
  const headerAnimation = useRef(null);
  const contentAnimation = useRef(null);

  useEffect(() => {
    fetchLogs();
    
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (contentAnimation.current) contentAnimation.current.fadeInUp(800);
    }, 600);
  }, []);
  
  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, logType]);
  
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logData = await getSystemLogs();
      setLogs(logData);
      setFilteredLogs(logData);
    } catch (error) {
      Alert.alert('Error', t('error') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const filterLogs = () => {
    let filtered = [...logs];
    
    // Filter by type
    if (logType !== 'all') {
      filtered = filtered.filter(log => log.type === logType);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(query) ||
        log.user?.toLowerCase().includes(query) ||
        log.businessId?.toLowerCase().includes(query) ||
        log.action?.toLowerCase().includes(query)
      );
    }
    
    setFilteredLogs(filtered);
  };
  
  const renderLogItem = ({ item }) => {
    // Format timestamp to local date/time
    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleString();
    
    // Determine icon based on log type
    let icon = 'information-outline';
    let color = '#005792';
    
    if (item.type === 'user') {
      icon = 'account-outline';
      color = '#4CAF50';
    } else if (item.type === 'business') {
      icon = 'store-outline';
      color = '#FF9800';
    } else if (item.type === 'error') {
      icon = 'alert-circle-outline';
      color = '#F44336';
    } else if (item.type === 'security') {
      icon = 'shield-outline';
      color = '#9C27B0';
    }
    
    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={500} 
        style={styles.logItem}
      >
        <View style={styles.logIconContainer}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        
        <View style={styles.logContent}>
          <View style={styles.logHeader}>
            <Text style={styles.logType}>{item.type.toUpperCase()}</Text>
            <Text style={styles.logTime}>{formattedDate}</Text>
          </View>
          
          <Text style={styles.logMessage}>{item.message}</Text>
          
          {item.user && (
            <Text style={styles.logDetail}>
              <Text style={styles.logDetailLabel}>{t('owner')}: </Text>
              {item.user}
            </Text>
          )}
          
          {item.businessId && (
            <Text style={styles.logDetail}>
              <Text style={styles.logDetailLabel}>{t('businessName')}: </Text>
              {item.businessId}
            </Text>
          )}
          
          {item.action && (
            <Text style={styles.logDetail}>
              <Text style={styles.logDetailLabel}>{t('actionsCompleted')}: </Text>
              {item.action}
            </Text>
          )}
        </View>
      </Animatable.View>
    );
  };
  
  const renderFilterButton = (filterType, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        logType === filterType && styles.activeFilterButton
      ]}
      onPress={() => setLogType(filterType)}
    >
      <Text 
        style={[
          styles.filterButtonText,
          logType === filterType && styles.activeFilterButtonText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>{t('systemLogs')}</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchLogs}
        >
          <MaterialCommunityIcons name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animatable.View>
      
      {/* Content */}
      <Animatable.View ref={contentAnimation} style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <MaterialCommunityIcons name="close-circle" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {renderFilterButton('all', t('allCategories'))}
          {renderFilterButton('user', t('userManagement'))}
          {renderFilterButton('business', t('businessManagement'))}
          {renderFilterButton('system', t('systemSettings'))}
          {renderFilterButton('error', t('error'))}
        </View>
        
        {/* Logs List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005792" />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : filteredLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="text-box-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No logs found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredLogs}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.logsList}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterButton: {
    backgroundColor: '#FFF',
  },
  filterButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  activeFilterButtonText: {
    color: '#005792',
    fontWeight: 'bold',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    color: '#FFF',
    fontSize: 16,
  },
  logsList: {
    paddingBottom: 16,
  },
  logItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logIconContainer: {
    marginRight: 12,
    alignItems: 'center',
    paddingTop: 2,
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#005792',
  },
  logTime: {
    fontSize: 12,
    color: '#999',
  },
  logMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  logDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logDetailLabel: {
    fontWeight: 'bold',
  },
});

export default SystemLogsScreen;
