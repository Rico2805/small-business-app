import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
  Dimensions,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { sendReport, getReportHistory } from '../services/reportService';

const { width, height } = Dimensions.get('window');

const REPORT_TYPES = [
  { id: 'bug', label: 'Bug Report', icon: 'bug' },
  { id: 'feature', label: 'Feature Request', icon: 'lightbulb-on' },
  { id: 'feedback', label: 'General Feedback', icon: 'message-text' },
  { id: 'support', label: 'Support Request', icon: 'lifebuoy' },
];

const ReportScreen = ({ navigation }) => {
  const [reportType, setReportType] = useState('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousReports, setPreviousReports] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const { user } = useAuth();
  
  const scrollViewRef = useRef(null);
  const headerAnimation = useRef(null);
  const formAnimation = useRef(null);
  const historyAnimation = useRef(null);
  
  useEffect(() => {
    // Run animations
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (formAnimation.current) formAnimation.current.fadeIn(800);
    }, 600);
    
    setTimeout(() => {
      if (historyAnimation.current) historyAnimation.current.fadeIn(800);
    }, 900);
    
    // Fetch previous reports
    if (user) {
      fetchReportHistory();
    } else {
      setIsLoadingHistory(false);
    }
  }, [user]);
  
  const fetchReportHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const reports = await getReportHistory(user.uid);
      setPreviousReports(reports);
    } catch (error) {
      console.error('Error fetching report history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  const handleSubmitReport = async () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your report');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }
    
    if (description.trim().length < 10) {
      Alert.alert('Error', 'Description is too short. Please provide more details');
      return;
    }
    
    try {
      setIsSubmitting(true);
      Keyboard.dismiss();
      
      await sendReport({
        userId: user ? user.uid : 'anonymous',
        userName: user ? user.displayName || user.email : 'Anonymous User',
        type: reportType,
        title: title.trim(),
        description: description.trim(),
        screenshotUrl: screenshot,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        }
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setScreenshot(null);
      
      // Show success message
      Alert.alert(
        'Report Submitted',
        'Thank you for your feedback! The developer will review your report soon.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Refresh report history
              if (user) fetchReportHistory();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddScreenshot = () => {
    // In a real app, this would use expo-image-picker
    Alert.alert('Feature', 'Screenshot attachment not implemented in this demo');
  };
  
  const renderReportTypeItem = (item) => {
    const isSelected = reportType === item.id;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.reportTypeItem,
          isSelected && styles.selectedReportTypeItem
        ]}
        onPress={() => setReportType(item.id)}
      >
        <MaterialCommunityIcons 
          name={item.icon} 
          size={24} 
          color={isSelected ? '#FFF' : '#A0A0A0'} 
        />
        <Text style={[
          styles.reportTypeLabel,
          isSelected && styles.selectedReportTypeLabel
        ]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFC107';
      case 'in_progress': return '#2196F3';
      case 'resolved': return '#4CAF50';
      case 'closed': return '#9E9E9E';
      default: return '#FFC107';
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
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
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animatable.View 
          ref={headerAnimation}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Report & Feedback</Text>
          <Text style={styles.headerSubtitle}>
            Help us improve by reporting issues or suggesting features
          </Text>
        </Animatable.View>
        
        <Animatable.View 
          ref={formAnimation}
          style={styles.formContainer}
        >
          <Text style={styles.sectionTitle}>Submit a Report</Text>
          
          <View style={styles.reportTypesContainer}>
            {REPORT_TYPES.map(renderReportTypeItem)}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Brief summary of your report"
              placeholderTextColor="#A0A0A0"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Please provide detailed information about your issue or suggestion"
              placeholderTextColor="#A0A0A0"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleAddScreenshot}
          >
            <MaterialCommunityIcons name="image-plus" size={24} color="#FFF" />
            <Text style={styles.attachButtonText}>Attach Screenshot</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!title.trim() || !description.trim() || isSubmitting) && styles.disabledButton
            ]}
            disabled={!title.trim() || !description.trim() || isSubmitting}
            onPress={handleSubmitReport}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={20} color="#FFF" />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
        </Animatable.View>
        
        <Animatable.View 
          ref={historyAnimation}
          style={styles.historyContainer}
        >
          <Text style={styles.sectionTitle}>Your Previous Reports</Text>
          
          {!user && (
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>
                Please log in to view your report history
              </Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {user && isLoadingHistory && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.loadingText}>Loading your reports...</Text>
            </View>
          )}
          
          {user && !isLoadingHistory && previousReports.length === 0 && (
            <View style={styles.emptyHistoryContainer}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#A0A0A0" />
              <Text style={styles.emptyHistoryText}>
                You haven't submitted any reports yet
              </Text>
            </View>
          )}
          
          {user && !isLoadingHistory && previousReports.length > 0 && (
            <View style={styles.reportsHistoryList}>
              {previousReports.map(report => (
                <View key={report.id} style={styles.reportHistoryItem}>
                  <View style={styles.reportHistoryHeader}>
                    <View style={styles.reportTypeIndicator}>
                      <MaterialCommunityIcons
                        name={REPORT_TYPES.find(t => t.id === report.type)?.icon || 'message-text'}
                        size={16}
                        color="#FFF"
                      />
                    </View>
                    
                    <Text style={styles.reportHistoryTitle} numberOfLines={1}>
                      {report.title}
                    </Text>
                    
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(report.status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {report.status === 'in_progress' ? 'In Progress' : 
                          report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.reportHistoryDate}>
                    Submitted: {formatDate(report.createdAt)}
                  </Text>
                  
                  {report.developerResponse && (
                    <View style={styles.responseContainer}>
                      <Text style={styles.responseLabel}>Response from Developer:</Text>
                      <Text style={styles.responseText}>{report.developerResponse}</Text>
                      <Text style={styles.responseDate}>
                        {formatDate(report.respondedAt)}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </Animatable.View>
        
        <View style={styles.supportInfo}>
          <Text style={styles.supportInfoTitle}>Need urgent support?</Text>
          <Text style={styles.supportInfoText}>
            Contact us directly at support@mycameroonapp.com
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    width: 100,
    height: 100,
    top: -30,
    right: -30,
  },
  bubble2: {
    width: 150,
    height: 150,
    bottom: -50,
    left: -50,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    margin: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  reportTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  reportTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedReportTypeItem: {
    backgroundColor: '#005792',
  },
  reportTypeLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    marginLeft: 8,
  },
  selectedReportTypeLabel: {
    color: '#FFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    minHeight: 120,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  attachButtonText: {
    color: '#FFF',
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00BBE4',
    borderRadius: 8,
    padding: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  historyContainer: {
    margin: 20,
    marginTop: 0,
  },
  loginPrompt: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  loginPromptText: {
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#005792',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  loginButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 8,
  },
  emptyHistoryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyHistoryText: {
    color: '#A0A0A0',
    marginTop: 16,
    textAlign: 'center',
  },
  reportsHistoryList: {
    marginTop: 8,
  },
  reportHistoryItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reportHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTypeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 87, 146, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  reportHistoryTitle: {
    flex: 1,
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusIndicator: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportHistoryDate: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 12,
  },
  responseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  responseLabel: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  responseText: {
    color: '#E0E0E0',
    marginBottom: 8,
  },
  responseDate: {
    color: '#A0A0A0',
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  supportInfo: {
    margin: 20,
    marginTop: 0,
    backgroundColor: 'rgba(0, 87, 146, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  supportInfoTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  supportInfoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default ReportScreen;
