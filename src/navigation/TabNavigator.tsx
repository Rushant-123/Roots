import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome5 } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WhatsAppScreen from '../screens/WhatsAppScreen';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const WhatsAppStack = createNativeStackNavigator();

// Home Stack
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      {/* Add other home-related screens here */}
    </HomeStack.Navigator>
  );
};

// Profile Stack
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      {/* Add other profile-related screens here */}
    </ProfileStack.Navigator>
  );
};

// WhatsApp Stack
const WhatsAppStackNavigator = () => {
  return (
    <WhatsAppStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <WhatsAppStack.Screen name="WhatsAppMain" component={WhatsAppScreen} />
      {/* Add other WhatsApp-related screens here */}
    </WhatsAppStack.Navigator>
  );
};

const TabNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'WhatsApp') {
            iconName = 'whatsapp';
          } else if (route.name === 'Profile') {
            iconName = 'user-circle';
          }

          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen 
        name="WhatsApp" 
        component={WhatsAppStackNavigator}
        options={{
          tabBarLabel: 'WhatsApp',
        }}
      />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

export default TabNavigator; 