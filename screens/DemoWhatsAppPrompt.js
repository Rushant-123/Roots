import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DemoWhatsAppPrompt = () => {
  const navigation = useNavigation();

  const handleContinue = () => {
    navigation.navigate('DemoHome');
  };

  const handleSkip = () => {
    navigation.navigate('DemoHome');
  };

  return (
    <View style={styles.container}>
      <Animatable.View 
        animation="fadeIn" 
        duration={1000} 
        style={styles.content}
      >
        <View style={styles.whatsappPromptCard}>
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite" 
            duration={2500}
            style={styles.whatsappIconContainer}
          >
            <Icon name="whatsapp" size={80} color="#25D366" />
          </Animatable.View>
          
          <Text style={styles.cardTitle}>Connect with WhatsApp</Text>
          
          <Text style={styles.cardText}>
            Link your WhatsApp account to chat with your AI companion through your favorite messaging app.
          </Text>
          
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Connect WhatsApp</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  whatsappPromptCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  whatsappIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
    lineHeight: 24,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#25D366', // WhatsApp green
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginTop: 8,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  skipText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default DemoWhatsAppPrompt; 