import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ImageBackground,
  StatusBar,
  ScrollView,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Navigation type
type RootStackParamList = {
  OnboardingPermissions: undefined;
  OnboardingWhatsApp: undefined;
  OnboardingCompanion: undefined;
  CompanionSelectionScreen: undefined;
  OnboardingLocation: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Get screen dimensions
const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

// Companion interface
interface Companion {
  id: string;
  name: string;
  avatar: string;
  role: string;
  description: string;
  color: string;
  benefit: string; // Add direct benefit statement
  stats: {
    empathy: number;
    wisdom: number;
    energy: number;
    creativity: number;
    structure: number;
  };
  abilities: string[];
  sampleMessages: string[];
}

// Sample companions data with clear benefit statements
const companions: Companion[] = [
  {
    id: 'scarlet',
    name: 'Scarlet',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    role: 'Intimacy Guide',
    description: 'Scarlet helps you explore intimate emotions in a safe, non-judgmental space. She provides guidance on relationships, desire, and personal boundaries.',
    color: '#E53935',
    benefit: "I will help you understand your sexuality and intimacy needs and build better connections with yourself and your partner.",
    stats: {
      empathy: 85,
      wisdom: 78,
      energy: 70,
      creativity: 90,
      structure: 65
    },
    abilities: ['Emotional Insight', 'Boundary Setting', 'Relationship Mastery'],
    sampleMessages: [
      "Hi there! I'm Scarlet. I'm here to help you explore your emotions in a safe, non-judgmental space.",
      "What aspects of your relationships would you like to explore today?",
      "Remember, understanding your emotions is a natural part of self-discovery."
    ]
  },
  {
    id: 'sneha',
    name: 'Sneha',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    role: 'Emotional Wellness Coach',
    description: 'Sneha helps you navigate your emotional journey. She guides you in building better, healthier relationships with yourself and others.',
    color: '#4CAF50',
    benefit: "I will guide you through emotional challenges and help you build healthier relationships with yourself and others.",
    stats: {
      empathy: 95,
      wisdom: 80,
      energy: 65,
      creativity: 70,
      structure: 75
    },
    abilities: ['Emotion Balancing', 'Mindfulness Training', 'Stress Shield'],
    sampleMessages: [
      "Hello, I'm Sneha. I'm here to support your emotional journey and help you build meaningful connections.",
      "How have you been feeling about your relationships lately?",
      "It takes courage to explore your emotions. I'm here to support you every step of the way."
    ]
  },
  {
    id: 'jason',
    name: 'Jason',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    role: 'Fitness & Wellness Coach',
    description: 'Jason helps you build a better and healthier lifestyle. From nutrition to exercise routines, he supports your journey to improved wellbeing.',
    color: '#2196F3',
    benefit: "I will create personalized health routines and help you build sustainable habits for lasting physical wellness.",
    stats: {
      empathy: 70,
      wisdom: 75,
      energy: 95,
      creativity: 65,
      structure: 85
    },
    abilities: ['Energy Boost', 'Nutrition Planning', 'Habit Formation'],
    sampleMessages: [
      "Hey there! I'm Jason. Ready to transform your lifestyle and feel your absolute best?",
      "What specific health goals are you working towards right now?",
      "Remember: small, consistent changes lead to big results over time."
    ]
  },
  {
    id: 'hritik',
    name: 'Hritik',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    role: 'Career Success Mentor',
    description: 'Hritik helps you build career success. He provides guidance on professional development, goal setting, and achieving your ambitions.',
    color: '#9C27B0',
    benefit: "I will help you define career goals, overcome workplace challenges, and develop skills for professional advancement.",
    stats: {
      empathy: 75,
      wisdom: 90,
      energy: 80,
      creativity: 70,
      structure: 95
    },
    abilities: ['Goal Setting', 'Time Management', 'Success Planning'],
    sampleMessages: [
      "Hello, I'm Hritik. I'm here to help you navigate your career path and achieve professional success.",
      "What career challenges are you currently facing?",
      "Success is a journey, not a destination. Let's work together to reach your goals."
    ]
  }
];

const CompanionSelectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{text: string, isUser: boolean}[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Set up animation values
  const position = useRef(new Animated.ValueXY()).current;
  const swipeOpacity = useRef(new Animated.Value(1)).current;
  const nextCardScale = useRef(new Animated.Value(0.9)).current;
  
  // Handle card swiping with PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // When touch starts, store the initial position
        position.flattenOffset();
      },
      onPanResponderMove: (_, gesture) => {
        // Only allow horizontal movement (left/right)
        position.setValue({ x: gesture.dx, y: 0 });
        
        // Adjust opacity based on swipe distance
        if (gesture.dx > 0) {
          swipeOpacity.setValue(1 - Math.min(0.6, Math.abs(gesture.dx) / (CARD_WIDTH * 1.2)));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        position.flattenOffset();
        
        // If swiped far enough to the right, go to next card
        if (gesture.dx > CARD_WIDTH * 0.4) {
          Animated.spring(position, {
            toValue: { x: CARD_WIDTH * 1.5, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            position.setValue({ x: 0, y: 0 });
            swipeOpacity.setValue(1);
            setCurrentIndex(prev => (prev === companions.length - 1 ? 0 : prev + 1));
          });
        } 
        // If swiped far enough to the left, go to previous card
        else if (gesture.dx < -CARD_WIDTH * 0.4) {
          Animated.spring(position, {
            toValue: { x: -CARD_WIDTH * 1.5, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            position.setValue({ x: 0, y: 0 });
            swipeOpacity.setValue(1);
            setCurrentIndex(prev => (prev === 0 ? companions.length - 1 : prev - 1));
          });
        } 
        // If not swiped far enough, return to center
        else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
          Animated.timing(swipeOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // Reset position if interaction is cancelled
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          useNativeDriver: false,
        }).start();
        Animated.timing(swipeOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;
  
  // Open chat preview with selected companion
  const openChatPreview = (companion: Companion) => {
    setSelectedCompanion(companion);
    setChatMessages([
      { text: companion.sampleMessages[0], isUser: false }
    ]);
    setShowChatModal(true);
  };
  
  // Send a message in the chat preview
  const sendMessage = () => {
    if (!message.trim() || !selectedCompanion) return;
    
    // Add user message
    const updatedChat = [
      ...chatMessages,
      { text: message, isUser: true }
    ];
    setChatMessages(updatedChat);
    setMessage('');
    
    // Simulate companion response
    setTimeout(() => {
      const responseIndex = Math.min(chatMessages.length, selectedCompanion.sampleMessages.length - 1);
      setChatMessages([
        ...updatedChat,
        { text: selectedCompanion.sampleMessages[responseIndex], isUser: false }
      ]);
    }, 1000);
  };
  
  // View companion details
  const viewCompanionDetails = (companion: Companion) => {
    setSelectedCompanion(companion);
    setShowDetails(true);
  };
  
  // Choose the selected companion
  const selectCompanion = () => {
    if (!selectedCompanion) return;
    navigation.navigate('OnboardingLocation');
  };
  
  // Go back to list view
  const goBackToList = () => {
    setShowDetails(false);
  };
  
  // Handle selecting current card
  const selectCurrentCompanion = () => {
    viewCompanionDetails(companions[currentIndex]);
  };
  
  // Skip to next card manually
  const skipToNext = () => {
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: CARD_WIDTH * 1.5, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(swipeOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.spring(nextCardScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: false,
      }),
    ]).start(() => {
      const nextIndex = (currentIndex + 1) % companions.length;
      setCurrentIndex(nextIndex);
      position.setValue({ x: 0, y: 0 });
      swipeOpacity.setValue(1);
      nextCardScale.setValue(0.9);
    });
  };
  
  // Render a chat message
  const renderChatMessage = ({ item }: { item: {text: string, isUser: boolean} }) => (
    <View style={[styles.messageBubble, item.isUser ? styles.userMessage : styles.companionMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );
  
  // Render a stat bar
  const renderStatBar = (statName: string, value: number, color: string) => (
    <View style={styles.statRow}>
      <Text style={styles.statName}>{statName}</Text>
      <View style={styles.statBarBackground}>
        <View style={[styles.statBarFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
  
  // Function to handle card tap
  const handleCardTap = () => {
    setSelectedCompanion(companions[currentIndex]);
    setShowDetails(true);
  };
  
  // Function to get custom gradient colors based on companion
  const getCompanionGradient = (companion: Companion) => {
    switch(companion.id) {
      case 'scarlet': 
        return `linear-gradient(180deg, rgba(229, 57, 53, 0.4) 0%, rgba(183, 28, 28, 0.6) 100%)`;
      case 'sneha':
        return `linear-gradient(180deg, rgba(76, 175, 80, 0.4) 0%, rgba(27, 94, 32, 0.6) 100%)`;
      case 'jason':
        return `linear-gradient(180deg, rgba(33, 150, 243, 0.4) 0%, rgba(13, 71, 161, 0.6) 100%)`;
      case 'hritik':
        return `linear-gradient(180deg, rgba(156, 39, 176, 0.4) 0%, rgba(74, 20, 140, 0.6) 100%)`;
      default:
        return `linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.8) 100%)`;
    }
  };

  // Function to get a companion's theme color with transparency
  const getCompanionColor = (companion: Companion, opacity: number = 0.75) => {
    // Extract the base color and add opacity
    const hexColor = companion.color;
    if (hexColor.startsWith('#')) {
      return hexColor + Math.round(opacity * 255).toString(16).padStart(2, '0');
    }
    return hexColor;
  };
  
  // Main render
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Using the custom cosmic background image created by the user */}
      <ImageBackground 
        source={require('../../../assets/select-comp.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Decorative elements */}
          <View style={styles.topDecoration}>
            <View style={styles.circleDecoration1} />
            <View style={styles.circleDecoration2} />
          </View>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => showDetails ? goBackToList() : navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {!showDetails ? (
            // Swipe card view
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.titleContainer}>
                <Text style={styles.screenTitle}>Choose Your{'\n'}Companion</Text>
                <Text style={styles.screenSubtitle}>
                  Swipe to explore companions.{'\n'}
                  Tap a card to view details and select
                </Text>
              </View>
              
              {/* Card stack - make sure it has enough height */}
              <View style={styles.cardStack}>
                {/* Current card with swipe behavior */}
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.companionCard,
                    {
                      opacity: swipeOpacity,
                      transform: [
                        { translateX: position.x },
                        { rotate: position.x.interpolate({
                          inputRange: [-width / 2, 0, width / 2],
                          outputRange: ['-10deg', '0deg', '10deg'],
                          extrapolate: 'clamp',
                        }) },
                      ],
                    }
                  ]}
                >
                  <TouchableOpacity 
                    activeOpacity={0.9} 
                    onPress={handleCardTap}
                    style={styles.cardTouchable}
                  >
                    <View style={[
                      styles.cardGradient,
                      { 
                        borderColor: companions[currentIndex].color + '80',
                        borderWidth: 1,
                        backgroundColor: 'rgba(15,15,25,0.85)',
                      }
                    ]}>
                      {/* Color bar at top */}
                      <View style={[
                        styles.colorBar,
                        { backgroundColor: companions[currentIndex].color }
                      ]} />
                      
                      {/* Avatar section */}
                      <View style={styles.avatarSection}>
                        <View style={[
                          styles.avatarContainer,
                          { borderColor: companions[currentIndex].color }
                        ]}>
                          <Image 
                            source={{ uri: companions[currentIndex].avatar }} 
                            style={styles.avatar} 
                          />
                        </View>
                      </View>
                      
                      {/* Content section */}
                      <View style={styles.cardContent}>
                        <Text style={styles.name}>{companions[currentIndex].name}</Text>
                        <Text style={styles.role}>{companions[currentIndex].role}</Text>
                        
                        <View style={[
                          styles.benefitContainer,
                          { backgroundColor: companions[currentIndex].color + '20' }
                        ]}>
                          <Text style={styles.benefitText}>
                            "{companions[currentIndex].benefit}"
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </View>
              
              {/* Navigation dots */}
              <View style={styles.dotsContainer}>
                {companions.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.dot,
                      currentIndex === index ? styles.activeDot : {}
                    ]} 
                  />
                ))}
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.skipButton, {flex: 1, marginRight: 10}]}
                  onPress={skipToNext}
                >
                  <Text style={styles.skipText}>Next Companion</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.previewCardButton, 
                    { 
                      backgroundColor: companions[currentIndex].color + '90',
                      flex: 1,
                      marginLeft: 10
                    }
                  ]}
                  onPress={handleCardTap}
                >
                  <Text style={styles.previewCardButtonText}>Preview Details</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            // Detail view
            <ScrollView contentContainerStyle={styles.detailsContainer}>
              <View style={[
                styles.detailCard,
                { 
                  borderColor: companions[currentIndex].color + '80',
                  borderWidth: 1,
                }
              ]}>
                <View style={styles.detailBackdrop}>
                  <View style={[
                    styles.backdropCircle1,
                    { backgroundColor: companions[currentIndex].color + '30' }
                  ]} />
                  <View style={[
                    styles.backdropCircle2,
                    { backgroundColor: companions[currentIndex].color + '20' }
                  ]} />
                </View>

                <View style={[
                  styles.avatarDetailContainer, 
                  { 
                    borderColor: companions[currentIndex].color,
                    width: 126, // Adjusted to match avatar size + border
                    height: 126, // Adjusted to match avatar size + border
                    borderRadius: 63, // Half of width/height
                    justifyContent: 'center',
                    alignItems: 'center'
                  }
                ]}>
                  <Image 
                    source={{ uri: companions[currentIndex].avatar }} 
                    style={styles.detailAvatar} 
                  />
                </View>
                
                <Text style={styles.detailName}>{companions[currentIndex].name}</Text>
                <Text style={styles.detailRole}>{companions[currentIndex].role}</Text>
                
                <View style={styles.separator} />
                
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.detailDescription}>{companions[currentIndex].description}</Text>
                
                <View style={styles.separator} />
                
                <Text style={styles.sectionTitle}>Skills & Abilities</Text>
                <View style={styles.statsContainer}>
                  {renderStatBar('Empathy', companions[currentIndex].stats.empathy, companions[currentIndex].color)}
                  {renderStatBar('Wisdom', companions[currentIndex].stats.wisdom, companions[currentIndex].color)}
                  {renderStatBar('Energy', companions[currentIndex].stats.energy, companions[currentIndex].color)}
                  {renderStatBar('Creativity', companions[currentIndex].stats.creativity, companions[currentIndex].color)}
                  {renderStatBar('Structure', companions[currentIndex].stats.structure, companions[currentIndex].color)}
                </View>
                
                <View style={styles.abilitiesContainer}>
                  {companions[currentIndex].abilities.map((ability, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.abilityTag, 
                        { 
                          backgroundColor: companions[currentIndex].color + '20',
                          borderColor: companions[currentIndex].color + '40' 
                        }
                      ]}
                    >
                      <Text style={[styles.abilityText, { color: '#fff' }]}>{ability}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.separator} />
                
                <View style={styles.actionsContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.actionButton,
                      { backgroundColor: 'rgba(255,255,255,0.15)' }
                    ]}
                    onPress={() => openChatPreview(companions[currentIndex])}
                  >
                    <Text style={styles.actionButtonText}>Preview Chat</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.actionButton, 
                      { backgroundColor: companions[currentIndex].color }
                    ]}
                    onPress={selectCompanion}
                  >
                    <Text style={styles.primaryButtonText}>Select {companions[currentIndex].name}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </ImageBackground>
      
      {/* Chat Preview Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChatModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}
        >
          <View style={[
            styles.chatModal,
            { borderColor: selectedCompanion?.color, borderTopWidth: 3 }
          ]}>
            <View style={[
              styles.chatHeader, 
              { backgroundColor: selectedCompanion?.color }
            ]}>
              {selectedCompanion && (
                <>
                  <Image 
                    source={{ uri: selectedCompanion.avatar }} 
                    style={styles.chatAvatar} 
                  />
                  <Text style={styles.chatName}>{selectedCompanion.name}</Text>
                </>
              )}
              <TouchableOpacity 
                onPress={() => setShowChatModal(false)} 
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={chatMessages}
              renderItem={renderChatMessage}
              keyExtractor={(_, index) => index.toString()}
              style={styles.chatMessages}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            />
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                returnKeyType="send"
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity 
                onPress={sendMessage} 
                style={styles.sendButton}
                disabled={!message.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={24} 
                  color={!message.trim() ? '#555' : (selectedCompanion?.color || '#4CAF50')} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  screenTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  screenSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  cardStack: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    height: 550, // Increased height for more text space
  },
  companionCard: {
    width: CARD_WIDTH,
    height: 520, // Increased height for more text space
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  cardTouchable: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    justifyContent: 'space-between',
  },
  colorBar: {
    height: 6,
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  avatarContainer: {
    padding: 3,
    borderRadius: 50,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  role: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    textAlign: 'center',
  },
  benefitContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    width: '100%',
  },
  benefitText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tapHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
  tapHint: {
    color: '#fff',
    fontSize: 14,
    marginRight: 5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  previewCardButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  previewCardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    flexGrow: 1,
    padding: 20,
  },
  detailCard: {
    backgroundColor: 'rgba(20,20,30,0.9)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  detailAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  detailName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  detailRole: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    alignSelf: 'flex-start',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  detailDescription: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 30,
    backgroundColor: 'rgba(30,30,40,0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statName: {
    color: '#fff',
    width: 90,
    fontSize: 15,
  },
  statBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    color: '#fff',
    width: 30,
    textAlign: 'right',
    fontSize: 15,
    marginLeft: 10,
  },
  abilitiesContainer: {
    width: '100%',
    marginBottom: 30,
    backgroundColor: 'rgba(30,30,40,0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  abilityTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  abilityText: {
    fontWeight: '600',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  chatModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 0,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
    backgroundColor: '#222',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: '#333',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  companionMessage: {
    backgroundColor: '#444',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    color: '#fff',
  },
  sendButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    marginBottom: 10,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 0,
    opacity: 0.3,
  },
  circleDecoration1: {
    position: 'absolute',
    top: -160,
    right: -160,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
  },
  circleDecoration2: {
    position: 'absolute',
    top: -120,
    left: -140,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
  },
  avatarDetailContainer: {
    padding: 3,
    borderRadius: 65,
    borderWidth: 3,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  detailBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backdropCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.5,
  },
  backdropCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.4,
  },
  previewButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginHorizontal: 20,
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CompanionSelectionScreen; 