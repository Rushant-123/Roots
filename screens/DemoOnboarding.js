import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  SafeAreaView,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Demo icons (emoji as a fallback if vector icons aren't working)
const SLIDE_ICONS = ['🌱', '🧠', '📊', '💬'];

const DemoOnboarding = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Simplified slides data
  const slides = [
    {
      id: '1',
      title: 'Welcome to Roots',
      description: 'Your personal AI companion for mental wellness, fitness tracking, and building healthier habits.',
      icon: SLIDE_ICONS[0],
    },
    {
      id: '2',
      title: 'Personalized Support',
      description: 'Our AI companions learn from your needs and provide customized advice, exercises, and motivation.',
      icon: SLIDE_ICONS[1],
    },
    {
      id: '3',
      title: 'Track Your Progress',
      description: 'Monitor your mood, sleep patterns, and daily habits. Visualize improvements over time.',
      icon: SLIDE_ICONS[2],
    },
    {
      id: '4',
      title: 'Chat Anytime, Anywhere',
      description: 'Connect with your AI companion through WhatsApp for convenient check-ins throughout your day.',
      icon: SLIDE_ICONS[3],
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Try to navigate or show a success message
      try {
        navigation.navigate('DemoCompanionSelect');
      } catch (error) {
        console.error('Navigation error:', error);
        alert('Successfully completed onboarding!');
      }
    }
  };

  const handleSkip = () => {
    try {
      navigation.navigate('DemoCompanionSelect');
    } catch (error) {
      console.error('Navigation error:', error);
      alert('Skipped to the next screen!');
    }
  };

  const getGradientColors = () => {
    // Different gradient colors for each slide
    const gradients = [
      ['#8E2DE2', '#4A00E0'],  // Purple to Indigo
      ['#11998e', '#38ef7d'],  // Green to Teal
      ['#FC466B', '#3F5EFB'],  // Pink to Blue
      ['#FFD700', '#FF8C00'],  // Gold to Orange
    ];
    
    return gradients[currentSlide % gradients.length];
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{slides[currentSlide].icon}</Text>
          </View>
          
          <View style={styles.slideContainer}>
            <Text style={styles.title}>{slides[currentSlide].title}</Text>
            <Text style={styles.description}>{slides[currentSlide].description}</Text>
          </View>
          
          <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide ? styles.dotActive : styles.dotInactive
                ]}
              />
            ))}
          </View>
          
          <View style={styles.buttonsContainer}>
            {currentSlide < slides.length - 1 ? (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            ) : null}
            
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  icon: {
    fontSize: 80,
  },
  slideContainer: {
    width: width - 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 20,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: 'white',
    transform: [{scale: 1.2}],
  },
  dotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  skipButton: {
    position: 'absolute',
    left: 20,
    bottom: 0,
  },
  skipButtonText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});

export default DemoOnboarding; 