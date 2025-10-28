import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { usePrivacy } from '../../contexts/PrivacyContext';

type ProfileScreenProps = {
  navigation: StackNavigationProp<any>;
};

interface Interest {
  name: string;
  icon: string;
}

const mockInterests: Interest[] = [
  { name: 'Gardening', icon: 'leaf-outline' },
  { name: 'Photography', icon: 'camera-outline' },
  { name: 'Reading', icon: 'book-outline' },
  { name: 'Hiking', icon: 'footsteps-outline' },
  { name: 'Cooking', icon: 'restaurant-outline' },
  { name: 'Meditation', icon: 'sparkles-outline' },
  { name: 'Technology', icon: 'hardware-chip-outline' },
  { name: 'Art', icon: 'color-palette-outline' },
];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const { getFieldVisibility, updateFieldVisibility } = usePrivacy();

  const [isLoading, setIsLoading] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    ['Gardening', 'Photography', 'Reading', 'Technology']
  );

  // Mock user data - in a real app, this would come from a context or API
  const profileData = {
    displayName: user?.displayName || 'Jane Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    bio: 'Community enthusiast passionate about sustainable living and local connections.',
    neighborhood: 'Greenview',
    joinDate: 'April 2023',
    podMembersCount: 12,
    eventsAttended: 8,
    eventsHosted: 2,
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      // Navigation will be handled by the AuthContext
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = (field: string) => {
    updateFieldVisibility(field as any, !getFieldVisibility(field as any));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: profileData.avatarUrl }}
            style={styles.profileImage}
            defaultSource={require('../../../assets/placeholder-avatar.png')}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profileData.displayName}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#4CAF50" />
            <Text style={styles.locationText}>{profileData.neighborhood}</Text>
          </View>
          <Text style={styles.joinDate}>Member since {profileData.joinDate}</Text>
        </View>
        
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Bio Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <TouchableOpacity>
            <Ionicons name="create-outline" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        <Text style={styles.bioText}>{profileData.bio}</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profileData.podMembersCount}</Text>
          <Text style={styles.statLabel}>Pod Members</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profileData.eventsAttended}</Text>
          <Text style={styles.statLabel}>Events Attended</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profileData.eventsHosted}</Text>
          <Text style={styles.statLabel}>Events Hosted</Text>
        </View>
      </View>

      {/* Interests Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <TouchableOpacity onPress={() => setIsEditingInterests(!isEditingInterests)}>
            <Ionicons 
              name={isEditingInterests ? 'checkmark-outline' : 'create-outline'} 
              size={20} 
              color="#4CAF50" 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.interestsContainer}>
          {isEditingInterests ? (
            <View style={styles.interestsGrid}>
              {mockInterests.map((interest) => (
                <TouchableOpacity
                  key={interest.name}
                  style={[
                    styles.interestItem,
                    selectedInterests.includes(interest.name) && styles.interestItemSelected
                  ]}
                  onPress={() => toggleInterest(interest.name)}
                >
                  <Ionicons 
                    name={interest.icon as any} 
                    size={20} 
                    color={selectedInterests.includes(interest.name) ? '#FFFFFF' : '#666666'} 
                  />
                  <Text 
                    style={[
                      styles.interestText,
                      selectedInterests.includes(interest.name) && styles.interestTextSelected
                    ]}
                  >
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.interestTags}>
              {selectedInterests.map((interest) => (
                <View key={interest} style={styles.interestTag}>
                  <Ionicons 
                    name={mockInterests.find(i => i.name === interest)?.icon as any || 'star-outline'} 
                    size={16} 
                    color="#4CAF50" 
                  />
                  <Text style={styles.interestTagText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.privacyItemContainer}>
          <View style={styles.privacyItem}>
            <View style={styles.privacyItemLeft}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <View style={styles.privacyItemTextContainer}>
                <Text style={styles.privacyItemTitle}>Profile</Text>
                <Text style={styles.privacyItemDescription}>
                  Who can see your profile information
                </Text>
              </View>
            </View>
            
            <View style={styles.privacyToggles}>
              <TouchableOpacity 
                style={[
                  styles.privacyToggle,
                  getFieldVisibility('profile') && styles.privacyToggleActive
                ]}
                onPress={() => handleToggleVisibility('profile')}
              >
                <Text 
                  style={[
                    styles.privacyToggleText,
                    getFieldVisibility('profile') && styles.privacyToggleTextActive
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.privacyToggle,
                  getFieldVisibility('profile') && styles.privacyToggleActive
                ]}
                onPress={() => handleToggleVisibility('profile')}
              >
                <Text 
                  style={[
                    styles.privacyToggleText,
                    getFieldVisibility('profile') && styles.privacyToggleTextActive
                  ]}
                >
                  Pod
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.privacyItem}>
            <View style={styles.privacyItemLeft}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <View style={styles.privacyItemTextContainer}>
                <Text style={styles.privacyItemTitle}>Location</Text>
                <Text style={styles.privacyItemDescription}>
                  Who can see your precise location
                </Text>
              </View>
            </View>
            
            <Switch
              value={getFieldVisibility('location')}
              onValueChange={() => handleToggleVisibility('location')}
              trackColor={{ false: '#D1D1D1', true: '#A5D6A7' }}
              thumbColor={getFieldVisibility('location') ? '#4CAF50' : '#F5F5F5'}
            />
          </View>
        </View>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications-outline" size={20} color="#666" />
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Preferences')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="settings-outline" size={20} color="#666" />
            <Text style={styles.menuItemText}>Preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Support')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle-outline" size={20} color="#666" />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
            <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
          </View>
          {isLoading ? <ActivityIndicator color="#4CAF50" size="small" /> : null}
        </TouchableOpacity>
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Roots App v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#999',
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
  },
  editProfileText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bioText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  statsSection: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
  },
  interestsContainer: {
    marginTop: 8,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  interestItemSelected: {
    backgroundColor: '#4CAF50',
  },
  interestText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  interestTextSelected: {
    color: '#FFFFFF',
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  interestTagText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
  },
  privacyItemContainer: {
    marginTop: 4,
  },
  privacyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  privacyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  privacyItemTextContainer: {
    marginLeft: 12,
  },
  privacyItemTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  privacyItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  privacyToggles: {
    flexDirection: 'row',
  },
  privacyToggle: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  privacyToggleActive: {
    backgroundColor: '#4CAF50',
  },
  privacyToggleText: {
    fontSize: 12,
    color: '#666',
  },
  privacyToggleTextActive: {
    color: '#fff',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  signOutText: {
    color: '#D32F2F',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ProfileScreen; 