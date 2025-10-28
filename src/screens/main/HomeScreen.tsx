import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { usingDummyValues } from '../../services/firebase/config';

type HomeScreenProps = {
  navigation: StackNavigationProp<any>;
};

// Mock data for our components
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  attendeesCount: number;
  category: string;
  distance: string;
  host: string;
}

interface PodMember {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  interests: string[];
  matchScore: number;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Community Gardening Day',
    description: 'Join us for a day of gardening and beautifying our local park.',
    date: 'Saturday, May 15',
    time: '10:00 AM - 2:00 PM',
    location: 'Central Park',
    imageUrl: 'https://example.com/gardening.jpg',
    attendeesCount: 24,
    category: 'environment',
    distance: '0.3 miles away',
    host: 'Neighborhood Green Committee',
  },
  {
    id: '2',
    title: 'Local Business Networking',
    description: 'Connect with other local business owners and entrepreneurs.',
    date: 'Tuesday, May 18',
    time: '6:30 PM - 8:30 PM',
    location: 'Community Center',
    imageUrl: 'https://example.com/networking.jpg',
    attendeesCount: 36,
    category: 'business',
    distance: '0.5 miles away',
    host: 'Small Business Association',
  },
  {
    id: '3',
    title: 'Neighborhood Basketball Tournament',
    description: 'Annual 3-on-3 basketball tournament for all skill levels.',
    date: 'Saturday, May 29',
    time: '11:00 AM - 4:00 PM',
    location: 'Community Recreation Center',
    imageUrl: 'https://example.com/basketball.jpg',
    attendeesCount: 50,
    category: 'sports',
    distance: '0.7 miles away',
    host: 'Neighborhood Sports Committee',
  },
];

const mockPodMembers: PodMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatarUrl: 'https://example.com/alex.jpg',
    bio: 'Software developer and hiking enthusiast',
    interests: ['Hiking', 'Coding', 'Photography'],
    matchScore: 92,
  },
  {
    id: '2',
    name: 'Jordan Smith',
    avatarUrl: 'https://example.com/jordan.jpg',
    bio: 'Local chef and community garden volunteer',
    interests: ['Cooking', 'Gardening', 'Sustainability'],
    matchScore: 86,
  },
  {
    id: '3',
    name: 'Taylor Rodriguez',
    avatarUrl: 'https://example.com/taylor.jpg',
    bio: 'Elementary school teacher and book club organizer',
    interests: ['Reading', 'Education', 'Arts & Crafts'],
    matchScore: 72,
  },
  {
    id: '4',
    name: 'Casey Miller',
    avatarUrl: 'https://example.com/casey.jpg',
    bio: 'Yoga instructor and spiritual guide',
    interests: ['Yoga', 'Meditation', 'Holistic Health'],
    matchScore: 65,
  },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [podMembers, setPodMembers] = useState<PodMember[]>(mockPodMembers);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { neighborhood } = useLocation();

  useEffect(() => {
    console.log("[HomeScreen] Initializing");
    // In a real app, we would fetch real data here based on the user's location
    // This would use the LocationContext to get the user's current neighborhood
    fetchRecommendedEvents();
    fetchPodMembers();
  }, []);

  const fetchRecommendedEvents = async () => {
    // In a real app, this would make an API call to get events
    // For now, we'll just use our mock data
    console.log("[HomeScreen] Fetching events");
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setEvents(mockEvents);
      setIsLoading(false);
    }, 500);
  };

  const fetchPodMembers = async () => {
    // In a real app, this would make an API call to get pod members
    // For now, we'll just use our mock data
    console.log("[HomeScreen] Fetching pod members");
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setPodMembers(mockPodMembers);
      setIsLoading(false);
    }, 500);
  };

  const onRefresh = async () => {
    console.log("[HomeScreen] Refreshing data");
    setRefreshing(true);
    await fetchRecommendedEvents();
    await fetchPodMembers();
    setRefreshing(false);
  };

  // Simplified rendering for demo mode
  if (usingDummyValues) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Hello, Demo User!</Text>
          <Text style={styles.locationText}>
            <Ionicons name="location-outline" size={14} color="#666" /> 
            {neighborhood}
          </Text>
        </View>
  
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Upcoming Events Near You</Text>
          {mockEvents.map(event => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <View style={styles.eventImageContainer}>
                <View style={styles.demoImage} />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date} • {event.time}</Text>
                <Text style={styles.eventLocation}>
                  <Ionicons name="location-outline" size={12} color="#666" /> {event.location}
                </Text>
                <Text style={styles.eventAttendees}>
                  <Ionicons name="people-outline" size={12} color="#666" /> {event.attendeesCount} attending
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
  
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Pod</Text>
          {mockPodMembers.map(member => (
            <TouchableOpacity key={member.id} style={styles.podMemberCard}>
              <View style={styles.avatarContainer}>
                <View style={styles.demoAvatar} />
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberBio}>{member.bio}</Text>
                <View style={styles.interestsContainer}>
                  {member.interests.map((interest, index) => (
                    <View key={index} style={styles.interestBadge}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.matchScoreContainer}>
                <Text style={styles.matchScoreText}>{member.matchScore}%</Text>
                <Text style={styles.matchLabel}>match</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  // For non-demo mode (full implementation)
  // This would be needed if we had real Firebase integration
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  welcomeContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionContainer: {
    marginTop: 20,
    marginBottom: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImageContainer: {
    width: 80,
    height: 80,
  },
  demoImage: {
    width: 80, 
    height: 80, 
    backgroundColor: '#CCDDFF',
  },
  eventInfo: {
    flex: 1,
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  eventLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  eventAttendees: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 6,
  },
  podMemberCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
  },
  demoAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFDDCC',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberBio: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  interestText: {
    fontSize: 10,
    color: '#666',
  },
  matchScoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  matchScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  matchLabel: {
    fontSize: 10,
    color: '#666',
  },
});

export default HomeScreen; 