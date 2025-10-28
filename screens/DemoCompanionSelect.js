import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

const DemoCompanionSelect = () => {
  const navigation = useNavigation();
  const [selectedCompanion, setSelectedCompanion] = useState(null);

  // Mock data for AI companions
  const companions = [
    {
      id: 1,
      name: 'Dr. Mei',
      role: 'Therapy & Wellness Guide',
      description: 'Specialized in CBT, mindfulness, and personalized wellness plans. Supports mental health journey with evidence-based guidance.',
      avatar: '🌱',
      color: '#8E2DE2'
    },
    {
      id: 2,
      name: 'Coach Ryan',
      role: 'Fitness & Nutrition Expert',
      description: 'Helps create sustainable fitness routines and nutrition plans tailored to your lifestyle and goals.',
      avatar: '💪',
      color: '#FF5722'
    },
    {
      id: 3,
      name: 'Sage',
      role: 'Meditation & Mindfulness',
      description: 'Guides you through meditation practices, breathing exercises, and stress management techniques.',
      avatar: '🧘',
      color: '#4CAF50'
    },
    {
      id: 4,
      name: 'Mentor Max',
      role: 'Career & Life Coach',
      description: 'Helps with goal setting, productivity, career planning, and developing better work-life balance.',
      avatar: '📈',
      color: '#2196F3'
    }
  ];

  const handleCompanionSelect = (companion) => {
    setSelectedCompanion(companion);
  };

  const handleContinue = () => {
    navigation.navigate('DemoWhatsAppPrompt');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Animatable.View animation="fadeIn" duration={800} style={styles.onboardingHeader}>
          <Text style={styles.title}>Choose your companion</Text>
          <Text style={styles.paragraph}>
            Select an AI companion that best matches your wellness goals.
            You can always change your companion later.
          </Text>
        </Animatable.View>

        {companions.map((companion, index) => (
          <Animatable.View 
            key={companion.id}
            animation="fadeInUp"
            delay={300 + (index * 100)}
            duration={800}
          >
            <TouchableOpacity 
              style={[
                styles.companionCard,
                selectedCompanion?.id === companion.id && {
                  borderColor: companion.color,
                  backgroundColor: `${companion.color}15` // Semi-transparent version of color
                }
              ]}
              onPress={() => handleCompanionSelect(companion)}
            >
              <View style={[
                styles.companionAvatar,
                { backgroundColor: `${companion.color}30` } // More transparent version of color
              ]}>
                <Text style={styles.avatarText}>{companion.avatar}</Text>
              </View>
              
              <View style={styles.companionInfo}>
                <Text style={styles.companionName}>{companion.name}</Text>
                <Text style={[styles.companionRole, {color: companion.color}]}>
                  {companion.role}
                </Text>
                <Text style={styles.companionDescription}>
                  {companion.description}
                </Text>
              </View>
              
              {selectedCompanion?.id === companion.id && (
                <View style={[styles.checkmark, {backgroundColor: companion.color}]}>
                  <Icon name="check" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </Animatable.View>
        ))}
        
        <View style={{height: 100}} />
      </ScrollView>
      
      <Animatable.View 
        animation="fadeInUp" 
        duration={800}
        style={styles.bottomBar}
      >
        <TouchableOpacity 
          style={[
            styles.continueButton,
            {
              backgroundColor: selectedCompanion ? '#8E2DE2' : 'rgba(142, 45, 226, 0.3)',
            }
          ]}
          onPress={handleContinue}
          disabled={!selectedCompanion}
        >
          <Text style={styles.continueButtonText}>
            Continue
          </Text>
          <Icon name="arrow-right" size={20} color="white" />
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  onboardingHeader: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
    lineHeight: 22,
  },
  companionCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
  },
  companionAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 30,
  },
  companionInfo: {
    flex: 1,
  },
  companionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  companionRole: {
    fontSize: 16,
    marginBottom: 8,
  },
  companionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    backgroundColor: 'rgba(30,30,30,0.95)',
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    paddingVertical: 16,
    shadowColor: '#8E2DE2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    marginRight: 8,
  },
});

export default DemoCompanionSelect; 