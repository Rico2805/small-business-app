import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Alert,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getUsers, getBusinesses, approveBusinessAccount, banUser, getSystemSettings, updateSystemSettings } from '../services/developerService';
import { getReports, updateReportStatus, addReportResponse, resolveReport } from '../services/reportService';

const { width } = Dimensions.get('window');

const DeveloperScreen = () => {
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [systemSettings, setSystemSettings] = useState({
    allowNewRegistrations: true,
    maintenanceMode: false,
    allowPayments: true,
    defaultLanguage: 'en'
  });
  const [loading, setLoading] = useState(true);

  const headerAnimation = React.createRef();
  const tabAnimation = React.createRef();
  const contentAnimation = React.createRef();

  useEffect(() => {
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (tabAnimation.current) tabAnimation.current.fadeInUp(800);
    }, 600);

    setTimeout(() => {
      if (contentAnimation.current) contentAnimation.current.fadeInUp(800);
    }, 1000);

    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, businessesData, settings, reportsData] = await Promise.all([
        getUsers(),
        getBusinesses(),
        getSystemSettings(),
        getReports()
      ]);
      setUsers(usersData);
      setBusinesses(businessesData);
      setSystemSettings(settings);
      setReports(reportsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBusinessAccount = async (businessId) => {
    try {
      await approveBusinessAccount(businessId);
      Alert.alert('Success', 'Business account approved');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve business account');
    }
  };

  const handleBanUser = (userId) => {
    Alert.alert(
      'Confirm Ban',
      'Are you sure you want to ban this user?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Ban',
          onPress: async () => {
            try {
              await banUser(userId);
              Alert.alert('Success', 'User banned successfully');
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Failed to ban user');
            }
          },
        },
      ]
    );
  };

  const handleUpdateSystemSetting = async (key, value) => {
    try {
      const updatedSettings = { ...systemSettings, [key]: value };
      await updateSystemSettings(updatedSettings);
      setSystemSettings(updatedSettings);
      Alert.alert('Success', 'System setting updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update system setting');
    }
  };

  const handleRespondToReport = (reportId) => {
    Alert.prompt(
      'Respond to Report',
      'Enter your response to the user',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send',
          onPress: async (responseText) => {
            if (responseText && responseText.trim()) {
              try {
                await addReportResponse(reportId, responseText, 'Developer Admin');
                Alert.alert('Success', 'Response sent successfully');
                fetchData();
              } catch (error) {
                Alert.alert('Error', 'Failed to send response');
              }
            } else {
              Alert.alert('Error', 'Response cannot be empty');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleResolveReport = (reportId) => {
    Alert.alert(
      'Resolve Report',
      'Are you sure you want to mark this report as resolved?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Resolve',
          onPress: async () => {
            try {
              await resolveReport(reportId);
              Alert.alert('Success', 'Report marked as resolved');
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Failed to resolve report');
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.item}
      activeOpacity={0.8}
    >
      <View style={styles.itemContent}>
        <View style={styles.userInfo}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{item.email}</Text>
          <Text style={styles.itemText}>Type: {item.type}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]}
          onPress={() => handleBanUser(item.id)}
        >
          <MaterialCommunityIcons name="ban" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Ban User</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderBusinessItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.item}
      activeOpacity={0.8}
    >
      <View style={styles.itemContent}>
        <View style={styles.businessInfo}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{item.description}</Text>
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons 
              name={item.isApproved ? 'check-circle' : 'clock'} 
              size={20} 
              color={item.isApproved ? '#28a745' : '#ffc107'}
            />
            <Text style={[styles.itemText, { color: item.isApproved ? '#28a745' : '#ffc107' }]}>
              {item.isApproved ? 'Approved' : 'Pending'}
            </Text>
          </View>
        </View>
        {!item.isApproved && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.successButton]}
            onPress={() => handleApproveBusinessAccount(item.id)}
          >
            <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderReportItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.item}
      activeOpacity={0.8}
    >
      <View style={styles.itemContent}>
        <View style={styles.reportInfo}>
          <Text style={styles.itemTitle}>{item.subject || 'Untitled Report'}</Text>
          <Text style={styles.itemSubtitle}>
            {item.user ? `From: ${item.user.name || item.user.email}` : 'Anonymous'}
          </Text>
          <Text style={styles.itemText} numberOfLines={2}>{item.message}</Text>
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons 
              name={getStatusIcon(item.status)} 
              size={20} 
              color={getStatusColor(item.status)}
            />
            <Text style={[styles.itemText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        <View style={styles.reportActions}>
          {item.status !== 'resolved' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.successButton]}
              onPress={() => handleResolveReport(item.id)}
            >
              <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Resolve</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => handleRespondToReport(item.id)}
          >
            <MaterialCommunityIcons name="reply" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Respond</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return 'clock-outline';
      case 'responded': return 'message-reply-outline';
      case 'resolved': return 'check-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ffc107';
      case 'responded': return '#17a2b8';
      case 'resolved': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pending';
      case 'responded': return 'Responded';
      case 'resolved': return 'Resolved';
      default: return 'Unknown';
    }
  };

  const renderSettingItem = ({ item }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingDescription}>{item.description}</Text>
      </View>
      <View style={styles.settingControls}>
        {item.type === 'toggle' ? (
          <TouchableOpacity 
            style={[styles.toggleButton, 
              systemSettings[item.key] ? styles.toggleOn : styles.toggleOff]}
            onPress={() => handleUpdateSystemSetting(item.key, !systemSettings[item.key])}
          >
            <Text style={styles.toggleText}>{systemSettings[item.key] ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.languageButtons}>
            {item.options.map((option) => (
              <TouchableOpacity 
                key={option.value}
                style={[styles.languageButton, 
                  systemSettings[item.key] === option.value && styles.languageButtonActive]}
                onPress={() => handleUpdateSystemSetting(item.key, option.value)}
              >
                <Text style={styles.languageButtonText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const settingsData = [
    {
      title: 'Allow New Registrations',
      description: 'Enable/disable new user registrations',
      key: 'allowNewRegistrations',
      type: 'toggle'
    },
    {
      title: 'Maintenance Mode',
      description: 'Enable maintenance mode for the app',
      key: 'maintenanceMode',
      type: 'toggle'
    },
    {
      title: 'Allow Payments',
      description: 'Enable/disable payment processing',
      key: 'allowPayments',
      type: 'toggle'
    },
    {
      title: 'Default Language',
      description: 'Set default app language',
      key: 'defaultLanguage',
      type: 'select',
      options: [
        { label: 'English', value: 'en' },
        { label: 'French', value: 'fr' }
      ]
    }
  ];

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
      </View>

      <View style={styles.mainContainer}>
        {/* Header Section */}
        <Animatable.View 
          ref={headerAnimation}
          style={styles.headerContainer}
        >
          <Text style={styles.title}>Developer Dashboard</Text>
          <Text style={styles.subtitle}>System Management & Control</Text>
        </Animatable.View>

        {/* Tab Navigation */}
        <Animatable.View 
          ref={tabAnimation}
          style={styles.tabContainer}
        >
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'users' && styles.tabButtonActive]}
            onPress={() => setActiveTab('users')}
          >
            <MaterialCommunityIcons 
              name="account-group" 
              size={18}
              color={activeTab === 'users' ? '#fff' : '#A0A0A0'} 
            />
            <Text style={[styles.tabButtonText, activeTab === 'users' && styles.tabButtonTextActive]}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'businesses' && styles.tabButtonActive]}
            onPress={() => setActiveTab('businesses')}
          >
            <MaterialCommunityIcons 
              name="store" 
              size={18} 
              color={activeTab === 'businesses' ? '#fff' : '#A0A0A0'} 
            />
            <Text style={[styles.tabButtonText, activeTab === 'businesses' && styles.tabButtonTextActive]}>Business</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'reports' && styles.tabButtonActive]}
            onPress={() => setActiveTab('reports')}
          >
            <MaterialCommunityIcons 
              name="flag" 
              size={18} 
              color={activeTab === 'reports' ? '#fff' : '#A0A0A0'} 
            />
            <Text style={[styles.tabButtonText, activeTab === 'reports' && styles.tabButtonTextActive]}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'settings' && styles.tabButtonActive]}
            onPress={() => setActiveTab('settings')}
          >
            <MaterialCommunityIcons 
              name="cog" 
              size={18} 
              color={activeTab === 'settings' ? '#fff' : '#A0A0A0'} 
            />
            <Text style={[styles.tabButtonText, activeTab === 'settings' && styles.tabButtonTextActive]}>Settings</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        ) : (
          <Animatable.View 
            ref={contentAnimation}
            style={styles.contentContainer}
          >
            {activeTab === 'users' && (
              <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={renderUserItem}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="account-off" size={48} color="#A0A0A0" />
                    <Text style={styles.emptyStateText}>No users found</Text>
                  </View>
                )}
              />
            )}
            
            {activeTab === 'businesses' && (
              <FlatList
                data={businesses}
                keyExtractor={(item) => item.id}
                renderItem={renderBusinessItem}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="store-off" size={48} color="#A0A0A0" />
                    <Text style={styles.emptyStateText}>No businesses found</Text>
                  </View>
                )}
              />
            )}

            {activeTab === 'reports' && (
              <FlatList
                data={reports}
                keyExtractor={(item) => item.id}
                renderItem={renderReportItem}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="clipboard-alert-outline" size={48} color="#A0A0A0" />
                    <Text style={styles.emptyStateText}>No reports found</Text>
                  </View>
                )}
              />
            )}
            
            {activeTab === 'settings' && (
              <FlatList
                data={settingsData}
                keyExtractor={(item) => item.key}
                renderItem={renderSettingItem}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="cog-off" size={48} color="#A0A0A0" />
                    <Text style={styles.emptyStateText}>No settings available</Text>
                  </View>
                )}
              />
            )}
          </Animatable.View>
        )}
      </View>
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
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  tabButtonActive: {
    backgroundColor: '#005792',
  },
  tabButtonText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
  },
  tabButtonTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 40,
  },
  item: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  businessInfo: {
    flex: 1,
  },
  reportInfo: {
    flex: 1,
  },
  reportActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#005792',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#FFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 14,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  settingControls: {
    alignItems: 'flex-end',
  },
  toggleButton: {
    width: 60,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: '#28a745',
  },
  toggleOff: {
    backgroundColor: '#dc3545',
  },
  toggleText: {
    color: '#FFF',
    fontSize: 14,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageButtonActive: {
    backgroundColor: '#005792',
  },
  languageButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: '#A0A0A0',
    fontSize: 16,
    marginTop: 16,
  },
});

export default DeveloperScreen;
