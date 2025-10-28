import { firestore } from '../firebase/config';
import firebase from 'firebase/compat/app';

// Event interface
export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  location: string;
  latitude: number;
  longitude: number;
  category: 'Learn' | 'Connect' | 'Fix';
  source: string;
  imageUrl: string;
  url: string;
  tags: string[];
  price?: number;
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
}

// Mock events for initial development (as we don't have real scrapers yet)
const generateMockEvents = (location: { latitude: number, longitude: number }): Partial<Event>[] => {
  // Generate random events within 10km of the user
  const events = [
    {
      id: 'event-1',
      title: 'Open Mic Night',
      description: 'Showcase your talent at our weekly open mic night. All talents welcome!',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      location: 'Café Culture, Bandra',
      latitude: location.latitude + (Math.random() - 0.5) * 0.1,
      longitude: location.longitude + (Math.random() - 0.5) * 0.1,
      category: 'Connect' as const,
      source: 'BookMyShow',
      imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad',
      url: 'https://bookmyshow.com/event/open-mic',
      tags: ['music', 'performance', 'social'],
      price: 150,
    },
    {
      id: 'event-2',
      title: 'Community Garden Project',
      description: 'Help revitalize our neighborhood garden and make our community greener.',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      location: 'City Park, Andheri',
      latitude: location.latitude + (Math.random() - 0.5) * 0.1,
      longitude: location.longitude + (Math.random() - 0.5) * 0.1,
      category: 'Fix' as const,
      source: 'Meetup',
      imageUrl: 'https://images.unsplash.com/photo-1595851495611-47edcca6631a',
      url: 'https://meetup.com/event/garden-project',
      tags: ['environment', 'volunteer', 'outdoor'],
      price: 0,
    },
    {
      id: 'event-3',
      title: 'AI Workshop: Building Your First Model',
      description: 'Learn the basics of AI and build your first machine learning model. No prior experience required.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      location: 'Tech Hub, Powai',
      latitude: location.latitude + (Math.random() - 0.5) * 0.1,
      longitude: location.longitude + (Math.random() - 0.5) * 0.1,
      category: 'Learn' as const,
      source: 'BookMyShow',
      imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
      url: 'https://bookmyshow.com/event/ai-workshop',
      tags: ['technology', 'education', 'workshop'],
      price: 500,
    },
    {
      id: 'event-4',
      title: 'Board Game Night',
      description: 'Join us for a night of strategy, luck, and fun with various board games.',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      location: 'Game Café, Juhu',
      latitude: location.latitude + (Math.random() - 0.5) * 0.1,
      longitude: location.longitude + (Math.random() - 0.5) * 0.1,
      category: 'Connect' as const,
      source: 'Meetup',
      imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09',
      url: 'https://meetup.com/event/board-game-night',
      tags: ['games', 'social', 'indoor'],
      price: 200,
    },
    {
      id: 'event-5',
      title: 'Beach Cleanup Drive',
      description: 'Help clean our beautiful beaches and protect marine life.',
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      location: 'Juhu Beach',
      latitude: location.latitude + (Math.random() - 0.5) * 0.1,
      longitude: location.longitude + (Math.random() - 0.5) * 0.1,
      category: 'Fix' as const,
      source: 'Meetup',
      imageUrl: 'https://images.unsplash.com/photo-1618477460930-bac15d5cd09d',
      url: 'https://meetup.com/event/beach-cleanup',
      tags: ['environment', 'volunteer', 'outdoor'],
      price: 0,
    },
  ];
  
  return events;
};

// Function to scrape BookMyShow events (mock implementation)
export const scrapeBookMyShowEvents = async (
  city: string,
  location: { latitude: number, longitude: number }
): Promise<{ success: boolean; events?: Partial<Event>[]; error?: string }> => {
  try {
    // In a real implementation, we would use a server-side function with a headless browser
    // For now, we'll use mock data
    console.log(`Scraping BookMyShow events for ${city}...`);
    
    // Get mock events filtered by source
    const mockEvents = generateMockEvents(location).filter(
      event => event.source === 'BookMyShow'
    );
    
    return { success: true, events: mockEvents };
  } catch (error: any) {
    console.error('Error scraping BookMyShow events:', error);
    return { success: false, error: error.message };
  }
};

// Function to scrape Meetup events (mock implementation)
export const scrapeMeetupEvents = async (
  location: { latitude: number, longitude: number }
): Promise<{ success: boolean; events?: Partial<Event>[]; error?: string }> => {
  try {
    // In a real implementation, we would use a server-side function with a headless browser
    // For now, we'll use mock data
    console.log(`Scraping Meetup events near (${location.latitude}, ${location.longitude})...`);
    
    // Get mock events filtered by source
    const mockEvents = generateMockEvents(location).filter(
      event => event.source === 'Meetup'
    );
    
    return { success: true, events: mockEvents };
  } catch (error: any) {
    console.error('Error scraping Meetup events:', error);
    return { success: false, error: error.message };
  }
};

// Store events in Firestore
export const storeEvents = async (events: Partial<Event>[]): Promise<{ success: boolean; error?: string }> => {
  try {
    const batch = firestore.batch();
    
    events.forEach(event => {
      if (!event.id) return; // Skip events without ID
      
      const eventRef = firestore.collection('events').doc(event.id);
      batch.set(eventRef, {
        ...event,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    
    await batch.commit();
    return { success: true };
  } catch (error: any) {
    console.error('Error storing events:', error);
    return { success: false, error: error.message };
  }
};

// Fetch and store events from all sources
export const fetchAndStoreAllEvents = async (location: { latitude: number, longitude: number }): Promise<{ success: boolean; error?: string }> => {
  try {
    // Determine city from location (would use reverse geocoding in a real app)
    const city = 'Mumbai'; // Placeholder - would be determined from coordinates
    
    // Fetch events from different sources
    const bookMyShowResult = await scrapeBookMyShowEvents(city, location);
    const meetupResult = await scrapeMeetupEvents(location);
    
    const allEvents = [
      ...(bookMyShowResult.events || []),
      ...(meetupResult.events || []),
    ];
    
    if (allEvents.length === 0) {
      return { success: true }; // No events found but no error
    }
    
    // Store all events
    const storeResult = await storeEvents(allEvents);
    
    return storeResult;
  } catch (error: any) {
    console.error('Error fetching and storing events:', error);
    return { success: false, error: error.message };
  }
}; 