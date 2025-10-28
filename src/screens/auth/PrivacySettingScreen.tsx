import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { usePrivacy } from '../../contexts/PrivacyContext';

// Define the VisibilityLevel type locally since it's no longer exported from PrivacyContext
type VisibilityLevel = 'none' | 'podMembers' | 'eventParticipants' | 'friends' | 'all';

type PrivacySettingScreenProps = {
  navigation: StackNavigationProp<any>;
};

// Define privacy settings options
interface PrivacySetting {
  id: string;
  label: string;
  description: string;
  icon: string;
  defaultVisibility: VisibilityLevel[];
}

const PrivacySettingScreen: React.FC<PrivacySettingScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { privacySettings, updatePrivacySetting } = usePrivacy();
  const [isLoading, setIsLoading] = useState(false);

  // Privacy settings options
  const privacyOptions: PrivacySetting[] = [
    {
      id: 'shareLocation',
      label: 'Location',
      description: 'Control who can see your location and neighborhood',
      icon: 'location-outline',
      defaultVisibility: ['podMembers'],
    },
    {
      id: 'shareInterests',
      label: 'Interests',
      description: 'Control who can see your interests and preferences',
      icon: 'heart-outline',
      defaultVisibility: ['podMembers', 'eventParticipants'],
    },
    {
      id: 'shareEvents',
      label: 'Event Participation',
      description: 'Control who can see which events you\'re attending',
      icon: 'calendar-outline',
      defaultVisibility: ['podMembers', 'eventParticipants'],
    },
    {
      id: 'sharePodMembers',
      label: 'Pod Membership',
      description: 'Control who can see other members in your pod',
      icon: 'people-outline',
      defaultVisibility: ['podMembers'],
    },
    {
      id: 'allowMessaging',
      label: 'Messaging',
      description: 'Control who can send you messages',
      icon: 'chatbubble-outline',
      defaultVisibility: ['podMembers', 'eventParticipants'],
    },
  ];

  // Simplified version of privacy setting toggling
  const toggleSetting = (settingId: string) => {
    updatePrivacySetting(settingId as any, !privacySettings[settingId as keyof typeof privacySettings]);
  };

  // Save privacy settings and navigate to next screen
  const handleSave = async () => {
    // In this simplified version, settings are saved automatically
    // Move to the main screen
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Settings</Text>
          <Text style={styles.subtitle}>
            Control what information you share and with whom. You can change these settings anytime.
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          {privacyOptions.map((option) => (
            <View key={option.id} style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <Ionicons name={option.icon as any} size={24} color="#4CAF50" />
                <Text style={styles.settingTitle}>{option.label}</Text>
              </View>
              
              <Text style={styles.settingDescription}>{option.description}</Text>
              
              <View style={styles.toggleContainer}>
                <View style={styles.toggleOption}>
                  <Text style={styles.toggleLabel}>Enabled</Text>
                  <Switch
                    value={privacySettings[option.id as keyof typeof privacySettings]}
                    onValueChange={() => toggleSetting(option.id)}
                    trackColor={{ false: '#D1D1D1', true: '#A5D6A7' }}
                    thumbColor={privacySettings[option.id as keyof typeof privacySettings] ? '#4CAF50' : '#F5F5F5'}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  settingsContainer: {
    marginBottom: 20,
  },
  settingCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  toggleContainer: {
    marginTop: 8,
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrivacySettingScreen; 