import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';

type PodScreenProps = {
  navigation: StackNavigationProp<any>;
};

// Mock data interfaces
interface PodMember {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  interests: string[];
  matchScore: number;
  lastActive: string; // e.g., "2 hours ago"
}

// Mock pod data
const mockPodMembers: PodMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatarUrl: 'https://example.com/alex.jpg',
    bio: 'Environmental scientist who loves hiking and photography',
    interests: ['Hiking', 'Photography', 'Environmental Conservation', 'Gardening'],
    matchScore: 85,
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Jordan Smith',
    avatarUrl: 'https://example.com/jordan.jpg',
    bio: 'Local artist and community organizer',
    interests: ['Painting', 'Volunteering', 'Local Politics', 'Music'],
    matchScore: 78,
    lastActive: '5 min ago',
  },
  {
    id: '3',
    name: 'Taylor Williams',
    avatarUrl: 'https://example.com/taylor.jpg',
    bio: 'Software developer and avid gardener',
    interests: ['Gardening', 'Technology', 'Cooking', 'Reading'],
    matchScore: 72,
    lastActive: '1 day ago',
  },
  {
    id: '4',
    name: 'Casey Miller',
    avatarUrl: 'https://example.com/casey.jpg',
    bio: 'Yoga instructor and spiritual guide',
    interests: ['Yoga', 'Meditation', 'Holistic Health', 'Nature'],
    matchScore: 65,
    lastActive: 'Just now',
  },
  {
    id: '5',
    name: 'Morgan Lee',
    avatarUrl: 'https://example.com/morgan.jpg',
    bio: 'Chef and food enthusiast exploring local cuisines',
    interests: ['Cooking', 'Local Food', 'Farmers Markets', 'Sustainability'],
    matchScore: 79,
    lastActive: '3 hours ago',
  },
  {
    id: '6',
    name: 'Riley Thompson',
    avatarUrl: 'https://example.com/riley.jpg',
    bio: 'Community organizer focused on local sustainability initiatives',
    interests: ['Community Building', 'Sustainability', 'Urban Planning', 'Politics'],
    matchScore: 68,
    lastActive: '1 hour ago',
  },
];

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Recently Active' },
  { id: 'match', label: 'Best Match' },
  { id: 'interests', label: 'Similar Interests' },
];

const PodScreen: React.FC<PodScreenProps> = ({ navigation }) => {
  const [podMembers, setPodMembers] = useState<PodMember[]>(mockPodMembers);
  const [filteredMembers, setFilteredMembers] = useState<PodMember[]>(mockPodMembers);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const { user } = useAuth();
  const { neighborhood } = useLocation();

  useEffect(() => {
    fetchPodMembers();
  }, []);

  // Apply filters and search query to pod members
  useEffect(() => {
    let result = [...podMembers];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        member => 
          member.name.toLowerCase().includes(query) || 
          member.interests.some(interest => interest.toLowerCase().includes(query)) ||
          member.bio.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (activeFilter === 'active') {
      result = result.filter(member => 
        !member.lastActive.includes('day') && !member.lastActive.includes('week'));
    } else if (activeFilter === 'match') {
      result = [...result].sort((a, b) => b.matchScore - a.matchScore);
    } else if (activeFilter === 'interests') {
      // In a real app, this would compare interests with the current user's interests
      // For now, we'll just sort by number of interests
      result = [...result].sort((a, b) => b.interests.length - a.interests.length);
    }

    setFilteredMembers(result);
  }, [podMembers, searchQuery, activeFilter]);

  const fetchPodMembers = async () => {
    // In a real app, this would make an API call
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setPodMembers(mockPodMembers);
      setIsLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPodMembers();
    setRefreshing(false);
  };

  const handleFilterPress = (filterId: string) => {
    setActiveFilter(filterId);
  };

  const renderPodMember = ({ item }: { item: PodMember }) => (
    <TouchableOpacity 
      style={styles.memberCard}
      onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
    >
      <View style={styles.memberCardContent}>
        <Image 
          source={{ uri: item.avatarUrl }} 
          style={styles.memberAvatar}
          defaultSource={require('../../../assets/placeholder-avatar.png')}
        />
        <View style={styles.activeDot} />
        
        <View style={styles.memberInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.memberName}>{item.name}</Text>
            <View style={styles.matchScoreContainer}>
              <Ionicons name="heart" size={12} color="#4CAF50" />
              <Text style={styles.matchScoreText}>{item.matchScore}%</Text>
            </View>
          </View>
          
          <Text style={styles.memberBio} numberOfLines={2}>{item.bio}</Text>
          
          <View style={styles.interestsContainer}>
            {item.interests.slice(0, 3).map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestTagText}>{interest}</Text>
              </View>
            ))}
            {item.interests.length > 3 && (
              <View style={styles.interestTag}>
                <Text style={styles.interestTagText}>+{item.interests.length - 3}</Text>
              </View>
            )}
          </View>

          <View style={styles.activityContainer}>
            <Ionicons name="time-outline" size={12} color="#666" />
            <Text style={styles.activityText}>Active {item.lastActive}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Chat', { 
            conversationId: item.id,
            title: item.name 
          })}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#4CAF50" />
          <Text style={styles.actionButtonText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
          <Text style={styles.actionButtonText}>Meet Up</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Pod</Text>
        <View style={styles.headerLocationContainer}>
          <Ionicons name="location-outline" size={16} color="#4CAF50" />
          <Text style={styles.headerLocationText}>{neighborhood || 'Your Neighborhood'}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pod members..."
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
        contentContainerStyle={styles.filterContainer}
      >
        {filterOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.filterButton,
              activeFilter === option.id && styles.filterButtonActive
            ]}
            onPress={() => handleFilterPress(option.id)}
          >
            <Text 
              style={[
                styles.filterButtonText,
                activeFilter === option.id && styles.filterButtonTextActive
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : filteredMembers.length > 0 ? (
        <FlatList
          data={filteredMembers}
          renderItem={renderPodMember}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.membersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="people-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>No Pod Members Found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search or filters to see more people
          </Text>
        </View>
      )}
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  membersList: {
    padding: 16,
  },
  memberCard: {
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
  memberCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
    position: 'absolute',
    top: 16,
    left: 60,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  matchScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchScoreText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  memberBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  interestTag: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  interestTagText: {
    fontSize: 12,
    color: '#666',
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 8,
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
});

export default PodScreen; 