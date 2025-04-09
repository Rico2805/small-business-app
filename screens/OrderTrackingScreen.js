import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Animated,
  Easing,
  Image,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const OrderTrackingScreen = ({ navigation, route }) => {
  const [order, setOrder] = useState({
    status: 'Preparing',
    statusHistory: [
      { time: '14:30', status: 'Order Placed' },
      { time: '14:35', status: 'Preparing' },
    ],
    deliveryLocation: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
    businessLocation: {
      latitude: 37.78538,
      longitude: -122.4056,
    },
    eta: '20-30 minutes',
    driver: {
      name: 'John Doe',
      phone: '+1 555-0123',
      photo: 'https://via.placeholder.com/200x200/005792/FFFFFF?text=Driver',
      rating: 4.8,
      reviews: 123,
    },
  });
  
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.786815,
    longitude: -122.4190,
    latitudeDelta: 0.0222,
    longitudeDelta: 0.0121,
  });

  const [statusProgress, setStatusProgress] = useState(new Animated.Value(0));
  const [showDetails, setShowDetails] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const headerAnimation = React.createRef();
  const trackingAnimation = React.createRef();

  useEffect(() => {
    // Run entrance animations when component mounts
    setTimeout(() => {
      if (headerAnimation.current) headerAnimation.current.slideInDown(800);
    }, 300);
    
    setTimeout(() => {
      if (trackingAnimation.current) trackingAnimation.current.fadeInUp(800);
    }, 600);

    // Simulate order status updates
    const interval = setInterval(() => {
      const currentStatus = order.status;
      const nextStatus = getNextStatus(currentStatus);
      
      if (nextStatus) {
        setStatusProgress(new Animated.Value(0));
        Animated.timing(statusProgress, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setOrder(prev => ({
            ...prev,
            status: nextStatus,
            statusHistory: [...prev.statusHistory, {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: nextStatus,
            }],
          }));
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getNextStatus = (currentStatus) => {
    const statusOrder = ['Preparing', 'Out for Delivery', 'On the Way', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;
  };

  const statusColors = {
    'Preparing': '#FFD700',
    'Out for Delivery': '#4CAF50',
    'On the Way': '#2196F3',
    'Delivered': '#666666',
  };

  const getIconForStatus = (status) => {
    const icons = {
      'Preparing': 'clock',
      'Out for Delivery': 'truck-delivery',
      'On the Way': 'car',
      'Delivered': 'package-variant-closed',
    };
    return icons[status] || 'clock';
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons 
              name="chevron-left" 
              size={24} 
              color="#FFF" 
            />
          </TouchableOpacity>
          
          <Text style={styles.title}>Order Tracking</Text>
        </Animatable.View>

        {/* Tracking Status Section */}
        <Animatable.View 
          ref={trackingAnimation}
          style={styles.statusContainer}
        >
          <View style={styles.statusHeader}>
            <Text style={styles.statusText}>{order.status}</Text>
            <Text style={styles.etaText}>{order.eta}</Text>
          </View>

          {/* Status Timeline */}
          <View style={styles.statusTimelineContainer}>
            <View style={styles.statusTimeline}>
              {Object.keys(statusColors).map((status, index) => {
                const isCurrent = status === order.status;
                const isCompleted = Object.keys(statusColors).indexOf(status) < Object.keys(statusColors).indexOf(order.status);
                
                return (
                  <View key={status} style={styles.statusItem}>
                    <View style={styles.statusCircleContainer}>
                      <Animated.View 
                        style={[
                          styles.statusCircle,
                          {
                            backgroundColor: isCurrent ? statusColors[status] : isCompleted ? statusColors[status] : '#FFF',
                            transform: [
                              {
                                scale: statusProgress.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.8, 1.2],
                                  extrapolate: 'clamp',
                                }),
                              },
                            ],
                          },
                        ]}
                      >
                        <MaterialCommunityIcons 
                          name={getIconForStatus(status)} 
                          size={24} 
                          color={isCurrent || isCompleted ? '#FFF' : '#A0A0A0'}
                        />
                      </Animated.View>
                    </View>
                    <Text style={[
                      styles.statusLabel,
                      isCurrent && styles.statusLabelCurrent,
                      isCompleted && styles.statusLabelCompleted,
                    ]}>
                      {status}
                    </Text>
                  </View>
                );
              })}
            </View>
            
            {/* Progress Line */}
            <View style={styles.progressLine}>
              {Object.keys(statusColors).map((status, index) => {
                const isCompleted = Object.keys(statusColors).indexOf(status) < Object.keys(statusColors).indexOf(order.status);
                return (
                  <View 
                    key={status}
                    style={[
                      styles.progressSegment,
                      isCompleted && styles.progressSegmentCompleted,
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* Map Toggle */}
          <TouchableOpacity 
            style={styles.mapToggle}
            onPress={() => setShowMap(!showMap)}
          >
            <MaterialCommunityIcons 
              name={showMap ? 'map-marker' : 'map-marker-off'} 
              size={24} 
              color="#FFF"
            />
            <Text style={styles.mapToggleText}>
              {showMap ? 'Hide Delivery Map' : 'Show Delivery Map'}
            </Text>
          </TouchableOpacity>

          {/* Map View */}
          {showMap && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={mapRegion}
                showsUserLocation
                followsUserLocation
              >
                {/* Business Location */}
                <Marker
                  coordinate={order.businessLocation}
                  title="Business Location"
                >
                  <MaterialCommunityIcons 
                    name="storefront" 
                    size={32} 
                    color="#FFD700"
                  />
                </Marker>

                {/* Delivery Location */}
                <Marker
                  coordinate={order.deliveryLocation}
                  title="Delivery Location"
                >
                  <MaterialCommunityIcons 
                    name="home" 
                    size={32} 
                    color="#4CAF50"
                  />
                </Marker>

                {/* Driver Location */}
                {order.status === 'On the Way' && (
                  <Marker
                    coordinate={{
                      latitude: (order.businessLocation.latitude + order.deliveryLocation.latitude) / 2,
                      longitude: (order.businessLocation.longitude + order.deliveryLocation.longitude) / 2,
                    }}
                    title="Driver Location"
                  >
                    <MaterialCommunityIcons 
                      name="car" 
                      size={32} 
                      color="#2196F3"
                    />
                  </Marker>
                )}

                {/* Route Line */}
                <Polyline
                  coordinates={[
                    order.businessLocation,
                    order.deliveryLocation,
                  ]}
                  strokeColor="#2196F3"
                  strokeWidth={3}
                />
              </MapView>
            </View>
          )}

          {/* Driver Information */}
          <TouchableOpacity 
            style={[styles.driverInfo, showDetails && styles.driverInfoExpanded]}
            onPress={() => setShowDetails(!showDetails)}
            activeOpacity={0.8}
          >
            <View style={styles.driverImageContainer}>
              <Image
                source={{ uri: order.driver.photo }}
                style={styles.driverImage}
              />
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons 
                  name="star" 
                  size={18} 
                  color="#FFD700"
                />
                <Text style={styles.ratingText}>{order.driver.rating}</Text>
              </View>
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{order.driver.name}</Text>
              <Text style={styles.driverPhone}>{order.driver.phone}</Text>
              <Text style={styles.driverReviews}>
                {order.driver.reviews} reviews
              </Text>
            </View>
            <MaterialCommunityIcons 
              name={showDetails ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="#FFF"
            />
          </TouchableOpacity>

          {/* Status History */}
          {showDetails && (
            <View style={styles.statusHistory}>
              <Text style={styles.historyTitle}>Status History</Text>
              {order.statusHistory.map((history, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyTimeContainer}>
                    <Text style={styles.historyTime}>{history.time}</Text>
                    <View style={styles.historyDot} />
                  </View>
                  <Text style={styles.historyStatus}>{history.status}</Text>
                </View>
              ))}
            </View>
          )}
        </Animatable.View>
      </ScrollView>
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
  scrollView: {
    flexGrow: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statusHeader: {
    marginBottom: 24,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  etaText: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  statusTimelineContainer: {
    marginBottom: 24,
  },
  statusTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    position: 'relative',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusCircleContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  statusCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 8,
  },
  statusLabelCurrent: {
    fontWeight: 'bold',
  },
  statusLabelCompleted: {
    color: '#4CAF50',
  },
  progressLine: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSegment: {
    flex: 1,
    height: 2,
    backgroundColor: '#A0A0A0',
  },
  progressSegmentCompleted: {
    backgroundColor: '#2196F3',
  },
  mapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapToggleText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 14,
  },
  mapContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    width: width - 32,
    height: 300,
  },
  driverInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  driverInfoExpanded: {
    minHeight: 200,
  },
  driverImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    marginRight: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  driverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  ratingContainer: {
    position: 'absolute',
    bottom: -12,
    right: -12,
    backgroundColor: '#2196F3',
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFF',
    fontSize: 12,
    marginLeft: 4,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  driverPhone: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 4,
  },
  driverReviews: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  statusHistory: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyTimeContainer: {
    width: 60,
    alignItems: 'center',
  },
  historyTime: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 4,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginBottom: 4,
  },
  historyStatus: {
    color: '#FFF',
    fontSize: 14,
    flex: 1,
  },
});

export default OrderTrackingScreen;
