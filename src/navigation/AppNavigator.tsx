import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WhatsAppScreen from '../screens/WhatsAppScreen';

// Types for navigation
export type RootStackParamList = {
  MainTabs: { screen?: string };
};

export type MainTabParamList = {
  Home: undefined;
  WhatsApp: undefined;
  Profile: undefined;
};

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Fallback Screen for debugging
const FallbackScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Loading Navigation...</Text>
    <Text style={{ color: '#666', textAlign: 'center', marginHorizontal: 20 }}>
      If you see this for a long time, there might be an issue with the navigation setup.
    </Text>
  </View>
);

// Tab Navigator
const MainTabNavigator = () => {
  useEffect(() => {
    console.log('MainTabNavigator mounted');
  }, []);

  try {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'WhatsApp') {
              iconName = 'logo-whatsapp';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#25D366',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen 
          name="WhatsApp" 
          component={WhatsAppScreen}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    );
  } catch (error) {
    console.log('Error rendering MainTabNavigator:', error);
    return <FallbackScreen />;
  }
};

// Root Navigator
const AppNavigator = () => {
  useEffect(() => {
    console.log('AppNavigator mounted');
    
    // Log component availability
    console.log('Component check:');
    console.log('- HomeScreen available:', typeof HomeScreen === 'function');
    console.log('- ProfileScreen available:', typeof ProfileScreen === 'function');
    console.log('- WhatsAppScreen available:', typeof WhatsAppScreen === 'function');
  }, []);

  try {
    return (
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      </Stack.Navigator>
    );
  } catch (error) {
    console.log('Error rendering AppNavigator:', error);
    return <FallbackScreen />;
  }
};

export default AppNavigator; 