import { firestore } from '../firebase/config';
import firebase from 'firebase/compat/app';
import { Event } from '../scraper/eventsScraper';
import * as PodService from '../location/podService';

// Group size preferences for events
export enum GroupSize {
  SMALL = 'small', // 2-4 people
  MEDIUM = 'medium', // 5-10 people
  LARGE = 'large', // 10+ people
  ANY = 'any', // No preference
}

// Interface for event group
export interface EventGroup {
  id: string;
  eventId: string;
  size: GroupSize;
  currentSize: number;
  isFull: boolean;
  members: string[]; // User IDs
  createdAt: firebase.firestore.Timestamp;
  createdBy: string; // User ID
}

// Get events near user location
export const getNearbyEvents = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Partial<Event>[]> => {
  try {
    // In a production app, we'd use a geospatial query
    // For this implementation, we'll get all events and filter in memory
    const eventsSnapshot = await firestore.collection('events').get();
    
    const events = eventsSnapshot.docs.map((doc: firebase.firestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as Partial<Event>[];
    
    // Filter events by distance
    return events.filter(event => {
      if (!event.latitude || !event.longitude) return false;
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        latitude,
        longitude,
        event.latitude,
        event.longitude
      );
      
      return distance <= radiusKm;
    });
  } catch (error) {
    console.error('Error getting nearby events:', error);
    return [];
  }
};

// Filter events by category
export const filterEventsByCategory = (
  events: Partial<Event>[],
  category: Event['category'] | null
): Partial<Event>[] => {
  if (!category) return events;
  return events.filter(event => event.category === category);
};

// Join an event
export const joinEvent = async (
  userId: string,
  eventId: string,
  groupSizePreference: GroupSize
): Promise<{ success: boolean; groupId?: string; error?: string }> => {
  try {
    // Check if event exists
    const eventDoc = await firestore.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      return { success: false, error: 'Event not found' };
    }
    
    // Check if user is already registered for this event
    const participantDoc = await firestore
      .collection('events')
      .doc(eventId)
      .collection('participants')
      .doc(userId)
      .get();
    
    if (participantDoc.exists) {
      // User already joined this event
      const participantData = participantDoc.data();
      return { 
        success: true, 
        groupId: participantData?.groupId,
        error: 'You have already joined this event' 
      };
    }
    
    // Add user to event participants
    await firestore
      .collection('events')
      .doc(eventId)
      .collection('participants')
      .doc(userId)
      .set({
        joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
        groupSizePreference
      });
    
    // Match user to a group
    const groupResult = await matchUserToGroup(userId, eventId, groupSizePreference);
    
    if (!groupResult.success) {
      return { success: false, error: groupResult.error };
    }
    
    // Update participant record with group ID
    await firestore
      .collection('events')
      .doc(eventId)
      .collection('participants')
      .doc(userId)
      .update({
        groupId: groupResult.groupId
      });
    
    return { success: true, groupId: groupResult.groupId };
  } catch (error: any) {
    console.error('Error joining event:', error);
    return { success: false, error: error.message };
  }
};

// Match user to a group based on size preference
const matchUserToGroup = async (
  userId: string,
  eventId: string,
  groupSizePreference: GroupSize
): Promise<{ success: boolean; groupId?: string; error?: string }> => {
  try {
    // Get user profile for matching
    const userDoc = await firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return { success: false, error: 'User profile not found' };
    }
    
    // Find available groups that match the size preference
    let groupsQuery = firestore
      .collection('events')
      .doc(eventId)
      .collection('groups')
      .where('isFull', '==', false);
    
    if (groupSizePreference !== GroupSize.ANY) {
      groupsQuery = groupsQuery.where('size', '==', groupSizePreference);
    }
    
    const groupsSnapshot = await groupsQuery.get();
    
    // If an available group exists
    if (!groupsSnapshot.empty) {
      // Get the first available group
      const groupDoc = groupsSnapshot.docs[0];
      const groupData = groupDoc.data() as Partial<EventGroup>;
      
      // Add user to group
      await firestore
        .collection('events')
        .doc(eventId)
        .collection('groups')
        .doc(groupDoc.id)
        .update({
          members: firebase.firestore.FieldValue.arrayUnion(userId),
          currentSize: firebase.firestore.FieldValue.increment(1)
        });
      
      // Check if group is now full
      const maxSizeMap = {
        [GroupSize.SMALL]: 4,
        [GroupSize.MEDIUM]: 10,
        [GroupSize.LARGE]: 30,
        [GroupSize.ANY]: 10, // Default for ANY
      };
      
      const groupSize = groupData.size || GroupSize.MEDIUM;
      const maxSize = maxSizeMap[groupSize];
      const newSize = (groupData.currentSize || 0) + 1;
      
      if (newSize >= maxSize) {
        // Mark group as full
        await firestore
          .collection('events')
          .doc(eventId)
          .collection('groups')
          .doc(groupDoc.id)
          .update({
            isFull: true
          });
      }
      
      return { success: true, groupId: groupDoc.id };
    } else {
      // Create a new group
      const newGroupRef = firestore
        .collection('events')
        .doc(eventId)
        .collection('groups')
        .doc();
      
      // Determine max size based on preference
      const maxSizeMap = {
        [GroupSize.SMALL]: 4,
        [GroupSize.MEDIUM]: 10,
        [GroupSize.LARGE]: 30,
        [GroupSize.ANY]: 10, // Default for ANY
      };
      
      const maxSize = maxSizeMap[groupSizePreference];
      
      await newGroupRef.set({
        size: groupSizePreference,
        currentSize: 1,
        members: [userId],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: userId,
        isFull: maxSize === 1 // If max size is 1, mark as full immediately
      });
      
      return { success: true, groupId: newGroupRef.id };
    }
  } catch (error: any) {
    console.error('Error matching user to group:', error);
    return { success: false, error: error.message };
  }
};

// Get event details
export const getEventDetails = async (eventId: string): Promise<Partial<Event> | null> => {
  try {
    const eventDoc = await firestore.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      return null;
    }
    
    return {
      id: eventDoc.id,
      ...eventDoc.data()
    } as Partial<Event>;
  } catch (error) {
    console.error('Error getting event details:', error);
    return null;
  }
};

// Get user's events (events they've joined)
export const getUserEvents = async (userId: string): Promise<Partial<Event>[]> => {
  try {
    // Get all events where user is a participant
    const eventsSnapshot = await firestore
      .collectionGroup('participants')
      .where('__name__', '==', userId)
      .get();
    
    const eventIds = eventsSnapshot.docs.map((doc: firebase.firestore.QueryDocumentSnapshot) => doc.ref.parent.parent?.id).filter(Boolean) as string[];
    
    // Get details for each event
    const events: Partial<Event>[] = [];
    
    for (const eventId of eventIds) {
      const eventDoc = await firestore.collection('events').doc(eventId).get();
      
      if (eventDoc.exists) {
        events.push({
          id: eventDoc.id,
          ...eventDoc.data()
        } as Partial<Event>);
      }
    }
    
    return events;
  } catch (error) {
    console.error('Error getting user events:', error);
    return [];
  }
};

// Get group details
export const getGroupDetails = async (
  eventId: string,
  groupId: string
): Promise<Partial<EventGroup> | null> => {
  try {
    const groupDoc = await firestore
      .collection('events')
      .doc(eventId)
      .collection('groups')
      .doc(groupId)
      .get();
    
    if (!groupDoc.exists) {
      return null;
    }
    
    return {
      id: groupDoc.id,
      ...groupDoc.data()
    } as Partial<EventGroup>;
  } catch (error) {
    console.error('Error getting group details:', error);
    return null;
  }
};

// Helper function to calculate distance between coordinates (Haversine formula)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}; 