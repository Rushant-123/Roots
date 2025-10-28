import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import all onboarding screens
import OnboardingWelcome from '../screens/onboarding/OnboardingWelcome';
import OnboardingFeatures from '../screens/onboarding/OnboardingFeatures';
import OnboardingPermissions from '../screens/onboarding/OnboardingPermissions';
import OnboardingWhatsApp from '../screens/onboarding/OnboardingWhatsApp';
import OnboardingCompanion from '../screens/onboarding/OnboardingCompanion';
import OnboardingLocation from '../screens/onboarding/OnboardingLocation';
import OnboardingComplete from '../screens/onboarding/OnboardingComplete';
import CompanionSelectionScreen from '../screens/onboarding/CompanionSelectionScreen';

// Define the param list for type safety
export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingFeatures: undefined;
  OnboardingPermissions: undefined;
  OnboardingWhatsApp: undefined;
  OnboardingCompanion: { ethnicity?: string } | undefined;
  OnboardingLocation: undefined;
  OnboardingComplete: undefined;
  CompanionSelectionScreen: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingWelcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Disable swipe navigation in onboarding
        cardStyle: { backgroundColor: '#4a3c39' },
      }}
    >
      <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcome} />
      <Stack.Screen name="OnboardingFeatures" component={OnboardingFeatures} />
      <Stack.Screen name="OnboardingPermissions" component={OnboardingPermissions} />
      <Stack.Screen name="OnboardingWhatsApp" component={OnboardingWhatsApp} />
      <Stack.Screen name="OnboardingCompanion" component={OnboardingCompanion} />
      <Stack.Screen name="OnboardingLocation" component={OnboardingLocation} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingComplete} />
      <Stack.Screen name="CompanionSelectionScreen" component={CompanionSelectionScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator; 