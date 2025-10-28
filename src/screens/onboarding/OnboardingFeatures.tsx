import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  useWindowDimensions,
  ScrollView,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type OnboardingFeaturesProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'OnboardingFeatures'>;
};

const { width } = Dimensions.get('window');

// Feature data
interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
}

const features: FeatureItem[] = [
  {
    id: '1',
    title: 'Personal AI Companion',
    description: 'Your AI assistant learns from your interactions to provide tailored support for your well-being journey.',
    icon: 'person-circle',
    backgroundColor: '#ff8c42'
  },
  {
    id: '2',
    title: 'WhatsApp Integration',
    description: 'Connect with your companion through WhatsApp for convenient check-ins throughout your day.',
    icon: 'logo-whatsapp',
    backgroundColor: '#25D366'
  },
  {
    id: '3',
    title: 'Mood & Habit Tracking',
    description: 'Monitor your well-being patterns with intelligent tracking tools that help identify areas for improvement.',
    icon: 'analytics',
    backgroundColor: '#d81159'
  },
  {
    id: '4',
    title: 'Community Connection',
    description: 'Connect with like-minded individuals in your local area for in-person meetups and events.',
    icon: 'people',
    backgroundColor: '#0496ff'
  }
];

const OnboardingFeatures: React.FC<OnboardingFeaturesProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNext = () => {
    if (currentIndex < features.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollViewRef.current?.scrollTo({
        x: windowWidth * (currentIndex + 1),
        animated: true
      });
    } else {
      navigation.navigate('OnboardingPermissions');
    }
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingPermissions');
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / windowWidth);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const renderFeatureItem = (item: FeatureItem, index: number) => {
    return (
      <View key={item.id} style={[styles.slideContainer, { width: windowWidth }]}>
        <View style={[styles.featureContainer, { backgroundColor: item.backgroundColor }]}>
          <Animatable.View 
            animation="zoomIn" 
            duration={500} 
            style={styles.iconContainer}
          >
            <Ionicons name={item.icon} size={60} color="#FFFFFF" />
          </Animatable.View>
        </View>

        <Animatable.View 
          animation="fadeInUp" 
          duration={500} 
          delay={200}
          style={styles.textContainer}
        >
          <Text style={styles.featureTitle}>{item.title}</Text>
          <Text style={styles.featureDescription}>{item.description}</Text>
        </Animatable.View>
      </View>
    );
  };

  const buttonText = currentIndex === features.length - 1 ? 'Continue' : 'Next';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a3c39" />
      
      <Image
        source={require('../../../assets/little-girl.jpg')}
        style={styles.backgroundImage}
      />
      
      <View style={styles.overlay}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {features.map((item, index) => renderFeatureItem(item, index))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.paginationContainer}>
            {features.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex ? styles.paginationDotActive : {}
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>{buttonText}</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.nextButtonIcon} />
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  featureContainer: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer: {
    width: '60%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  featureDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 6,
  },
  paginationDotActive: {
    backgroundColor: '#ff6b3d',
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6b3d',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButtonIcon: {
    marginLeft: 6,
  },
});

export default OnboardingFeatures; 