import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as PodService from '../services/location/podService';
import { usingDummyValues } from '../services/firebase/config';

interface LocationData {
  latitude: number;
  longitude: number;
  neighborhood: string;
}

interface LocationContextType {
  location: LocationData | null;
  podId: string | null;
  isLoading: boolean;
  updateLocation: () => Promise<void>;
  error: string | null;
  neighborhood: string | null;
}

// Create context with default values
const LocationContext = createContext<LocationContextType>({
  location: null,
  podId: null,
  isLoading: true,
  updateLocation: async () => {},
  error: null,
  neighborhood: null,
});

// Hook to use the location context
export const useLocation = () => useContext(LocationContext);

interface LocationProviderProps {
  children: ReactNode;
}

// Provider component
export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  console.log("[LocationProvider] Initializing, demo mode:", usingDummyValues);
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [podId, setPodId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set up mock location for demo mode
  useEffect(() => {
    if (usingDummyValues) {
      console.log("[LocationProvider] Setting mock location for demo mode");
      setLocation({
        latitude: 37.7749,
        longitude: -122.4194,
        neighborhood: "Demo Neighborhood"
      });
      setPodId("demo_pod_123");
      setIsLoading(false);
    }
  }, []);

  // Update user's location and pod assignment
  const updateLocation = async () => {
    if (!user) return;
    
    // Skip actual location updates in demo mode
    if (usingDummyValues) {
      console.log("[LocationProvider] Skipping real location update in demo mode");
      return;
    }
    
    try {
      console.log("[LocationProvider] Updating location");
      setIsLoading(true);
      setError(null);
      
      // Get current location
      const locationData = await PodService.getUserLocation();
      
      if (locationData.error) {
        setError(locationData.error);
        return;
      }
      
      const neighborhood = await PodService.getNeighborhoodFromCoordinates(
        locationData.latitude,
        locationData.longitude
      );
      
      setLocation({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        neighborhood,
      });
      
      // Update user's pod
      const result = await PodService.updateUserPod(user.uid);
      
      if (result.success && result.podId) {
        setPodId(result.podId);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      console.error("[LocationProvider] Error updating location:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update location when user changes
  useEffect(() => {
    if (user && !usingDummyValues) {
      console.log("[LocationProvider] User exists, updating location");
      updateLocation();
    } else if (!user) {
      setLocation(null);
      setPodId(null);
      setIsLoading(false);
    }
  }, [user]);

  // Log state changes
  useEffect(() => {
    console.log("[LocationProvider] State updated - location:", location ? "exists" : "null", "podId:", podId);
  }, [location, podId]);

  // Context value
  const value = {
    location,
    podId,
    isLoading,
    updateLocation,
    error,
    neighborhood: location?.neighborhood || "Demo Neighborhood",
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext; 