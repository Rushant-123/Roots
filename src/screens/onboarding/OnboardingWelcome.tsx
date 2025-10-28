import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type OnboardingWelcomeProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'OnboardingWelcome'>;
};

const { width, height } = Dimensions.get('window');

const OnboardingWelcome = ({ navigation }: OnboardingWelcomeProps) => {
  
  useEffect(() => {
    // Hide status bar for immersive experience
    StatusBar.setHidden(true);
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  const handleGetStarted = () => {
    navigation.navigate('OnboardingFeatures');
  };

  return (
    <ImageBackground
      source={require('../../../assets/onboarding-bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Animatable.View
          animation="fadeIn"
          duration={1000}
          delay={300}
          style={styles.contentContainer}
        >
          <Animatable.View
            animation="zoomIn"
            duration={800}
            delay={500}
            style={styles.logoContainer}
          >
            <View style={styles.logoInner}>
              <Ionicons name="leaf" size={60} color="#FFFFFF" />
            </View>
          </Animatable.View>

          <Animatable.Text
            animation="fadeInUp"
            duration={800}
            delay={800}
            style={styles.title}
          >
            Welcome to{' '}
            <Text style={styles.titleHighlight}>Thryv</Text>
          </Animatable.Text>

          <Animatable.Text
            animation="fadeInUp"
            duration={800}
            delay={1000}
            style={styles.subtitle}
          >
            Your personal AI companion for wellness, mindfulness, and building healthier habits
          </Animatable.Text>

          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={1200}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeIn"
          duration={1000}
          delay={1500}
          style={styles.floatingElements}
        >
          <View style={[styles.floatingCircle, styles.floatingCircle1]} />
          <View style={[styles.floatingCircle, styles.floatingCircle2]} />
          <View style={[styles.floatingCircle, styles.floatingCircle3]} />
        </Animatable.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(74, 60, 57, 0.65)',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 107, 61, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 42,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  titleHighlight: {
    color: '#ff6b3d',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
    paddingHorizontal: 20,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 107, 61, 0.95)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  floatingElements: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: -1,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.4,
  },
  floatingCircle1: {
    width: 120,
    height: 120,
    backgroundColor: '#ffbf69',
    top: height * 0.1,
    left: width * 0.1,
  },
  floatingCircle2: {
    width: 80,
    height: 80,
    backgroundColor: '#0496ff',
    top: height * 0.15,
    right: width * 0.15,
  },
  floatingCircle3: {
    width: 150,
    height: 150,
    backgroundColor: '#25D366',
    bottom: height * 0.1,
    right: width * 0.2,
  },
});

export default OnboardingWelcome; 