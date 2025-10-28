import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
import * as Notifications from 'expo-notifications';

type OnboardingPermissionsProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'OnboardingPermissions'>;
};

interface Permission {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: 'pending' | 'granted' | 'denied';
  required: boolean;
  requestFunction: () => Promise<void>;
}

const OnboardingPermissions: React.FC<OnboardingPermissionsProps> = ({ navigation }) => {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'location',
      title: 'Location',
      description: 'To find community events near you and connect with people in your area.',
      icon: 'location',
      status: 'pending',
      required: true,
      requestFunction: async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        updatePermissionStatus('location', status === 'granted' ? 'granted' : 'denied');
      }
    },
    {
      id: 'contacts',
      title: 'Contacts',
      description: 'To help you find friends already using Thryv and send WhatsApp messages.',
      icon: 'people',
      status: 'pending',
      required: false,
      requestFunction: async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        updatePermissionStatus('contacts', status === 'granted' ? 'granted' : 'denied');
      }
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'To receive well-being insights, reminders, and important updates.',
      icon: 'notifications',
      status: 'pending',
      required: false,
      requestFunction: async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        updatePermissionStatus('notifications', status === 'granted' ? 'granted' : 'denied');
      }
    }
  ]);

  const updatePermissionStatus = (id: string, status: 'pending' | 'granted' | 'denied') => {
    setPermissions(prev =>
      prev.map(permission =>
        permission.id === id ? { ...permission, status } : permission
      )
    );
  };

  const handleRequestPermission = async (permission: Permission) => {
    try {
      await permission.requestFunction();
    } catch (error) {
      console.error(`Error requesting ${permission.title} permission:`, error);
      updatePermissionStatus(permission.id, 'denied');
    }
  };

  const areRequiredPermissionsGranted = () => {
    return permissions
      .filter(permission => permission.required)
      .every(permission => permission.status === 'granted');
  };

  const handleContinue = () => {
    if (!areRequiredPermissionsGranted()) {
      return;
    }
    navigation.navigate('OnboardingWhatsApp');
  };

  const getStatusText = (status: string) => {
    if (status === 'granted') return 'Granted';
    if (status === 'denied') return 'Denied';
    return 'Allow';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a3c39" />
      
      <Image
        source={require('../../../assets/meditation-bg.jpg')}
        style={styles.backgroundImage}
      />
      
      <View style={styles.overlay}>
        <Animatable.View 
          animation="fadeInDown" 
          duration={800} 
          style={styles.header}
        >
          <Text style={styles.title}>App Permissions</Text>
          <Text style={styles.subtitle}>
            Thryv needs these permissions to provide you with the full experience. You can manage these anytime in your device settings.
          </Text>
        </Animatable.View>

        <ScrollView style={styles.scrollView}>
          {permissions.map((permission, index) => (
            <Animatable.View
              key={permission.id}
              animation="fadeInUp"
              duration={500}
              delay={index * 150}
              style={styles.permissionCard}
            >
              <View style={styles.permissionHeader}>
                <View style={styles.permissionIconContainer}>
                  <Ionicons name={permission.icon} size={24} color="#fff" />
                </View>
                <View style={styles.permissionTitleContainer}>
                  <Text style={styles.permissionTitle}>
                    {permission.title}
                    {permission.required && <Text style={styles.requiredBadge}> (Required)</Text>}
                  </Text>
                  <Text style={styles.permissionDescription}>{permission.description}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.permissionButton,
                  permission.status === 'granted' && styles.grantedButton,
                  permission.status === 'denied' && styles.deniedButton
                ]}
                onPress={() => handleRequestPermission(permission)}
                disabled={permission.status === 'granted'}
              >
                <Text style={styles.permissionButtonText}>
                  {getStatusText(permission.status)}
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
          
          <Animatable.View 
            animation="fadeIn" 
            duration={800}
            delay={600}
            style={styles.noticeContainer}
          >
            <Text style={styles.noticeText}>
              You can change these permissions later in your device settings.
            </Text>
          </Animatable.View>
        </ScrollView>

        <Animatable.View 
          animation="fadeInUp" 
          duration={800} 
          style={styles.footer}
        >
          <TouchableOpacity 
            style={[
              styles.continueButton,
              !areRequiredPermissionsGranted() && styles.buttonDisabled
            ]} 
            onPress={handleContinue}
            disabled={!areRequiredPermissionsGranted()}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4a3c39',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  permissionCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  permissionHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  permissionIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionTitleContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  requiredBadge: {
    fontStyle: 'italic',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  permissionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#5ca8ff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  grantedButton: {
    backgroundColor: '#4CAF50',
  },
  deniedButton: {
    backgroundColor: '#F44336',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noticeContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6b3d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255,107,61,0.5)',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default OnboardingPermissions; 