import { firestore, usingDummyValues } from '../firebase/config';
import firebase from 'firebase/compat/app';
import * as Location from 'expo-location';

// Pod radius in kilometers
const POD_RADIUS_KM = 10;

// Convert kilometers to approximate latitude degrees
const kmToLatitudeDegrees = (km: number): number => {
  return km / 111.32; // At the equator, 1 degree = 111.32 km
};

// Convert kilometers to approximate longitude degrees at a given latitude
const kmToLongitudeDegrees = (km: number, latitude: number): number => {
  return km / (111.32 * Math.cos(latitude * (Math.PI / 180)));
};

// Get user's current location
export const getUserLocation = async (): Promise<{ 
  latitude: number; 
  longitude: number;
  error?: string;
}> => {
  console.log("[podService] Getting user location, demo mode:", usingDummyValues);
  
  // In demo mode, return mock location data
  if (usingDummyValues) {
    return {
      latitude: 37.7749,
      longitude: -122.4194 // San Francisco coordinates as demo location
    };
  }
  
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return {
        latitude: 0,
        longitude: 0,
        error: 'Permission to access location was denied'
      };
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  } catch (error: any) {
    console.error("[podService] Error getting location:", error.message);
    return {
      latitude: 0,
      longitude: 0,
      error: error.message
    };
  }
};

// Get neighborhood name from coordinates using reverse geocoding
export const getNeighborhoodFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  console.log("[podService] Getting neighborhood, demo mode:", usingDummyValues);
  
  // In demo mode, return mock neighborhood
  if (usingDummyValues) {
    return "Demo Neighborhood";
  }
  
  try {
    const geoData = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });

    if (geoData.length > 0) {
      const { district, subregion, city, region } = geoData[0];
      return district || subregion || city || region || 'Unknown Area';
    }

    return 'Unknown Area';
  } catch (error) {
    console.error('Error getting neighborhood:', error);
    return 'Unknown Area';
  }
};

// Update user's pod assignment based on current location
export const updateUserPod = async (userId: string): Promise<{
  success: boolean;
  podId?: string;
  error?: string;
}> => {
  console.log("[podService] Updating user pod, demo mode:", usingDummyValues);
  
  // In demo mode, return mock pod ID
  if (usingDummyValues) {
    return { 
      success: true, 
      podId: 'demo_pod_123' 
    };
  }
  
  try {
    // Get current location
    const location = await getUserLocation();
    
    if (location.error) {
      return { success: false, error: location.error };
    }
    
    const { latitude, longitude } = location;
    
    // Get neighborhood name
    const neighborhood = await getNeighborhoodFromCoordinates(latitude, longitude);
    
    // Store user's current location
    await firestore.collection('users').doc(userId).update({
      location: new firebase.firestore.GeoPoint(latitude, longitude),
      neighborhood,
      lastLocationUpdate: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Generate pod ID based on approximate coordinates (rounded to create neighborhood pods)
    // This creates pods of roughly 1km size
    const podLatitude = Math.round(latitude * 10) / 10;
    const podLongitude = Math.round(longitude * 10) / 10;
    const podId = `pod_${podLatitude}_${podLongitude}`;
    
    // Add or update the pod in the database
    await firestore.collection('pods').doc(podId).set({
      centerLatitude: podLatitude,
      centerLongitude: podLongitude,
      neighborhood,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    // Add user to this pod's members
    await firestore.collection('pods').doc(podId).collection('members').doc(userId).set({
      joinedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, podId };
  } catch (error: any) {
    console.error('Error updating user pod:', error);
    return { success: false, error: error.message };
  }
};

// Get users in the same pod
export const getUsersInPod = async (podId: string): Promise<any[]> => {
  console.log("[podService] Getting users in pod, demo mode:", usingDummyValues);
  
  // In demo mode, return mock users
  if (usingDummyValues) {
    return [
      {
        id: 'mock_user_1',
        displayName: 'Jane Doe',
        bio: 'Community gardener and food sustainability advocate',
        interests: ['Gardening', 'Sustainability', 'Food'],
        matchScore: 92
      },
      {
        id: 'mock_user_2',
        displayName: 'John Smith',
        bio: 'Software engineer and running enthusiast',
        interests: ['Technology', 'Running', 'Coffee'],
        matchScore: 85
      },
      {
        id: 'mock_user_3',
        displayName: 'Alex Johnson',
        bio: 'Artist and community organizer',
        interests: ['Art', 'Community', 'Social Justice'],
        matchScore: 78
      }
    ];
  }
  
  try {
    const membersSnapshot = await firestore
      .collection('pods')
      .doc(podId)
      .collection('members')
      .get();
    
    const userIds = membersSnapshot.docs.map((doc: firebase.firestore.QueryDocumentSnapshot) => doc.id);
    
    // Get user profiles
    const users = [];
    for (const id of userIds) {
      const userDoc = await firestore.collection('users').doc(id).get();
      if (userDoc.exists) {
        users.push({
          id,
          ...userDoc.data()
        });
      }
    }
    
    return users;
  } catch (error) {
    console.error('Error getting pod users:', error);
    return [];
  }
};

// Find nearby pods within the radius
export const getNearbyPods = async (
  latitude: number,
  longitude: number
): Promise<string[]> => {
  console.log("[podService] Getting nearby pods, demo mode:", usingDummyValues);
  
  // In demo mode, return mock pod IDs
  if (usingDummyValues) {
    return ['demo_pod_123', 'demo_pod_456', 'demo_pod_789'];
  }
  
  try {
    // Get all pods (in a real app, we'd use a geospatial query)
    const podsSnapshot = await firestore.collection('pods').get();
    
    const latDegrees = kmToLatitudeDegrees(POD_RADIUS_KM);
    const lngDegrees = kmToLongitudeDegrees(POD_RADIUS_KM, latitude);
    
    // Filter pods within radius
    const nearbyPods = podsSnapshot.docs.filter((doc: firebase.firestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      const podLat = data.centerLatitude;
      const podLng = data.centerLongitude;
      
      return (
        Math.abs(latitude - podLat) <= latDegrees &&
        Math.abs(longitude - podLng) <= lngDegrees
      );
    });
    
    return nearbyPods.map((doc: firebase.firestore.QueryDocumentSnapshot) => doc.id);
  } catch (error) {
    console.error('Error finding nearby pods:', error);
    return [];
  }
}; 