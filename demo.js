import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

// Simple self-contained demo app
const RootsApp = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Simplified slides data directly in the component
  const slides = [
    {
      id: '1',
      title: 'Welcome to Roots',
      description: 'Your personal AI companion for mental wellness, fitness tracking, and building healthier habits.',
      icon: '🌱',
      color: '#8E2DE2'
    },
    {
      id: '2',
      title: 'Personalized Support',
      description: 'Our AI companions learn from your needs and provide customized advice, exercises, and motivation.',
      icon: '🧠',
      color: '#11998e'
    },
    {
      id: '3',
      title: 'Track Your Progress',
      description: 'Monitor your mood, sleep patterns, and daily habits. Visualize improvements over time.',
      icon: '📊',
      color: '#FC466B'
    },
    {
      id: '4',
      title: 'Chat Anytime, Anywhere',
      description: 'Connect with your AI companion through WhatsApp for convenient check-ins throughout your day.',
      icon: '💬',
      color: '#FFD700'
    },
  ];

  // Simulate app loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      alert('Demo completed! In a real app, you would move to the next screen.');
    }
  };

  const handleSkip = () => {
    alert('Demo skipped! In a real app, you would skip to the registration/login screen.');
  };

  // Loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8E2DE2" />
          <Text style={styles.loadingText}>Loading Roots Demo...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Main demo screen
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: slides[currentSlide].color }]}>
      <StatusBar barStyle="light-content" />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
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

// Export component
export default RootsApp; 