import 'react-native-gesture-handler'; // Must be first import
import * as React from 'react';
import { View, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';

// Ignore specific logs for development
LogBox.ignoreLogs([
  'Warning: ...',
  'Non-serializable values were found in the navigation state',
  'Unsupported top level event type "topInsetsChange" dispatched',
  '[react-native-gesture-handler]',
  'setLayoutAnimationEnabledExperimental is not available',
  'react-native-gesture-handler module was not found'
]);

// Main App component
export default function App() {
  React.useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <OnboardingNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
