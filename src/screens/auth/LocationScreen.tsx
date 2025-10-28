import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

type LocationScreenProps = {
  navigation: StackNavigationProp<any>;
};

const LocationScreen: React.FC<LocationScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [neighborhood, setNeighborhood] = useState('');
  const [mapRegion, setMapRegion] = useState({
    latitude: 19.0760, // Default to Mumbai
    longitude: 72.8777,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const { user } = useAuth();

  // Request location permission on component mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setIsLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationPermissionDenied(true);
        setIsLoading(false);
        return;
      }
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Update map region
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0121,
      });
      
      // Get neighborhood name
      const addressInfo = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (addressInfo.length > 0) {
        const address = addressInfo[0];
        const locationName = address.district || address.subregion || address.city || 'Unknown Area';
        setNeighborhood(locationName);
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error getting location:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to get your location. Please enter it manually.');
    }
  };

  const handleContinue = async () => {
    if (!neighborhood.trim()) {
      Alert.alert('Missing Information', 'Please enter your neighborhood');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Store location data to be used later when creating the user profile
      // We'll create the full profile after all onboarding steps are complete
      const locationData = {
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
        neighborhood,
      };
      
      // Store in temporary state or async storage (implementation depends on app context)
      // For now, we'll just navigate to the next screen
      // In a real app, we'd store this data
      
      setIsLoading(false);
      navigation.navigate('Quiz');
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Failed to save location');
    }
  };

  const handleManualLocationEntry = () => {
    Alert.prompt(
      'Enter Your Location',
      'Please enter your neighborhood, area, or ZIP code',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (input) => {
            if (input && input.trim()) {
              setNeighborhood(input.trim());
            }
          },
        },
      ],
      'plain-text',
      neighborhood
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Where are you located?</Text>
          <Text style={styles.subtitle}>
            We'll use your location to find events and connect you with people nearby.
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          ) : locationPermissionDenied ? (
            <View style={styles.permissionDeniedContainer}>
              <Ionicons name="warning-outline" size={64} color="#F44336" />
              <Text style={styles.permissionDeniedText}>
                Location permission denied. Please enter your location manually
                or enable location permissions to continue.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={requestLocationPermission}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  region={mapRegion}
                  onRegionChangeComplete={setMapRegion}
                >
                  <Marker
                    coordinate={{
                      latitude: mapRegion.latitude,
                      longitude: mapRegion.longitude,
                    }}
                  />
                </MapView>
              </View>

              <View style={styles.locationInfoContainer}>
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationLabel}>Your Neighborhood</Text>
                  <Text style={styles.locationText}>{neighborhood || 'Unknown Location'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleManualLocationEntry}
                >
                  <Ionicons name="create-outline" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              (isLoading || (!neighborhood && locationPermissionDenied)) && styles.buttonDisabled
            ]}
            onPress={handleContinue}
            disabled={isLoading || (!neighborhood && locationPermissionDenied)}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          {!locationPermissionDenied && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.navigate('Quiz')}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  locationInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  editButton: {
    padding: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7', // Lighter green
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    padding: 8,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
  },
  permissionDeniedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  permissionDeniedText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LocationScreen; 