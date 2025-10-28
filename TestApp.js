import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Simple test app to confirm Expo functionality
const TestApp = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test App Running!</Text>
      <Text style={styles.subtext}>If you can see this, Expo is working correctly</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    fontWeight: 'bold',
  },
  subtext: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default TestApp; 