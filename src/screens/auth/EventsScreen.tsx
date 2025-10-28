import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../contexts/LocationContext';

type EventsScreenProps = {
  navigation: StackNavigationProp<any>;
};

// Mock data interfaces
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
  distance: string; // e.g., "0.5 miles away"
  host: string;
}

// Categories for filtering
const categories = [
  { id: 'all', label: 'All' },
  { id: 'environment', label: 'Environment' },
  { id: 'arts', label: 'Arts & Culture' },
  { id: 'community', label: 'Community' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'sports', label: 'Sports' },
  { id: 'technology', label: 'Technology' },
  { id: 'education', label: 'Education' },
];

// Mock events data
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Community Garden Day',
    description: 'Join us for a day of gardening and community building at the local garden. Learn about sustainable practices and meet your neighbors.',
    date: 'Saturday, May 15',
    time: '10:00 AM - 2:00 PM',
    location: 'Greenview Community Garden',
    imageUrl: 'https://example.com/garden.jpg',
    attendeesCount: 18,
    category: 'environment',
    distance: '0.5 miles away',
    host: 'Green Neighborhood Association',
  },
  {
    id: '2',
    title: 'Local Art Exhibition',
    description: 'Discover the works of local artists and engage with the creative community. Light refreshments will be served.',
    date: 'Sunday, May 16',
    time: '1:00 PM - 6:00 PM',
    location: 'Downtown Art Gallery',
    imageUrl: 'https://example.com/art.jpg',
    attendeesCount: 45,
    category: 'arts',
    distance: '1.2 miles away',
    host: 'Community Arts Collective',
  },
  {
    id: '3',
    title: 'Neighborhood Cleanup',
    description: 'Help keep our neighborhood clean and beautiful. All supplies provided. Bring water and wear comfortable clothes.',
    date: 'Saturday, May 22',
    time: '9:00 AM - 12:00 PM',
    location: 'Riverside Park',
    imageUrl: 'https://example.com/cleanup.jpg',
    attendeesCount: 12,
    category: 'community',
    distance: '0.3 miles away',
    host: 'Riverside Residents Association',
  },
  {
    id: '4',
    title: 'Farmers Market & Food Festival',
    description: 'Shop for fresh, local produce and enjoy food from local vendors. Live music and activities for kids.',
    date: 'Sunday, May 23',
    time: '9:00 AM - 3:00 PM',
    location: 'Central Plaza',
    imageUrl: 'https://example.com/market.jpg',
    attendeesCount: 120,
    category: 'food',
    distance: '0.8 miles away',
    host: 'Local Farmers Collective',
  },
  {
    id: '5',
    title: 'Tech Meetup: AI & Community',
    description: 'Learn how AI technologies can benefit local communities. Networking opportunity for tech professionals.',
    date: 'Wednesday, May 26',
    time: '6:30 PM - 8:30 PM',
    location: 'Community Innovation Hub',
    imageUrl: 'https://example.com/tech.jpg',
    attendeesCount: 35,
    category: 'technology',
    distance: '1.5 miles away',
    host: 'Tech for Good Initiative',
  },
  {
    id: '6',
    title: 'Community Basketball Tournament',
    description: 'Join or cheer for teams in our neighborhood basketball tournament. All skill levels welcome!',
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

const EventsScreen: React.FC<EventsScreenProps> = ({ navigation }) => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { location } = useLocation();
  const neighborhood = location?.neighborhood;

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = [...events];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        event => 
          event.title.toLowerCase().includes(query) || 
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (activeCategory !== 'all') {
      result = result.filter(event => event.category === activeCategory);
    }

    setFilteredEvents(result);
  }, [events, searchQuery, activeCategory]);

  const fetchEvents = async () => {
    // In a real app, this would make an API call
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setEvents(mockEvents);
      setIsLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.eventImage}
        defaultSource={require('../../../assets/placeholder-event.png')}
      />
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={styles.eventCategory}>
            <Text style={styles.eventCategoryText}>
              {categories.find(cat => cat.id === item.category)?.label || item.category}
            </Text>
          </View>
          <Text style={styles.eventDistance}>{item.distance}</Text>
        </View>
        
        <Text style={styles.eventTitle}>{item.title}</Text>
        
        <View style={styles.eventMetaContainer}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.eventMeta}>{item.date}</Text>
        </View>
        
        <View style={styles.eventMetaContainer}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.eventMeta}>{item.time}</Text>
        </View>
        
        <View style={styles.eventMetaContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.eventMeta}>{item.location}</Text>
        </View>
        
        <View style={styles.eventAttendees}>
          <Ionicons name="people-outline" size={14} color="#666" />
          <Text style={styles.eventMeta}>{item.attendeesCount} attending</Text>
        </View>
        
        <View style={styles.eventFooter}>
          <View style={styles.eventHost}>
            <Text style={styles.eventHostLabel}>Hosted by:</Text>
            <Text style={styles.eventHostName}>{item.host}</Text>
          </View>
          
          <TouchableOpacity style={styles.interestedButton}>
            <Text style={styles.interestedButtonText}>I'm Interested</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events Near You</Text>
        <View style={styles.headerLocationContainer}>
          <Ionicons name="location-outline" size={16} color="#4CAF50" />
          <Text style={styles.headerLocationText}>{neighborhood || 'Your Neighborhood'}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              activeCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Text 
              style={[
                styles.categoryButtonText,
                activeCategory === category.id && styles.categoryButtonTextActive
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : filteredEvents.length > 0 ? (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.eventsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="calendar-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>No Events Found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search or filters to see more events
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.createEventButton}
        onPress={() => {/* Navigate to create event screen */}}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLocationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  eventsList: {
    padding: 16,
    paddingBottom: 80, // Space for the floating button
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventCategory: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  eventCategoryText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  eventDistance: {
    fontSize: 12,
    color: '#666',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  eventMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventMeta: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  eventAttendees: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  eventHost: {
    flex: 1,
  },
  eventHostLabel: {
    fontSize: 12,
    color: '#666',
  },
  eventHostName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  interestedButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  interestedButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  createEventButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default EventsScreen; 