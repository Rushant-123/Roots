import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import * as Location from 'expo-location';

type OnboardingLocationProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'OnboardingLocation'>;
};

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied';

const OnboardingLocation: React.FC<OnboardingLocationProps> = ({ navigation }) => {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationErrorMessage, setLocationErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if location permissions are already granted
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationStatus('granted');
      }
    })();
  }, []);

  const requestLocationPermission = async () => {
    setLocationStatus('requesting');
    setLocationErrorMessage(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setLocationStatus('granted');
        
        // Get location
        const location = await Location.getCurrentPositionAsync({});
        console.log("Location: ", location);
        
        // In a real app, you would store this location info
        // in user context/profile here
      } else {
        setLocationStatus('denied');
        setLocationErrorMessage('Permission to access location was denied');
      }
    } catch (error) {
      setLocationStatus('denied');
      setLocationErrorMessage('Error requesting location permission');
      console.error(error);
    }
  };

  const handleSkip = () => {
    // Navigate to the next screen or home screen
    navigation.navigate('OnboardingComplete');
  };

  const handleContinue = () => {
    // Navigate to the next screen
    navigation.navigate('OnboardingComplete');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a3c39" />
      
      <Image
        source={require('../../../assets/images/location-illustration.png')} 
        style={styles.backgroundImage}
      />
      
      <View style={styles.overlay}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animatable.View 
            animation="fadeInDown" 
            duration={800} 
            style={styles.header}
          >
            <Text style={styles.title}>Location Access</Text>
            <Text style={styles.subtitle}>
              Share your location to get personalized insights and recommendations relevant to your area
            </Text>
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeIn" 
            duration={1000} 
            delay={500}
            style={styles.benefitsContainer}
          >
            <Text style={styles.benefitsSectionTitle}>How we use your location</Text>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconContainer}>
                <Ionicons name="compass" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Local recommendations</Text>
                <Text style={styles.benefitDescription}>
                  Get personalized recommendations for wellness activities in your area
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconContainer}>
                <Ionicons name="stats-chart" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Regional insights</Text>
                <Text style={styles.benefitDescription}>
                  Receive wellness tips and advice relevant to your local environment
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconContainer}>
                <Ionicons name="calendar" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Seasonal wellness</Text>
                <Text style={styles.benefitDescription}>
                  Get support for seasonal challenges specific to your location
                </Text>
              </View>
            </View>
          </Animatable.View>
          
          {locationErrorMessage && (
            <Animatable.View 
              animation="fadeIn" 
              duration={500} 
              style={styles.errorContainer}
            >
              <Ionicons name="alert-circle" size={20} color="#ffb74d" />
              <Text style={styles.errorText}>{locationErrorMessage}</Text>
            </Animatable.View>
          )}
        </ScrollView>
        
        <Animatable.View 
          animation="fadeInUp" 
          duration={800}
          delay={300}
          style={styles.footer}
        >
          {locationStatus === 'granted' ? (
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            </TouchableOpacity>
          ) : locationStatus === 'requesting' ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingButtonText}>Requesting Access</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.allowButton}
                onPress={requestLocationPermission}
              >
                <Ionicons name="location" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.allowButtonText}>Allow Location Access</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={handleSkip}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </>
          )}
        </Animatable.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4a3c39',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  illustration: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  benefitsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  benefitsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  benefitIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff6b3d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 115, 115, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 115, 115, 0.3)',
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  allowButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6b3d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  allowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6b3d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 107, 61, 0.5)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loadingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default OnboardingLocation; 