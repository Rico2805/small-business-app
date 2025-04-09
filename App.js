import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import i18n from './i18n';
import 'expo-dev-client';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native';
import * as Network from 'expo-network';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import BusinessRegistrationScreen from './screens/BusinessRegistrationScreen';
import HomepageScreen from './screens/HomepageScreen';
import OrderPlacementScreen from './screens/OrderPlacementScreen';
import OrderTrackingScreen from './screens/OrderTrackingScreen';
import MessagingScreen from './screens/MessagingScreen';
import MapScreen from './screens/MapScreen';
import CustomerProfileScreen from './screens/CustomerProfileScreen';
import BusinessProfileScreen from './screens/BusinessProfileScreen';
import PaymentScreen from './screens/PaymentScreen';
import PaymentConfirmationScreen from './screens/PaymentConfirmationScreen';
import DeveloperScreen from './screens/DeveloperScreen';
import DeveloperProfileScreen from './screens/DeveloperProfileScreen';
import SystemLogsScreen from './screens/SystemLogsScreen';
import BackupRestoreScreen from './screens/BackupRestoreScreen';
import SystemSettingsScreen from './screens/SystemSettingsScreen';
import BusinessProductsScreen from './screens/BusinessProductsScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import BusinessOrdersScreen from './screens/BusinessOrdersScreen';
import BusinessDetailsScreen from './screens/BusinessDetailsScreen';
import ExploreScreen from './screens/ExploreScreen';
import ReportScreen from './screens/ReportScreen';
import BusinessReviewsScreen from './screens/BusinessReviewsScreen';
import NotificationScreen from './screens/NotificationScreen';
import NotificationIcon from './components/NotificationIcon';
import { AuthProvider } from './contexts/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>{i18n.t('welcome')}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

// Custom header with notification icon
const HeaderWithNotification = ({ title }) => {
  return (
    <View style={styles.headerContainer}>
      <NotificationIcon />
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholderRight} />
    </View>
  );
};

// Main customer tab navigator
function CustomerTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'HomepageStack') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ExploreStack') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'MyOrdersStack') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'MessagingStack') {
            iconName = focused ? 'message' : 'message-outline';
          } else if (route.name === 'MapStack') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'CustomerProfileStack') {
            iconName = focused ? 'account' : 'account-outline';
          }
          
          return <MaterialCommunityIcons name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: '#005792',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#ffffff', height: 55 },
        tabBarLabelStyle: { fontSize: 11 },
        headerShown: true,
        header: ({ navigation, route, options }) => {
          const routeName = route.name;
          let title = '';
          
          switch (routeName) {
            case 'HomepageStack':
              title = 'Home';
              break;
            case 'ExploreStack':
              title = t('explore');
              break;
            case 'MyOrdersStack':
              title = t('orders');
              break;
            case 'MessagingStack':
              title = t('messages');
              break;
            case 'MapStack':
              title = t('map');
              break;
            case 'CustomerProfileStack':
              title = t('profile');
              break;
            default:
              title = route.name;
          }
          
          return <HeaderWithNotification title={title} />;
        }
      })}
    >
      <Tab.Screen 
        name="HomepageStack" 
        component={HomepageStackScreen} 
        options={{ tabBarLabel: t('home') }}
      />
      <Tab.Screen 
        name="ExploreStack" 
        component={ExploreStackScreen} 
        options={{ tabBarLabel: t('explore') }}
      />
      <Tab.Screen 
        name="MyOrdersStack" 
        component={MyOrdersStackScreen} 
        options={{ tabBarLabel: t('orders') }}
      />
      <Tab.Screen 
        name="MessagingStack" 
        component={MessagingStackScreen} 
        options={{ tabBarLabel: t('messages') }}
      />
      <Tab.Screen 
        name="MapStack" 
        component={MapStackScreen} 
        options={{ tabBarLabel: t('map') }}
      />
      <Tab.Screen 
        name="CustomerProfileStack" 
        component={CustomerProfileStackScreen} 
        options={{ tabBarLabel: t('profile') }}
      />
    </Tab.Navigator>
  );
}

// Business owner tab navigator
function BusinessTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'BusinessProductsStack') {
            iconName = focused ? 'store' : 'store-outline';
          } else if (route.name === 'OrderManageStack') {
            iconName = focused ? 'clipboard-list' : 'clipboard-list-outline';
          } else if (route.name === 'BusinessMessagingStack') {
            iconName = focused ? 'message' : 'message-outline';
          } else if (route.name === 'BusinessMapStack') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'BusinessProfileStack') {
            iconName = focused ? 'account' : 'account-outline';
          }
          
          return <MaterialCommunityIcons name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: '#005792',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#ffffff', height: 55 },
        tabBarLabelStyle: { fontSize: 11 },
        headerShown: true,
        header: ({ navigation, route, options }) => {
          const routeName = route.name;
          let title = '';
          
          switch (routeName) {
            case 'BusinessProductsStack':
              title = t('products');
              break;
            case 'OrderManageStack':
              title = t('orders');
              break;
            case 'BusinessMessagingStack':
              title = t('messages');
              break;
            case 'BusinessMapStack':
              title = t('map');
              break;
            case 'BusinessProfileStack':
              title = t('businessProfile');
              break;
            default:
              title = route.name;
          }
          
          return <HeaderWithNotification title={title} />;
        }
      })}
    >
      <Tab.Screen 
        name="BusinessProductsStack" 
        component={BusinessProductsStackScreen} 
        options={{ tabBarLabel: t('products') }}
      />
      <Tab.Screen 
        name="OrderManageStack" 
        component={OrderManagementStackScreen} 
        options={{ tabBarLabel: t('orders') }}
      />
      <Tab.Screen 
        name="BusinessMessagingStack" 
        component={MessagingStackScreen} 
        options={{ tabBarLabel: t('messages') }}
      />
      <Tab.Screen 
        name="BusinessMapStack" 
        component={MapStackScreen} 
        options={{ tabBarLabel: t('map') }}
      />
      <Tab.Screen 
        name="BusinessProfileStack" 
        component={BusinessProfileStackScreen} 
        options={{ tabBarLabel: t('profile') }}
      />
    </Tab.Navigator>
  );
}

// Developer tab navigator
function DeveloperTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'DeveloperStack') {
            iconName = focused ? 'tools' : 'tools';
          } else if (route.name === 'ProfileStack') {
            iconName = focused ? 'account' : 'account-outline';
          }
          
          return <MaterialCommunityIcons name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: '#005792',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#ffffff', height: 55 },
        tabBarLabelStyle: { fontSize: 11 },
        headerShown: true,
        header: ({ navigation, route, options }) => {
          const routeName = route.name;
          let title = '';
          
          switch (routeName) {
            case 'DeveloperStack':
              title = t('adminDashboard');
              break;
            case 'ProfileStack':
              title = t('developerProfile');
              break;
            default:
              title = route.name;
          }
          
          return <HeaderWithNotification title={title} />;
        }
      })}
    >
      <Tab.Screen 
        name="DeveloperStack" 
        component={DeveloperStackScreen} 
        options={{ tabBarLabel: t('adminDashboard') }}
      />
      <Tab.Screen 
        name="ProfileStack" 
        component={DeveloperProfileStackScreen} 
        options={{ tabBarLabel: t('profile') }}
      />
    </Tab.Navigator>
  );
}

// Define the stack navigators for each section
function HomepageStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Homepage" component={HomepageScreen} />
      <Stack.Screen name="BusinessDetails" component={BusinessDetailsScreen} />
      <Stack.Screen name="BusinessReviews" component={BusinessReviewsScreen} />
      <Stack.Screen name="OrderPlacement" component={OrderPlacementScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
    </Stack.Navigator>
  );
}

function MyOrdersStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
}

function ExploreStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="BusinessDetails" component={BusinessDetailsScreen} />
      <Stack.Screen name="BusinessReviews" component={BusinessReviewsScreen} />
    </Stack.Navigator>
  );
}

function MessagingStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Messaging" component={MessagingScreen} />
    </Stack.Navigator>
  );
}

function MapStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Map" component={MapScreen} />
    </Stack.Navigator>
  );
}

function CustomerProfileStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerProfile" component={CustomerProfileScreen} />
      <Stack.Screen name="Report" component={ReportScreen} />
    </Stack.Navigator>
  );
}

function BusinessProductsStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BusinessProducts" component={BusinessProductsScreen} />
    </Stack.Navigator>
  );
}

function OrderManagementStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BusinessOrders" component={BusinessOrdersScreen} />
    </Stack.Navigator>
  );
}

function BusinessProfileStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
      <Stack.Screen name="BusinessReviews" component={BusinessReviewsScreen} />
      <Stack.Screen name="Report" component={ReportScreen} />
    </Stack.Navigator>
  );
}

function DeveloperStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Developer" component={DeveloperScreen} />
    </Stack.Navigator>
  );
}

function DeveloperProfileStackScreen() {
  return (
    <Stack.Navigator 
      initialRouteName="DeveloperProfile"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="DeveloperProfile" component={DeveloperProfileScreen} />
      <Stack.Screen name="SystemLogs" component={SystemLogsScreen} />
      <Stack.Screen name="BackupRestore" component={BackupRestoreScreen} />
      <Stack.Screen name="SystemSettings" component={SystemSettingsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isConnected, setIsConnected] = useState(true);
  
  useEffect(() => {
    // Check network connection on startup
    const checkConnection = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setIsConnected(networkState.isConnected && networkState.isInternetReachable);
        
        if (!networkState.isConnected || !networkState.isInternetReachable) {
          Alert.alert(
            "Network Error",
            "You appear to be offline. Firebase services require an internet connection.",
            [{ text: "OK" }]
          );
        }
      } catch (error) {
        console.error("Network detection error:", error);
      }
    };
    
    checkConnection();
  }, []);

  return (
    <AuthProvider>
      <I18nextProvider i18n={i18n}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="BusinessRegistration" component={BusinessRegistrationScreen} />
            <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
            <Stack.Screen name="BusinessTabs" component={BusinessTabs} />
            <Stack.Screen name="DeveloperTabs" component={DeveloperTabs} />
            <Stack.Screen name="Messaging" component={MessagingScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </I18nextProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00214D',
    height: 60,
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  placeholderRight: {
    width: 40,
  },
});
