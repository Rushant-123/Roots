import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import LottieView from 'lottie-react-native';

type OnboardingCompleteProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'OnboardingComplete'>;
};

const { width, height } = Dimensions.get('window');

const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ navigation }) => {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Hide the animation after 5 seconds
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    // Navigate to the main app
    // Normally you would do something like:
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'MainApp' }]
    // });
    
    // For demo purposes, we'll just console log
    console.log("Onboarding complete! Starting the app...");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a3c39" />
      
      <Image
        source={require('../../../assets/onboarding-done.jpg')}
        style={styles.backgroundImage}
      />
      
      <View style={styles.overlay}>
        {showAnimation && (
          <View style={styles.confettiContainer}>
            <LottieView
              source={require('../../../assets/animations/confetti.json')}
              autoPlay
              loop={false}
              style={styles.confetti}
              resizeMode="cover"
            />
          </View>
        )}
        
        <Animatable.View 
          animation="zoomIn" 
          duration={800} 
          style={styles.iconContainer}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={80} color="#FFFFFF" />
          </View>
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeInUp" 
          duration={800} 
          delay={400}
          style={styles.contentContainer}
        >
          <Text style={styles.title}>Setup Complete!</Text>
          <Text style={styles.message}>
            You're all set to start your wellness journey. Your AI companion is ready to assist you 24/7.
          </Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>24/7 WhatsApp support</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Personalized recommendations</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>AI companion tailored to your needs</Text>
            </View>
          </View>
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeInUp" 
          duration={800}
          delay={600}
          style={styles.footer}
        >
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#ff6b3d" style={styles.buttonIcon} />
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
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  confettiContainer: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 10,
  },
  confetti: {
    width: width,
    height: height,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 80 : 60,
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 30,
    lineHeight: 24,
  },
  featuresContainer: {
    alignSelf: 'flex-start',
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  getStartedButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  getStartedButtonText: {
    color: '#25D366',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default OnboardingComplete; 