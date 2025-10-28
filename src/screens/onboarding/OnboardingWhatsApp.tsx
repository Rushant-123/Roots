import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Linking,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type OnboardingWhatsAppProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'OnboardingWhatsApp'>;
};

const OnboardingWhatsApp: React.FC<OnboardingWhatsAppProps> = ({ navigation }) => {
  const [connectingStatus, setConnectingStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');

  const handleConnectWhatsApp = async () => {
    setConnectingStatus('connecting');
    
    try {
      // In a real implementation, you would:
      // 1. Generate a WhatsApp deeplink or QR code
      // 2. Direct user to WhatsApp with a specific message or action
      // 3. Handle callback when they return to the app
      
      // For demo purposes, we'll just simulate opening WhatsApp
      const whatsappUrl = 'whatsapp://send?phone=1234567890&text=Hello!%20I%27m%20connecting%20my%20Thryv%20app';
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        // Simulate successful connection after a delay
        setTimeout(() => {
          setConnectingStatus('success');
        }, 2000);
      } else {
        setConnectingStatus('error');
      }
    } catch (error) {
      console.error('Error connecting to WhatsApp:', error);
      setConnectingStatus('error');
    }
  };

  const handleSkip = () => {
    navigation.navigate('CompanionSelectionScreen');
  };

  const handleContinue = () => {
    navigation.navigate('CompanionSelectionScreen');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#25D366" />
      
      <Image
        source={require('../../../assets/onboarding-wa.jpg')}
        style={styles.backgroundImage}
      />
      
      <View style={styles.overlay}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animatable.View 
            animation="fadeIn" 
            duration={1000}
            style={styles.headerContent}
          >
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={2000}
              style={styles.iconContainer}
            >
              <Ionicons name="logo-whatsapp" size={60} color="#FFFFFF" />
            </Animatable.View>
            
            <Animatable.Text
              animation="fadeInUp"
              duration={800}
              style={styles.title}
            >
              Connect with WhatsApp
            </Animatable.Text>
            
            <Animatable.Text
              animation="fadeInUp"
              duration={800}
              delay={300}
              style={styles.subtitle}
            >
              Link your WhatsApp account to chat with your AI companion anytime, anywhere
            </Animatable.Text>
          </Animatable.View>
          
          <View style={styles.content}>
            <Animatable.View 
              animation="fadeInUp" 
              duration={800} 
              delay={600}
              style={styles.benefitsContainer}
            >
              <Text style={styles.benefitsTitle}>Benefits of WhatsApp Integration</Text>
              
              <View style={styles.benefitItem}>
                <Ionicons name="chatbubble-ellipses" size={24} color="#ffffff" style={styles.benefitIcon} />
                <View style={styles.benefitTextContainer}>
                  <Text style={styles.benefitTitle}>24/7 Access</Text>
                  <Text style={styles.benefitDescription}>Chat with your AI companion anytime through WhatsApp messages</Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="notifications" size={24} color="#ffffff" style={styles.benefitIcon} />
                <View style={styles.benefitTextContainer}>
                  <Text style={styles.benefitTitle}>Personalized Prompts</Text>
                  <Text style={styles.benefitDescription}>Receive customized check-ins and wellness insights</Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="lock-closed" size={24} color="#ffffff" style={styles.benefitIcon} />
                <View style={styles.benefitTextContainer}>
                  <Text style={styles.benefitTitle}>End-to-End Encryption</Text>
                  <Text style={styles.benefitDescription}>Your conversations remain private and secure</Text>
                </View>
              </View>
            </Animatable.View>
            
            <Animatable.View 
              animation="fadeInUp" 
              duration={800} 
              delay={900}
              style={styles.buttonContainer}
            >
              <TouchableOpacity 
                style={[
                  styles.connectButton,
                  connectingStatus === 'connecting' && styles.connectingButton,
                  connectingStatus === 'success' && styles.successButton,
                  connectingStatus === 'error' && styles.errorButton
                ]}
                onPress={handleConnectWhatsApp}
                disabled={connectingStatus === 'connecting' || connectingStatus === 'success'}
              >
                {connectingStatus === 'idle' && (
                  <>
                    <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.connectButtonText}>Connect with WhatsApp</Text>
                  </>
                )}
                
                {connectingStatus === 'connecting' && (
                  <>
                    <Animatable.View animation="rotate" iterationCount="infinite" duration={1000}>
                      <Ionicons name="sync" size={24} color="#FFFFFF" />
                    </Animatable.View>
                    <Text style={styles.connectButtonText}>Connecting...</Text>
                  </>
                )}
                
                {connectingStatus === 'success' && (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.connectButtonText}>Connected Successfully</Text>
                  </>
                )}
                
                {connectingStatus === 'error' && (
                  <>
                    <Ionicons name="alert-circle" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.connectButtonText}>Connection Failed - Retry</Text>
                  </>
                )}
              </TouchableOpacity>
              
              {connectingStatus !== 'success' && (
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>
              )}
              
              {connectingStatus === 'success' && (
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.continueButtonIcon} />
                </TouchableOpacity>
              )}
            </Animatable.View>
          </View>
        </ScrollView>
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
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContent: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  benefitsContainer: {
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 15,
    borderRadius: 12,
  },
  benefitIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6b3d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  connectingButton: {
    backgroundColor: '#f9a825',
  },
  successButton: {
    backgroundColor: '#43A047',
  },
  errorButton: {
    backgroundColor: '#F44336',
  },
  buttonIcon: {
    marginRight: 10,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6b3d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButtonIcon: {
    marginLeft: 10,
  },
});

export default OnboardingWhatsApp; 