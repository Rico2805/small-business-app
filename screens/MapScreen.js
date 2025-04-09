import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { db as firestore } from '../config/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation, route }) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [userType, setUserType] = useState('customer'); // customer, business, or developer
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [showTrackingInfo, setShowTrackingInfo] = useState(false);
  const [userName, setUserName] = useState('');
  const [userBusinessName, setUserBusinessName] = useState('');

  const mapRef = useRef(null);
  const headerAnimation = useRef(null);
  const mapAnimation = useRef(null);
  const searchInputRef = useRef(null);

  // Get user role and name from Firestore
  useEffect(() => {
    const getUserInfo = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role || 'customer';
          setUserType(role);
          
          // Set user name based on role
          if (role === 'customer') {
            setUserName(userData.firstName + ' ' + userData.lastName || t('customer'));
          } else if (role === 'business') {
            // For business users, fetch their business name
            const businessQuery = query(collection(firestore, 'businesses'), 
              where('ownerId', '==', currentUser.uid));
            const businessDocs = await getDocs(businessQuery);
            
            if (!businessDocs.empty) {
              const businessData = businessDocs.docs[0].data();
              setUserBusinessName(businessData.businessName || t('business'));
            }
          }
        }
      }
    };
    getUserInfo();
  }, [currentUser, t]);

  // Get location and initialize map
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        // Fetch nearby businesses
        fetchNearbyBusinesses(location);
      } catch (error) {
        setErrorMsg('Could not fetch location: ' + error.message);
        setLoading(false);
      }
    })();
  }, []);

  // Animate components on mount
  useEffect(() => {
    if (headerAnimation.current) {
      headerAnimation.current.slideInDown(800);
    }
    if (mapAnimation.current) {
      mapAnimation.current.fadeIn(1000);
    }
  }, []);

  // Check if order tracking was passed from another screen
  useEffect(() => {
    if (route.params?.trackOrder) {
      setTrackingOrder(route.params.trackOrder);
      setShowTrackingInfo(true);
      
      if (route.params.trackOrder.deliveryLocation) {
        setDeliveryLocation({
          latitude: route.params.trackOrder.deliveryLocation.latitude,
          longitude: route.params.trackOrder.deliveryLocation.longitude,
        });
      }
    }
  }, [route.params]);

  const fetchNearbyBusinesses = async (userLocation) => {
    try {
      const businessesCollection = collection(firestore, 'businesses');
      const businessSnapshot = await getDocs(businessesCollection);
      
      let businessList = businessSnapshot.docs
        .map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          distance: calculateDistance(
            userLocation.coords.latitude, 
            userLocation.coords.longitude, 
            doc.data().location?.latitude || 0, 
            doc.data().location?.longitude || 0
          )
        }))
        .filter(business => business.approved);
      
      // Filter businesses based on user type
      if (userType === 'business') {
        // Business users can only see other businesses
        businessList = businessList.filter(business => {
          // Don't show the user's own business
          return business.ownerId !== currentUser?.uid;
        });
      } else if (userType === 'customer') {
        // Customers can see all businesses
        // No additional filtering needed
      }
      
      // Sort by distance
      businessList.sort((a, b) => a.distance - b.distance);
      
      setBusinesses(businessList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setErrorMsg(t('failedToFetchBusinesses'));
      setLoading(false);
    }
  };

  // Search for businesses
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }
    
    setLoading(true);
    try {
      const businessesCollection = collection(firestore, 'businesses');
      const businessSnapshot = await getDocs(businessesCollection);
      
      const searchResults = businessSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(business => 
          business.approved && 
          (business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           business.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      
      setBusinesses(searchResults);
      setLoading(false);
      
      if (searchResults.length === 0) {
        Alert.alert('No results', 'No businesses match your search criteria');
      }
    } catch (error) {
      console.error('Error searching businesses:', error);
      setErrorMsg('Failed to search businesses');
      setLoading(false);
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Center map on user location
  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  // Toggle order tracking info
  const toggleTrackingInfo = () => {
    setShowTrackingInfo(prev => !prev);
  };

  // Render user location marker
  const renderUserLocationMarker = () => {
    if (!location) return null;
    
    const displayName = userType === 'business' ? userBusinessName : userName;
    
    return (
      <Marker
        key="user-location"
        coordinate={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }}
      >
        <View style={styles.userMarkerContainer}>
          <Text style={styles.markerLabel}>{displayName}</Text>
          <View style={[styles.marker, styles.userMarker]}>
            <MaterialCommunityIcons 
              name={userType === 'business' ? "briefcase" : "account"} 
              size={24} 
              color="#FFF" 
            />
          </View>
        </View>
      </Marker>
    );
  };

  // Render markers for businesses
  const renderBusinessMarkers = () => {
    return businesses.map(business => (
      <Marker
        key={business.id}
        coordinate={{
          latitude: business.location?.latitude || 0,
          longitude: business.location?.longitude || 0,
        }}
        onPress={() => handleBusinessPress(business)}
      >
        <View style={styles.markerContainer}>
          <Text style={styles.markerLabel}>{business.businessName}</Text>
          <View style={styles.marker}>
            <MaterialCommunityIcons name="store" size={24} color="#FFF" />
          </View>
        </View>
      </Marker>
    ));
  };
  
  // Handle business marker press
  const handleBusinessPress = (business) => {
    setSelectedBusiness(business);
    // Navigate to business details page when marker is pressed
    navigation.navigate('BusinessDetails', { businessId: business.id });
  };

  // Render order tracking elements
  const renderTrackingElements = () => {
    if (!trackingOrder || !deliveryLocation || !location) return null;
    
    return (
      <>
        {/* Delivery location marker */}
        <Marker
          coordinate={deliveryLocation}
        >
          <View style={styles.deliveryMarkerContainer}>
            <View style={styles.deliveryMarker}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#FFF" />
            </View>
          </View>
        </Marker>
        
        {/* Route line */}
        <Polyline
          coordinates={[
            { 
              latitude: location.coords.latitude, 
              longitude: location.coords.longitude 
            },
            deliveryLocation
          ]}
          strokeWidth={4}
          strokeColor="#4CAF50"
          lineDashPattern={[1, 3]}
        />
      </>
    );
  };

  let content;
  
  if (loading) {
    content = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  } else if (errorMsg) {
    content = (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="map-marker-off" size={64} color="#FFF" />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.replace('MapScreen')}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    content = (
      <Animatable.View 
        ref={mapAnimation}
        style={styles.mapContainer}
        animation="fadeIn"
        duration={1000}
      >
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {renderUserLocationMarker()}
          {renderBusinessMarkers()}
          {renderTrackingElements()}
        </MapView>
        
        {/* Map controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={styles.mapControlButton}
            onPress={centerOnUser}
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#FFF" />
          </TouchableOpacity>
          
          {trackingOrder && (
            <TouchableOpacity 
              style={[styles.mapControlButton, styles.trackingButton]}
              onPress={toggleTrackingInfo}
            >
              <MaterialCommunityIcons name="truck-delivery" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Order tracking info */}
        {showTrackingInfo && trackingOrder && (
          <Animatable.View 
            animation="slideInUp"
            style={styles.trackingInfo}
          >
            <View style={styles.trackingHeader}>
              <MaterialCommunityIcons name="truck-delivery" size={24} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.trackingTitle}>{t('trackingOrder')}{trackingOrder.id}</Text>
            </View>
            <Text style={styles.trackingStatus}>
              {t('status')} {trackingOrder.status || t('processing')}
            </Text>
            <Text style={styles.trackingEstimate}>
              {t('estimatedDelivery')} {trackingOrder.estimatedDelivery || t('calculating')}
            </Text>
          </Animatable.View>
        )}
      </Animatable.View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#00214D', '#005792', '#00BBE4']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative bubbles */}
        <View style={styles.bubblesContainer}>
          <View style={[styles.bubble, styles.bubble1]} />
          <View style={[styles.bubble, styles.bubble2]} />
        </View>
        
        <Animatable.View 
          ref={headerAnimation}
          style={styles.header}
          animation="slideInDown"
          duration={800}
        >
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <MaterialCommunityIcons name="magnify" size={24} color="#A0A0A0" style={styles.searchIcon} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder={t('searchBusinesses')}
                placeholderTextColor="#A0A0A0"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <MaterialCommunityIcons name="magnify" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Animatable.View>
        
        {content}
      </LinearGradient>
    </View>
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#FFF',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#005792',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#FFF',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
  },
  userMarkerContainer: {
    alignItems: 'center',
  },
  markerLabel: {
    backgroundColor: 'rgba(0, 87, 146, 0.8)',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 5,
    overflow: 'hidden',
    textAlign: 'center',
  },
  marker: {
    backgroundColor: '#005792',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userMarker: {
    backgroundColor: '#00BBE4',
  },
  deliveryMarkerContainer: {
    alignItems: 'center',
  },
  deliveryMarker: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  calloutContainer: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  calloutButton: {
    backgroundColor: '#005792',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    flexDirection: 'column',
  },
  mapControlButton: {
    backgroundColor: 'rgba(0, 33, 77, 0.8)',
    borderRadius: 40,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  trackingButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  trackingInfo: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 33, 77, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  trackingStatus: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 4,
  },
  trackingEstimate: {
    color: '#FFF',
    fontSize: 14,
  }
});

export default MapScreen;
