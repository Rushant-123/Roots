import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
  Platform,
  Dimensions,
  Animated,
  Easing,
  PanResponder,
  ImageBackground,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { RouteProp } from '@react-navigation/native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { ExpoWebGLRenderingContext } from 'expo-gl';
import * as THREE from 'three';
import { Audio } from 'expo-av';

// Global variables for GLView access
let globalGameState: GameState = 'MAP';
let globalIsMoving: boolean = false;
let globalSelectedCompanion: Companion | null = null;
let globalDialogueIndex: number = 0;
let globalMovePlayerFn: ((direction: Direction) => void) | null = null;

type OnboardingCompanionProps = {
  navigation: StackNavigationProp<OnboardingStackParamList, 'OnboardingCompanion'>;
  route: RouteProp<OnboardingStackParamList, 'OnboardingCompanion'>;
};

const { width, height } = Dimensions.get('window');

// Game states
type GameState = 'MAP' | 'ENCOUNTER' | 'DIALOGUE' | 'SELECTION';

// Map tile types
type TileType = 'grass' | 'tallGrass' | 'path' | 'water' | 'building' | 'tree' | 'bridge' | 'flowers';

// Map definition
interface MapTile {
  type: TileType;
  encounterRate?: number;
  walkable: boolean;
  isElevated?: boolean;
}

// Directions
type Direction = 'up' | 'down' | 'left' | 'right';

// Enhanced Companion interface
interface Companion {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  color: string;
  ethnicity: string[];
  personality: string[];
  type: 'Wellness' | 'Fitness' | 'Mindfulness' | 'Nutrition' | 'Mental Health';
  level: number;
  abilities: string[];
  stats: {
    empathy: number;
    wisdom: number;
    energy: number;
    creativity: number;
    structure: number;
  };
  dialogues: string[];
  imageUrl: string;
  mapPosition?: { x: number, y: number };
}

// Define companions data
const companionData: Companion[] = [
  {
    id: '1',
    name: 'Dr. Ritika Sharma',
    role: 'Wellness & Mindfulness Guide',
    description: 'Specializes in holistic well-being practices, incorporating Ayurvedic principles with modern wellness techniques.',
    avatar: '🧘‍♀️',
    color: '#8E2DE2',
    ethnicity: ['Indian'],
    personality: ['Calm', 'Wise', 'Nurturing'],
    type: 'Mindfulness',
    level: 28,
    abilities: ['Meditation Mastery', 'Stress Shield', 'Ayurvedic Insight'],
    stats: {
      empathy: 85,
      wisdom: 90,
      energy: 65,
      creativity: 75,
      structure: 70
    },
    dialogues: [
      "I sense you're seeking balance in your life. Let's discover that together.",
      "The journey to wellness begins with a single breath. Shall we start?",
      "Your potential for growth is boundless, like a lotus rising from muddy waters."
    ],
    imageUrl: 'https://img.freepik.com/free-photo/young-woman-sits-lotus-pose-meditates-home-selective-focus_1150-43376.jpg',
    mapPosition: { x: 5, y: 7 }
  },
  {
    id: '2',
    name: 'Arjun Kumar',
    role: 'Fitness & Nutrition Coach',
    description: 'Combines traditional Indian dietary wisdom with contemporary fitness science to create balanced lifestyle plans.',
    avatar: '💪',
    color: '#FF5722',
    ethnicity: ['Indian'],
    personality: ['Energetic', 'Motivating', 'Practical'],
    type: 'Fitness',
    level: 31,
    abilities: ['Energy Boost', 'Habit Formation', 'Diet Planning'],
    stats: {
      empathy: 70,
      wisdom: 75,
      energy: 95,
      creativity: 65,
      structure: 85
    },
    dialogues: [
      "Every step you take is progress! Ready to transform together?",
      "Your body is capable of amazing things. Let me help you discover its potential!",
      "Strength isn't just physical - it's mental too. I'll help you build both."
    ],
    imageUrl: 'https://img.freepik.com/free-photo/indian-man-working-out-exercise-outdoors_53876-96547.jpg',
    mapPosition: { x: 12, y: 3 }
  },
  {
    id: '3',
    name: 'Dr. Mei Lin',
    role: 'Mental Wellness Specialist',
    description: 'Integrates Eastern philosophy with cognitive behavioral techniques to promote mental clarity and emotional balance.',
    avatar: '🌱',
    color: '#4CAF50',
    ethnicity: ['East Asian'],
    personality: ['Thoughtful', 'Balanced', 'Insightful'],
    type: 'Mental Health',
    level: 33,
    abilities: ['Thought Clarity', 'Emotion Balance', 'Cognitive Restructuring'],
    stats: {
      empathy: 92,
      wisdom: 88,
      energy: 70,
      creativity: 80,
      structure: 75
    },
    dialogues: [
      "The mind is like a garden - with proper care, beautiful thoughts can bloom.",
      "I'm here to help you navigate through the fog and find your inner peace.",
      "Balance in thought leads to balance in life. Shall we find yours together?"
    ],
    imageUrl: 'https://img.freepik.com/free-photo/asian-female-psychologist-talking-with-her-patient_23-2149011326.jpg',
    mapPosition: { x: 9, y: 8 }
  },
  {
    id: '4',
    name: 'Hiroshi Tanaka',
    role: 'Life Balance Coach',
    description: 'Helps you achieve harmony between work, personal life, and health using principles of mindfulness and efficiency.',
    avatar: '⚖️',
    color: '#2196F3',
    ethnicity: ['East Asian'],
    personality: ['Methodical', 'Calm', 'Disciplined'],
    type: 'Wellness',
    level: 29,
    abilities: ['Time Management', 'Stress Reduction', 'Work-Life Harmony'],
    stats: {
      empathy: 75,
      wisdom: 82,
      energy: 68,
      creativity: 70,
      structure: 95
    },
    dialogues: [
      "Your path to balance begins with understanding your priorities. What matters most to you?",
      "Efficiency and mindfulness may seem opposed, but they complement each other beautifully.",
      "A structured approach to wellness creates space for spontaneity and joy."
    ],
    imageUrl: 'https://img.freepik.com/free-photo/portrait-japanese-businessman-working-office_23-2149175150.jpg',
    mapPosition: { x: 10, y: 10 }
  },
  {
    id: '5',
    name: 'Emma Peterson',
    role: 'Positive Psychology Coach',
    description: 'Focuses on building resilience, optimism, and personal strengths through evidence-based psychological approaches.',
    avatar: '😊',
    color: '#9C27B0',
    ethnicity: ['Western'],
    personality: ['Upbeat', 'Encouraging', 'Analytical'],
    type: 'Mental Health',
    level: 27,
    abilities: ['Strength Spotting', 'Happiness Boosting', 'Resilience Building'],
    stats: {
      empathy: 88,
      wisdom: 76,
      energy: 90,
      creativity: 85,
      structure: 72
    },
    dialogues: [
      "What went well for you today? Even small moments deserve celebration.",
      "Your strengths are unique - let's discover how to use them more intentionally.",
      "Optimism isn't about ignoring problems, but approaching them with confidence and hope."
    ],
    imageUrl: 'https://img.freepik.com/free-photo/smiley-woman-office_23-2148917568.jpg',
    mapPosition: { x: 11, y: 11 }
  },
  {
    id: '6',
    name: 'Dr. James Wilson',
    role: 'Cognitive Performance Expert',
    description: 'Specializes in enhancing mental performance, focus, and productivity through data-driven techniques.',
    avatar: '🧠',
    color: '#3F51B5',
    ethnicity: ['Western'],
    personality: ['Precise', 'Innovative', 'Direct'],
    type: 'Mental Health',
    level: 32,
    abilities: ['Focus Enhancement', 'Memory Optimization', 'Cognitive Efficiency'],
    stats: {
      empathy: 65,
      wisdom: 90,
      energy: 75,
      creativity: 70,
      structure: 88
    },
    dialogues: [
      "Your mind is like a powerful computer. Let's optimize its performance together.",
      "Small adjustments to your cognitive habits can yield remarkable improvements.",
      "The science is clear: mental performance is trainable. Let's get to work."
    ],
    imageUrl: 'https://img.freepik.com/free-photo/portrait-smiling-young-man-eyewear_171337-4842.jpg',
    mapPosition: { x: 12, y: 12 }
  },
  {
    id: '7',
    name: 'Amara Okafor',
    role: 'Holistic Health Guide',
    description: 'Combines traditional African wellness knowledge with modern health science for comprehensive well-being support.',
    avatar: '🌿',
    color: '#FF9800',
    ethnicity: ['African'],
    personality: ['Warm', 'Spiritual', 'Community-focused'],
    type: 'Wellness',
    level: 30,
    abilities: ['Traditional Healing', 'Community Connection', 'Spiritual Wellness'],
    stats: {
      empathy: 90,
      wisdom: 86,
      energy: 80,
      creativity: 78,
      structure: 65
    },
    dialogues: [
      "True healing comes when we honor our connection to ourselves, others, and the earth.",
      "Ancient wisdom and modern science both hold valuable keys to your wellness journey.",
      "Your health story is part of a larger community narrative. How can we write it together?"
    ],
    imageUrl: 'https://img.freepik.com/free-photo/cheerful-african-american-woman-business-attire-smiling-office_1258-26811.jpg',
    mapPosition: { x: 13, y: 13 }
  },
  {
    id: '8',
    name: 'Sofia Rodriguez',
    role: 'Lifestyle & Happiness Coach',
    description: 'Brings vibrant energy to help you discover joy in everyday routines and build sustainable healthy habits.',
    avatar: '💃',
    color: '#E91E63',
    ethnicity: ['Latin American'],
    personality: ['Passionate', 'Social', 'Expressive'],
    type: 'Wellness',
    level: 26,
    abilities: ['Joy Cultivation', 'Social Connection', 'Habit Formation'],
    stats: {
      empathy: 86,
      wisdom: 72,
      energy: 95,
      creativity: 90,
      structure: 68
    },
    dialogues: [
      "Life is meant to be vibrant! Let's infuse your routines with energy and passion.",
      "Connection with others fuels our happiness. How can we strengthen your social bonds?",
      "Small, joyful habits build upon each other to create a fulfilling lifestyle."
    ],
    imageUrl: 'https://img.freepik.com/free-photo/cheerful-beautiful-young-latina-woman_1262-2102.jpg',
    mapPosition: { x: 14, y: 14 }
  },
  {
    id: '9',
    name: 'Dr. Fatima Al-Zahra',
    role: 'Balance & Mindfulness Guide',
    description: 'Integrates ancient Middle Eastern wisdom with contemporary wellness approaches for holistic life improvement.',
    avatar: '☯️',
    color: '#009688',
    ethnicity: ['Middle Eastern'],
    personality: ['Reflective', 'Wise', 'Patient'],
    type: 'Mindfulness',
    level: 34,
    abilities: ['Deep Reflection', 'Mindful Presence', 'Wisdom Integration'],
    stats: {
      empathy: 87,
      wisdom: 94,
      energy: 70,
      creativity: 82,
      structure: 78
    },
    dialogues: [
      "Wisdom comes from the desert of silence and reflection. Let us journey there together.",
      "Balance is not static, but a dynamic dance between different aspects of your life.",
      "Ancient traditions teach us that presence is the doorway to transformation."
    ],
    imageUrl: 'https://img.freepik.com/free-photo/arab-muslim-woman-working-office_144627-43251.jpg',
    mapPosition: { x: 15, y: 15 }
  }
];

// Map layout creation with more Pokémon-like features
const createMapLayout = (): MapTile[][] => {
  const layout: MapTile[][] = [];
  
  // Initialize with grass
  for (let y = 0; y < 20; y++) {
    const row: MapTile[] = [];
    for (let x = 0; x < 20; x++) {
      row.push({ 
        type: 'grass', 
        encounterRate: 0,
        walkable: true 
      });
    }
    layout.push(row);
  }
  
  // Add tall grass patches (for encounters)
  // Top-left patch
  for (let y = 2; y < 6; y++) {
    for (let x = 2; x < 6; x++) {
      layout[y][x] = { 
        type: 'tallGrass', 
        encounterRate: 0.15, // 15% chance of encounter when walking
        walkable: true 
      };
    }
  }
  
  // Right side patch
  for (let y = 8; y < 12; y++) {
    for (let x = 12; x < 17; x++) {
      layout[y][x] = { 
        type: 'tallGrass', 
        encounterRate: 0.15,
        walkable: true 
      };
    }
  }
  
  // Bottom patch
  for (let y = 14; y < 18; y++) {
    for (let x = 5; x < 10; x++) {
      layout[y][x] = { 
        type: 'tallGrass', 
        encounterRate: 0.15,
        walkable: true 
      };
    }
  }
  
  // Add main paths
  for (let x = 1; x < 19; x++) {
    layout[7][x] = { type: 'path', walkable: true };
  }
  
  for (let y = 1; y < 19; y++) {
    layout[y][10] = { type: 'path', walkable: true };
  }
  
  // Add flower decorations along paths
  layout[6][3] = { type: 'flowers', walkable: true };
  layout[6][7] = { type: 'flowers', walkable: true };
  layout[6][13] = { type: 'flowers', walkable: true };
  layout[6][17] = { type: 'flowers', walkable: true };
  layout[8][3] = { type: 'flowers', walkable: true };
  layout[8][7] = { type: 'flowers', walkable: true };
  layout[8][13] = { type: 'flowers', walkable: true };
  layout[8][17] = { type: 'flowers', walkable: true };
  
  // Add buildings (Pokémon centers, gyms, etc.)
  layout[3][14] = { type: 'building', walkable: false, isElevated: true };
  layout[3][15] = { type: 'building', walkable: false, isElevated: true };
  layout[4][14] = { type: 'building', walkable: false, isElevated: true };
  layout[4][15] = { type: 'building', walkable: false, isElevated: true };
  
  layout[15][3] = { type: 'building', walkable: false, isElevated: true };
  layout[15][4] = { type: 'building', walkable: false, isElevated: true };
  layout[16][3] = { type: 'building', walkable: false, isElevated: true };
  layout[16][4] = { type: 'building', walkable: false, isElevated: true };
  
  // Add trees as obstacles
  for (let i = 0; i < 20; i++) {
    // Border trees
    if (i > 0 && i < 19) {
      layout[0][i] = { type: 'tree', walkable: false, isElevated: true };
      layout[19][i] = { type: 'tree', walkable: false, isElevated: true };
      layout[i][0] = { type: 'tree', walkable: false, isElevated: true };
      layout[i][19] = { type: 'tree', walkable: false, isElevated: true };
    }
  }
  
  // Add random trees as obstacles
  const treePositions = [
    {x: 5, y: 11}, {x: 12, y: 5}, {x: 17, y: 17}, {x: 3, y: 17},
    {x: 2, y: 9}, {x: 14, y: 2}, {x: 8, y: 18}, {x: 18, y: 8}
  ];
  
  treePositions.forEach(pos => {
    layout[pos.y][pos.x] = { type: 'tree', walkable: false, isElevated: true };
  });
  
  // Add water (small pond)
  for (let y = 12; y < 15; y++) {
    for (let x = 14; x < 18; x++) {
      layout[y][x] = { type: 'water', walkable: false };
    }
  }
  
  // Add bridge over water
  layout[13][14] = { type: 'bridge', walkable: true };
  layout[13][15] = { type: 'bridge', walkable: true };
  layout[13][16] = { type: 'bridge', walkable: true };
  layout[13][17] = { type: 'bridge', walkable: true };
  
  return layout;
};

// Define sprites with fallback colors
const sprites = {
  player: {
    up: null,
    down: null,
    left: null,
    right: null,
  },
  tiles: {
    grass: null,
    tallGrass: null,
    water: null,
    tree: null,
    path: null,
    building: null,
  }
};

// Fallback colors for tiles when sprites are not available
const fallbackColors = {
  grass: '#8BC34A',
  tallGrass: '#558B2F',
  path: '#D7CCC8',
  water: '#64B5F6',
  tree: '#33691E',
  building: '#FFECB3',
  bridge: '#8D6E63',
  flowers: '#E91E63',
};

// Define sound effects
const soundEffects = {
  walk: null, // require('../../../assets/sounds/walk.mp3'),
  encounter: null, // require('../../../assets/sounds/encounter.mp3'),
  select: null, // require('../../../assets/sounds/select.mp3'),
  talk: null, // require('../../../assets/sounds/talk.mp3')
};

// Add these interfaces at the top of the file with other interfaces

// Collidable object interface
interface Collidable {
  position: THREE.Vector3;
  radius: number;
  mesh: THREE.Object3D;
  type: 'water' | 'tree' | 'building' | 'companion';
  companionId?: string;
}

// Visible companion interface
interface VisibleCompanion {
  data: Companion;
  model: THREE.Object3D;
  position: THREE.Vector3;
}

const OnboardingCompanion: React.FC<OnboardingCompanionProps> = ({ navigation, route }) => {
  // Game state
  const [gameState, setGameState] = useState<GameState>('MAP');
  const [currentCompanion, setCurrentCompanion] = useState<Companion | null>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  
  // Player state
  const [isMoving, setIsMoving] = useState(false);
  const [lastDirection, setLastDirection] = useState<Direction>('down');
  const [animationFrame, setAnimationFrame] = useState(0);
  const playerAnimRef = useRef(new Animated.Value(0)).current;
  
  // Map related state
  const [playerPosition, setPlayerPosition] = useState({ x: 10, y: 10 });
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const [mapLayout] = useState<MapTile[][]>(createMapLayout());
  const [waterAnimFrame, setWaterAnimFrame] = useState(0);
  const [showEncounterAnimation, setShowEncounterAnimation] = useState(false);
  const [encounterAnimProgress, setEncounterAnimProgress] = useState(0);
  
  // Tile size and visible area
  const tileSize = Math.floor(width / 11); // Show 11x11 tiles for better visibility
  const visibleTilesX = Math.ceil(width / tileSize);
  const visibleTilesY = Math.ceil(height / tileSize);
  const halfVisibleTilesX = Math.floor(visibleTilesX / 2);
  const halfVisibleTilesY = Math.floor(visibleTilesY / 2);
  
  // Sound effects state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Animations and effects
  useEffect(() => {
    // Animate water tiles
    const waterAnimInterval = setInterval(() => {
      setWaterAnimFrame((prev) => (prev + 1) % 3);
    }, 500);
    
    return () => {
      clearInterval(waterAnimInterval);
      // Clean up sound
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);
  
  // Update the playSound function to handle null sound files
  const playSound = async (soundType: 'walk' | 'encounter' | 'select' | 'talk') => {
    try {
      if (!soundEffects[soundType]) {
        // No sound file available, just return
        return;
      }
      
      const { sound } = await Audio.Sound.createAsync(soundEffects[soundType]);
      setSound(sound);
      await sound.playAsync();
      
      // Unload sound after playing
      setTimeout(() => {
        if (sound) {
          sound.unloadAsync();
        }
      }, 1000);
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };
  
  // Animation for player walking
  const startWalkAnimation = () => {
    setAnimationFrame((prev) => (prev + 1) % 3);
    playSound('walk');
  };
  
  // Handle player movement
  const movePlayer = (direction: Direction) => {
    if (isMoving || gameState !== 'MAP') return;
    
    setLastDirection(direction);
    
    let dx = 0, dy = 0;
    switch (direction) {
      case 'up':
        dy = -1;
        break;
      case 'down':
        dy = 1;
        break;
      case 'left':
        dx = -1;
        break;
      case 'right':
        dx = 1;
        break;
    }
    
    if (dx !== 0 || dy !== 0) {
      const newX = playerPosition.x + dx;
      const newY = playerPosition.y + dy;
      
      // Check if movement is valid (within bounds and to a walkable tile)
      if (newX >= 0 && newX < mapLayout[0].length &&
          newY >= 0 && newY < mapLayout.length &&
          mapLayout[newY][newX].walkable) {
        
        // Start movement animation
        setIsMoving(true);
        startWalkAnimation();
        
        // Update player position
        setPlayerPosition({ x: newX, y: newY });
        
        // Check for companion encounter at new position
        checkForCompanionEncounter(newX, newY);
        
        // Reset moving flag after animation completes
        setTimeout(() => {
          setIsMoving(false);
        }, 200);
      }
    }
  };
  
  // Check for encounters in tall grass
  const checkForCompanionEncounter = (x: number, y: number) => {
    const tile = mapLayout[y][x];
    
    // Check for random encounters in tall grass
    if (tile.type === 'tallGrass' && tile.encounterRate && Math.random() < tile.encounterRate) {
      // Start encounter animation
      setShowEncounterAnimation(true);
      playSound('encounter');
      
      // Animate encounter effect
      let progress = 0;
      const encounterAnimInterval = setInterval(() => {
        progress += 0.1;
        setEncounterAnimProgress(progress);
        
        if (progress >= 1) {
          clearInterval(encounterAnimInterval);
          setShowEncounterAnimation(false);
          
          // Select a random companion for the encounter
          const randomCompanionIndex = Math.floor(Math.random() * companionData.length);
          setCurrentCompanion(companionData[randomCompanionIndex]);
          setGameState('ENCOUNTER');
        }
      }, 100);
    }
    
    // Check if player is standing on a companion position
    const companion = companionData.find(c => 
      c.mapPosition && c.mapPosition.x === x && c.mapPosition.y === y
    );
    
    if (companion) {
      playSound('talk');
      setCurrentCompanion(companion);
      setGameState('DIALOGUE');
    }
  };
  
  // Start dialogue with companion
  const startDialogue = () => {
    playSound('talk');
    setSelectedCompanion(currentCompanion);
    setDialogueIndex(0);
    setGameState('DIALOGUE');
  };
  
  // Advance to next dialogue
  const advanceDialogue = () => {
    playSound('select');
    if (selectedCompanion && dialogueIndex < selectedCompanion.dialogues.length - 1) {
      setDialogueIndex(dialogueIndex + 1);
    } else {
      setGameState('SELECTION');
    }
  };
  
  // Select companion
  const selectCompanion = (companion: Companion) => {
    playSound('select');
    Alert.alert(
      "Companion Selected!",
      `You've chosen ${companion.name} as your wellness companion!`,
      [
        {
          text: "Continue",
          onPress: () => {
            navigation.navigate('CompanionSelectionScreen');
          }
        }
      ]
    );
  };
  
  // Define animation references
  const [waterAnimation] = useState(new Animated.Value(0));
  const [playerBounceAnimation] = useState(new Animated.Value(0));

  // Define player position
  const playerTranslateX = useRef(new Animated.Value(0)).current;
  const playerTranslateY = useRef(new Animated.Value(0)).current;

  // Start water animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(waterAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      })
    ).start();
    
    // Start player idle animation (subtle bounce)
    Animated.loop(
      Animated.sequence([
        Animated.timing(playerBounceAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(playerBounceAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ])
    ).start();
  }, []);

  // Updated renderTileContent function
  const renderTileContent = (tileType: TileType) => {
    // Render based on tile type
    switch (tileType) {
      case 'grass':
        return (
          <View style={[styles.tileBase, { backgroundColor: getTileColor(tileType) }]}>
            {renderTileImage(sprites.tiles.grass, getTileColor(tileType))}
          </View>
        );
      case 'tallGrass':
        return (
          <View style={[styles.tileBase, { backgroundColor: getTileColor('grass') }]}>
            {renderTileImage(sprites.tiles.tallGrass, getTileColor('grass'))}
            <View style={styles.grassTuftsContainer}>
              <View style={styles.grassTuft1} />
              <View style={styles.grassTuft2} />
              <View style={styles.grassTuft3} />
            </View>
          </View>
        );
      case 'water':
        return (
          <View style={[styles.tileBase, { backgroundColor: getTileColor(tileType) }]}>
            {renderTileImage(sprites.tiles.water, getTileColor(tileType))}
            <Animated.View 
              style={[
                styles.waterRipple, 
                { 
                  opacity: waterAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 0.5, 0.3]
                  }),
                  transform: [{
                    translateY: waterAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 2, 0]
                    })
                  }]
                }
              ]} 
            />
          </View>
        );
      case 'tree':
        return (
          <View style={styles.treeContainer}>
            {renderTileImage(sprites.tiles.tree, '#2E7D32')}
            <View style={styles.treeTrunk} />
            <View style={styles.treeLeaves} />
          </View>
        );
      case 'building':
        return (
          <View style={styles.buildingContainer}>
            {renderTileImage(sprites.tiles.building, '#FFECB3')}
            <View style={styles.buildingRoof} />
            <View style={styles.buildingWall}>
              <View style={styles.buildingWindow} />
              <View style={styles.buildingDoor} />
            </View>
          </View>
        );
      case 'path':
        return (
          <View style={[styles.tileBase, { backgroundColor: getTileColor(tileType) }]}>
            {renderTileImage(sprites.tiles.path, getTileColor(tileType))}
          </View>
        );
      case 'bridge':
        return (
          <View style={[styles.tileBase, { backgroundColor: '#8D6E63' }]}>
            <View style={{ 
              width: '100%', 
              height: '100%', 
              borderWidth: 2, 
              borderColor: '#5D4037',
              justifyContent: 'space-around',
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <View style={{ width: 2, height: '90%', backgroundColor: '#5D4037' }} />
              <View style={{ width: 2, height: '90%', backgroundColor: '#5D4037' }} />
            </View>
          </View>
        );
      case 'flowers':
        return (
          <View style={[styles.tileBase, { backgroundColor: getTileColor('grass') }]}>
            {renderTileImage(sprites.tiles.grass, getTileColor('grass'))}
            <View style={styles.flowersContainer}>
              <View style={styles.flower1} />
              <View style={styles.flower2} />
              <View style={styles.flower3} />
            </View>
          </View>
        );
      default:
        return (
          <View style={[styles.tileBase, { backgroundColor: getTileColor(tileType) }]} />
        );
    }
  };
  
  // Update renderTileImage to use fallback colors
  const renderTileImage = (imageSource: any, fallbackColor: string) => {
    // Just use fallback colors since images aren't loading
    return <View style={{ flex: 1, backgroundColor: fallbackColor }} />;
  };
  
  // Fix renderPlayerSprite function
  const renderPlayerSprite = () => {
    const facing = lastDirection || 'down';
    
    return (
      <Animated.View
        style={[
          styles.playerContainer,
          {
            transform: [
              { translateX: playerTranslateX },
              { translateY: playerTranslateY }
            ]
          }
        ]}
      >
        <View style={styles.playerShadow} />
        <Animated.View
          style={[
            styles.playerSprite,
            {
              transform: [
                {
                  translateY: playerBounceAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, -3, 0]
                  })
                }
              ]
            }
          ]}
        >
          {renderTileImage(sprites.player[facing as keyof typeof sprites.player], '#FFD54F')}
        </Animated.View>
      </Animated.View>
    );
  };
  
  // Render companion NPCs on the map
  const renderNPC = (companion: Companion) => {
    if (!companion.mapPosition) return null;
    
    const { x, y } = companion.mapPosition;
    
    // Calculate screen position
    const screenX = ((x - playerPosition.x + halfVisibleTilesX) * tileSize) + viewportOffset.x;
    const screenY = ((y - playerPosition.y + halfVisibleTilesY) * tileSize) + viewportOffset.y;
    
    // Only render if on screen
    if (screenX < -tileSize || screenX > width || screenY < -tileSize || screenY > height) {
      return null;
    }
    
    // Check if player is nearby
    const isPlayerNearby = Math.abs(x - playerPosition.x) <= 2 && Math.abs(y - playerPosition.y) <= 2;
    
    return (
      <View 
        style={[
          styles.npcContainer,
          {
            width: tileSize,
            height: tileSize * 1.2,
            left: screenX,
            top: screenY - (tileSize * 0.2), // Slight offset for proper placement
          }
        ]}
      >
        <View style={styles.npcTrainer}>
          <View style={styles.npcShadow} />
          <View style={[styles.npcAvatar, { backgroundColor: companion.color }]}>
            <Text style={styles.npcEmoji}>{companion.avatar}</Text>
          </View>
        </View>
        
        {/* Speech indicator when player is nearby */}
        {isPlayerNearby && (
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite" 
            style={styles.speechIndicator}
          >
            <Text style={styles.speechIndicatorText}>!</Text>
          </Animatable.View>
        )}
      </View>
    );
  };
  
  // Fix the renderMapTile function to add key props
  const renderMapTile = (x: number, y: number) => {
    const tile = mapLayout[y][x];
    const isCurrentPosition = playerPosition.x === x && playerPosition.y === y;
    
    // Calculate position
    const tileX = (x - playerPosition.x + Math.floor(visibleTilesX / 2)) * tileSize;
    const tileY = (y - playerPosition.y + Math.floor(visibleTilesY / 2)) * tileSize;
    
    return (
      <View
        key={`tile-${x}-${y}`}
        style={[
          styles.mapTile,
          {
            width: tileSize,
            height: tileSize,
            left: tileX,
            top: tileY,
            zIndex: tile.isElevated ? 100 : 1
          }
        ]}
      >
        {renderTileContent(tile.type)}
        
        {/* 3D side effect for elevated tiles */}
        {tile.isElevated && (
          <View
            style={[
              styles.tileSide,
              { backgroundColor: getSideShadowColor(tile.type) }
            ]}
          />
        )}
        
        {/* Companion on this tile */}
        {!isCurrentPosition && 
          companionData.find(c => 
            c.mapPosition && c.mapPosition.x === x && c.mapPosition.y === y
          ) && 
          renderNPC(companionData.find(c => 
            c.mapPosition && c.mapPosition.x === x && c.mapPosition.y === y
          )!)
        }
      </View>
    );
  };
  
  // Get the base color for each tile type
  const getTileColor = (tileType: TileType): string => {
    switch (tileType) {
      case 'grass':
        return fallbackColors.grass;
      case 'tallGrass':
        return fallbackColors.tallGrass;
      case 'path':
        return fallbackColors.path;
      case 'water':
        return fallbackColors.water;
      case 'tree':
        return fallbackColors.tree;
      case 'building':
        return fallbackColors.building;
      case 'bridge':
        return fallbackColors.bridge;
      case 'flowers':
        return fallbackColors.flowers;
      default:
        return '#CCCCCC';
    }
  };
  
  // Get shadow color for 3D effect
  const getSideShadowColor = (tileType: TileType): string => {
    // Create darker version of the tile color for 3D effect
    const baseColor = getTileColor(tileType);
    return shadeColor(baseColor, -30); // Darken by 30%
  };
  
  // Helper to darken/lighten colors
  const shadeColor = (color: string, percent: number): string => {
    // Simple implementation that works for hex colors
    if (color.startsWith('#')) {
      let R = parseInt(color.substring(1, 3), 16);
      let G = parseInt(color.substring(3, 5), 16);
      let B = parseInt(color.substring(5, 7), 16);

      R = Math.floor(R * (100 + percent) / 100);
      G = Math.floor(G * (100 + percent) / 100);
      B = Math.floor(B * (100 + percent) / 100);

      R = (R < 255) ? R : 255;
      G = (G < 255) ? G : 255;
      B = (B < 255) ? B : 255;

      R = (R > 0) ? R : 0;
      G = (G > 0) ? G : 0;
      B = (B > 0) ? B : 0;

      return `#${(R.toString(16).padStart(2, '0'))
        + (G.toString(16).padStart(2, '0'))
        + (B.toString(16).padStart(2, '0'))}`;
    }
    return color;
  };
  
  // Create pan responder for swipe controls
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gameState !== 'MAP' || isMoving) return;
        
        const { dx, dy } = gestureState;
        
        // Determine the primary direction of movement
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal movement
          if (dx > 20) {
            movePlayer('right');
          } else if (dx < -20) {
            movePlayer('left');
          }
        } else {
          // Vertical movement
          if (dy > 20) {
            movePlayer('down');
          } else if (dy < -20) {
            movePlayer('up');
          }
        }
      }
    })
  ).current;
  
  // Render map view
  const renderMap = () => {
    return (
      <View style={styles.mapContainer}>
        <GLView
          style={{ flex: 1 }}
          onContextCreate={setupThreeJsScene}
        />
        
        {/* Unity Game Launch Button - Prominent version */}
        <View style={styles.gameButtonContainer}>
          <TouchableOpacity 
            style={styles.gameButton}
            onPress={() => navigation.navigate('CompanionSelectionScreen')}
          >
            <Ionicons name="people" size={28} color="#fff" />
            <Text style={styles.gameButtonText}>Choose Your Companion</Text>
          </TouchableOpacity>
          <Text style={styles.gameButtonSubtext}>Find your perfect AI companion for your journey</Text>
        </View>
        
        {/* D-pad controls */}
        <View style={styles.dPadContainer}>
          {/* Up */}
          <TouchableOpacity
            style={[styles.dPadButton, styles.dPadUp]}
            onPress={() => globalMovePlayerFn && globalMovePlayerFn('up')}
          >
            <Ionicons name="chevron-up" size={30} color="#fff" />
          </TouchableOpacity>
          
          {/* Middle row - left and right */}
          <View style={styles.dPadMiddleRow}>
            <TouchableOpacity
              style={[styles.dPadButton, styles.dPadLeft]}
              onPress={() => globalMovePlayerFn && globalMovePlayerFn('left')}
            >
              <Ionicons name="chevron-back" size={30} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.dPadCenter} />
            
            <TouchableOpacity
              style={[styles.dPadButton, styles.dPadRight]}
              onPress={() => globalMovePlayerFn && globalMovePlayerFn('right')}
            >
              <Ionicons name="chevron-forward" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Down */}
          <TouchableOpacity
            style={[styles.dPadButton, styles.dPadDown]}
            onPress={() => globalMovePlayerFn && globalMovePlayerFn('down')}
          >
            <Ionicons name="chevron-down" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Render encounter screen
  const renderEncounter = () => {
    if (!currentCompanion) return null;
    
    return (
      <View style={styles.encounterContainer}>
        <Animatable.View animation="fadeIn" duration={300} style={styles.encounterBackground}>
          <Animatable.View animation="pulse" iterationCount="infinite" duration={2000} style={styles.encounterGrass}>
            <Text style={styles.encounterGrassEmoji}>🌿🌿🌿</Text>
          </Animatable.View>
          
          <Animatable.View 
            animation="bounceIn" 
            duration={800}
            style={styles.encounterImageContainer}
          >
            <Image 
              source={{ uri: currentCompanion.imageUrl }} 
              style={styles.encounterImage}
              resizeMode="cover"
            />
          </Animatable.View>
          
          <Animatable.Text animation="fadeInDown" style={styles.encounterText}>
            A wild {currentCompanion.name} appeared!
          </Animatable.Text>
          
          <Animatable.View 
            animation="fadeIn" 
            delay={500}
            style={styles.encounterInfoBox}
          >
            <Text style={styles.encounterName}>{currentCompanion.name}</Text>
            <Text style={styles.encounterLevel}>Lvl {currentCompanion.level}</Text>
            <Text style={styles.encounterType}>{currentCompanion.type}</Text>
          </Animatable.View>
          
          <Animatable.View 
            animation="fadeInUp" 
            delay={800}
            style={styles.encounterButtonsContainer}
          >
            <TouchableOpacity 
              style={styles.encounterButton}
              onPress={startDialogue}
            >
              <Text style={styles.encounterButtonText}>Talk</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.encounterButton, styles.encounterButtonSecondary]}
              onPress={() => setGameState('MAP')}
            >
              <Text style={styles.encounterButtonText}>Run</Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
      </View>
    );
  };
  
  // Render dialogue screen
  const renderDialogue = () => {
    if (!selectedCompanion) return null;
    
    return (
      <View style={styles.dialogueScreen}>
        <View style={styles.dialogueContainer}>
          <Image 
            source={{ uri: selectedCompanion.imageUrl }} 
            style={styles.dialogueCompanionImage} 
            resizeMode="cover"
          />
          <View style={styles.dialogueContent}>
            <Text style={styles.dialogueName}>{selectedCompanion.name}</Text>
            <Text style={styles.dialogueText}>{selectedCompanion.dialogues[dialogueIndex]}</Text>
            <TouchableOpacity 
              style={styles.dialogueTapArea} 
              onPress={() => {
                if (dialogueIndex < selectedCompanion.dialogues.length - 1) {
                  advanceDialogue();
                } else {
                  setGameState('MAP');
                }
              }}
            >
              <Text style={styles.dialogueTapText}>
                {dialogueIndex < selectedCompanion.dialogues.length - 1 ? 'Tap to continue...' : 'Continue exploring...'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  // Render selection screen
  const renderSelection = () => {
    if (!currentCompanion) return null;
    
    return (
      <View style={styles.selectionContainer}>
        <View style={styles.selectionHeader}>
          <Text style={styles.selectionTitle}>Choose This Companion?</Text>
        </View>
        
        <View style={styles.selectionContent}>
          <View style={styles.selectionImageContainer}>
            <Image 
              source={{ uri: currentCompanion.imageUrl }} 
              style={styles.selectionImage}
              resizeMode="cover"
            />
            <View style={[styles.selectionTypeTag, { backgroundColor: currentCompanion.color }]}>
              <Text style={styles.selectionTypeText}>{currentCompanion.type}</Text>
            </View>
          </View>
          
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionName}>{currentCompanion.name}</Text>
            <Text style={styles.selectionRole}>{currentCompanion.role}</Text>
            
            <View style={styles.selectionStats}>
              {Object.entries(currentCompanion.stats).map(([stat, value]) => (
                <View key={stat} style={styles.statItem}>
                  <Text style={styles.statName}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</Text>
                  <View style={styles.statBarContainer}>
                    <View 
                      style={[
                        styles.statFill, 
                        { 
                          width: `${value}%`,
                          backgroundColor: currentCompanion.color 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.statValue}>{value}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.selectionAbilities}>
              <Text style={styles.abilitiesTitle}>Abilities:</Text>
              {currentCompanion.abilities.map((ability, index) => (
                <View key={index} style={styles.abilityItem}>
                  <Ionicons name="flash-outline" size={16} color={currentCompanion.color} />
                  <Text style={styles.abilityName}>{ability}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.selectionButtons}>
          <TouchableOpacity 
            style={[styles.selectionButton, { backgroundColor: currentCompanion.color }]}
            onPress={() => selectCompanion(currentCompanion)}
          >
            <Text style={styles.selectionButtonText}>Choose {currentCompanion.name}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.selectionButtonSecondary}
            onPress={() => setGameState('MAP')}
          >
            <Text style={styles.selectionButtonSecondaryText}>Continue Exploring</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Render based on game state
  const renderGameContent = () => {
    try {
      switch (gameState) {
        case 'MAP':
          return renderMap();
        case 'ENCOUNTER':
          return currentCompanion ? renderEncounter() : renderMap();
        case 'DIALOGUE':
          return selectedCompanion ? renderDialogue() : renderMap();
        case 'SELECTION':
          return currentCompanion ? renderSelection() : renderMap();
        default:
          return renderMap();
      }
    } catch (error) {
      console.error("Error in renderGameContent:", error);
      // Fallback to map if there's an error
      return renderMap();
    }
  };
  
  // Setup Three.js scene
  const setupThreeJsScene = async (gl: ExpoWebGLRenderingContext) => {
    try {
      // Create a scene
      const scene = new THREE.Scene();
      
      // Create skybox with mountains
      const createSkybox = () => {
        const mountainColors = [0x8CB3DE, 0x4B87C5, 0x3277BD, 0x7A99C5];
        
        // Create distant mountains as a backdrop
        const mountainGroup = new THREE.Group();
        
        // Create a circular mountain range around the map
        const mountainSegments = 24;
        const mountainRadius = 150;
        const maxMountainHeight = 60;
        
        for (let i = 0; i < mountainSegments; i++) {
          const angle = (i / mountainSegments) * Math.PI * 2;
          const x = Math.cos(angle) * mountainRadius;
          const z = Math.sin(angle) * mountainRadius;
          
          // Randomly vary mountain height
          const baseHeight = 20 + Math.random() * 40;
          const peakHeight = baseHeight + Math.random() * (maxMountainHeight - baseHeight);
          
          // Create mountain geometry
          const mountainGeometry = new THREE.ConeGeometry(
            15 + Math.random() * 10, // base radius
            peakHeight,
            5 + Math.floor(Math.random() * 4) // segments
          );
          
          // Select random color from mountain palette
          const colorIndex = Math.floor(Math.random() * mountainColors.length);
          const mountainMaterial = new THREE.MeshStandardMaterial({
            color: mountainColors[colorIndex],
            flatShading: true,
            roughness: 0.9,
            metalness: 0.1
          });
          
          const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
          mountain.position.set(x, -5 + (peakHeight/2), z);
          mountain.rotation.y = Math.random() * Math.PI;
          
          mountainGroup.add(mountain);
        }
        
        // Add a blue sky dome
        const skyGeometry = new THREE.SphereGeometry(300, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
          color: 0x87CEEB,
          side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        
        // Add a subtle gradient effect
        const atmosphereGeometry = new THREE.SphereGeometry(299, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.2,
          side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        
        scene.add(mountainGroup);
        scene.add(sky);
        scene.add(atmosphere);
      };
      
      // Create skybox
      createSkybox();
      
      // Set scene background color (visible until skybox is loaded)
      scene.background = new THREE.Color('#87CEEB');
      
      // Create a camera with better perspective
      const camera = new THREE.PerspectiveCamera(
        60, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000
      );
      // Higher position for better overview
      camera.position.set(0, 20, 20);
      camera.lookAt(0, 0, 0);
      
      // Create renderer with better settings
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor('#87CEEB');
      
      // Enhanced lighting for better 3D appearance
      // Ambient light for base illumination
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
      
      // Main directional light (sun)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(-10, 20, 15);
      directionalLight.castShadow = true; // Enable shadows
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 100;
      scene.add(directionalLight);
      
      // Secondary light for better dimension
      const fillLight = new THREE.DirectionalLight(0xffffcc, 0.5);
      fillLight.position.set(10, 10, -10);
      scene.add(fillLight);
      
      // Create the ground plane (grass) with texture
      const groundSize = 200;
      const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8BC34A,
        roughness: 0.8,
        metalness: 0.2,
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2; // Make horizontal
      ground.receiveShadow = true; // Receive shadows for better 3D effect
      ground.userData = { isGround: true, collidable: false }; // Ground shouldn't block movement
      scene.add(ground);
      
      // Store all collidable objects
      const collidables: Collidable[] = [];
      
      // Add enhanced grass patches with better 3D models
      const grassPatches = [];
      const grassAreas = [
        // Tall grass areas (for encounters)
        { minX: -25, maxX: -10, minZ: -25, maxZ: -10, isTall: true, quantity: 150 },
        { minX: 10, maxX: 25, minZ: 10, maxZ: 25, isTall: true, quantity: 150 },
        
        // Regular grass areas (decoration)
        { minX: -40, maxX: 40, minZ: -40, maxZ: 40, isTall: false, quantity: 500 }
      ];
      
      // Add all grass patches
      grassAreas.forEach(area => {
        for (let i = 0; i < area.quantity; i++) {
          const x = area.minX + Math.random() * (area.maxX - area.minX);
          const z = area.minZ + Math.random() * (area.maxZ - area.minZ);
          
          // Don't place grass where there might be other objects
          const distanceFromCenter = Math.sqrt(x*x + z*z);
          if (distanceFromCenter < 3) continue;
          
          const grassPatch = addGrassPatch(scene, x, z, area.isTall);
          grassPatches.push(grassPatch);
        }
      });
      
      // Add water features
      const waterBodies = [
        { x: -30, z: 20, size: 15 },
        { x: 25, z: -15, size: 12 },
        { x: 10, z: 30, size: 8 }
      ];
      
      waterBodies.forEach(water => {
        const waterMesh = addWater(scene, water.x, water.z, water.size);
        collidables.push({
          position: new THREE.Vector3(water.x, 0, water.z),
          radius: water.size / 2,
          mesh: waterMesh,
          type: 'water'
        });
      });
      
      // Add trees for better environment
      const treePositions = [
        // Forest area 1
        ...Array(20).fill(null).map(() => ({ 
          x: -40 + Math.random() * 15, 
          z: -40 + Math.random() * 15 
        })),
        
        // Forest area 2
        ...Array(15).fill(null).map(() => ({ 
          x: 25 + Math.random() * 15, 
          z: 25 + Math.random() * 15 
        })),
        
        // Scattered trees
        ...Array(20).fill(null).map(() => ({ 
          x: -40 + Math.random() * 80, 
          z: -40 + Math.random() * 80 
        }))
      ];
      
      treePositions.forEach(pos => {
        // Don't place trees too close to center or other objects
        const distanceFromCenter = Math.sqrt(pos.x*pos.x + pos.z*pos.z);
        if (distanceFromCenter < 5) return;
        
        // Check if too close to water
        let tooCloseToWater = false;
        waterBodies.forEach(water => {
          const dx = pos.x - water.x;
          const dz = pos.z - water.z;
          const distance = Math.sqrt(dx*dx + dz*dz);
          if (distance < water.size/2 + 3) {
            tooCloseToWater = true;
          }
        });
        
        if (!tooCloseToWater) {
          const tree = addTree(scene, pos.x, pos.z);
          collidables.push({
            position: new THREE.Vector3(pos.x, 0, pos.z),
            radius: 1,  // Collision radius
            mesh: tree,
            type: 'tree'
          });
        }
      });
      
      // Add buildings for landmarks
      const buildings = [
        { x: -20, z: 20, type: 'red' },
        { x: 25, z: -15, type: 'blue' },
        { x: 0, z: -25, type: 'green' }
      ];
      
      buildings.forEach(building => {
        const buildingMesh = addBuilding(scene, building.x, building.z, building.type);
        collidables.push({
          position: new THREE.Vector3(building.x, 0, building.z),
          radius: 3,  // Building collision radius
          mesh: buildingMesh,
          type: 'building'
        });
      });
      
      // Add paths connecting major areas
      addPaths(scene);
      
      // Add companions on the map
      const visibleCompanions: VisibleCompanion[] = [];
      
      companionData.forEach(companion => {
        if (companion.mapPosition) {
          const companionModel = addCompanionToScene(scene, companion);
          visibleCompanions.push({
            data: companion,
            model: companionModel,
            position: new THREE.Vector3(companion.mapPosition.x, 0, companion.mapPosition.y)
          });
          
          // Add to collidables
          collidables.push({
            position: new THREE.Vector3(companion.mapPosition.x, 0, companion.mapPosition.y),
            radius: 1,
            mesh: companionModel,
            type: 'companion',
            companionId: companion.id
          });
        }
      });
      
      // Create a better 3D player character with walking animation
      const playerGroup = new THREE.Group();
      
      // Player body
      const playerBodyGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
      const playerBodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3f51b5,
        roughness: 0.7,
        metalness: 0.3
      });
      const playerBody = new THREE.Mesh(playerBodyGeometry, playerBodyMaterial);
      playerBody.position.y = 1;
      playerBody.castShadow = true;
      playerGroup.add(playerBody);
      
      // Player head
      const playerHeadGeometry = new THREE.SphereGeometry(0.4, 16, 16);
      const playerHeadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffb74d,
        roughness: 0.5,
        metalness: 0.2
      });
      const playerHead = new THREE.Mesh(playerHeadGeometry, playerHeadMaterial);
      playerHead.position.y = 2;
      playerHead.castShadow = true;
      playerGroup.add(playerHead);
      
      // Left leg
      const leftLegGeometry = new THREE.CapsuleGeometry(0.2, 1, 4, 8);
      const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x303F9F,
        roughness: 0.7,
        metalness: 0.2
      });
      const leftLeg = new THREE.Mesh(leftLegGeometry, legMaterial);
      leftLeg.position.set(-0.25, 0.1, 0);
      leftLeg.castShadow = true;
      playerGroup.add(leftLeg);
      
      // Right leg
      const rightLegGeometry = new THREE.CapsuleGeometry(0.2, 1, 4, 8);
      const rightLeg = new THREE.Mesh(rightLegGeometry, legMaterial);
      rightLeg.position.set(0.25, 0.1, 0);
      rightLeg.castShadow = true;
      playerGroup.add(rightLeg);
      
      // Arms
      const armGeometry = new THREE.CapsuleGeometry(0.15, 0.7, 4, 8);
      const armMaterial = new THREE.MeshStandardMaterial({
        color: 0x3f51b5,
        roughness: 0.7,
        metalness: 0.3
      });
      
      // Left arm
      const leftArm = new THREE.Mesh(armGeometry, armMaterial);
      leftArm.position.set(-0.65, 1.2, 0);
      leftArm.rotation.z = Math.PI / 16;
      leftArm.castShadow = true;
      playerGroup.add(leftArm);
      
      // Right arm
      const rightArm = new THREE.Mesh(armGeometry, armMaterial);
      rightArm.position.set(0.65, 1.2, 0);
      rightArm.rotation.z = -Math.PI / 16;
      rightArm.castShadow = true;
      playerGroup.add(rightArm);
      
      scene.add(playerGroup);
      
      // Animation variables
      let lastUpdateTime = Date.now();
      let playerDirection = { x: 0, z: 0 };
      let isMoving = false;
      let walkCycle = 0; // For walking animation
      
      // Make global gameState variable accessible
      globalGameState = gameState;
      globalIsMoving = isMoving;
      globalSelectedCompanion = selectedCompanion;
      globalDialogueIndex = dialogueIndex;
      
      // Function to check for collisions
      const checkCollisions = (position: THREE.Vector3): boolean => {
        for (const collidable of collidables) {
          const dx = position.x - collidable.position.x;
          const dz = position.z - collidable.position.z;
          const distance = Math.sqrt(dx*dx + dz*dz);
          
          if (distance < collidable.radius + 0.5) { // 0.5 is player radius
            if (collidable.type === 'companion') {
              // Find the companion object
              const companion = companionData.find(c => c.id === collidable.companionId);
              if (companion) {
                try {
                  setCurrentCompanion(companion);
                  setGameState('DIALOGUE');
                  globalGameState = 'DIALOGUE';
                  playSound('talk');
                } catch (error) {
                  console.error("Error during companion interaction:", error);
                }
              }
            }
            return false; // Collision detected
          }
        }
        return true; // No collision
      };
      
      // Function to update scene
      const updateScene = (time: number) => {
        try {
          const now = Date.now();
          const deltaTime = (now - lastUpdateTime) / 1000;
          lastUpdateTime = now;
          
          // Animate grass blades for wind effect
          scene.traverse((object) => {
            if (object.userData && object.userData.isGrassBlade) {
              object.rotation.y += Math.sin(now / 1000 + object.position.x) * 0.01;
              
              // Add slight wave motion to tall grass
              if (object.userData.isTallGrass) {
                object.position.y = object.userData.originalY + Math.sin(now / 800 + object.position.x * 2) * 0.1;
              }
            }
            
            // Animate water
            if (object.userData && object.userData.isWater) {
              object.position.y = 0.05 + Math.sin(now / 1000 + object.position.x * 0.5) * 0.05;
            }
          });
          
          // Animate companions (subtle idle animation)
          visibleCompanions.forEach(companionObj => {
            if (companionObj.model) {
              // Subtle floating/bobbing effect
              companionObj.model.position.y = 0.1 + Math.sin(now / 1000 + companionObj.position.x) * 0.1;
              // Subtle rotation
              companionObj.model.rotation.y += 0.005;
            }
          });
          
          // Handle player animation
          if (!isMoving) {
            // Idle animation - subtle bouncing
            playerGroup.position.y = Math.sin(now / 500) * 0.05;
            
            // Reset legs to standing position
            leftLeg.rotation.x = 0;
            rightLeg.rotation.x = 0;
            leftArm.rotation.x = 0;
            rightArm.rotation.x = 0;
          } else {
            // Walking animation
            walkCycle += deltaTime * 5; // Speed of animation
            
            // Leg animation
            leftLeg.rotation.x = Math.sin(walkCycle) * 0.5;
            rightLeg.rotation.x = Math.sin(walkCycle + Math.PI) * 0.5;
            
            // Arm animation (opposite to legs)
            leftArm.rotation.x = Math.sin(walkCycle + Math.PI) * 0.3;
            rightArm.rotation.x = Math.sin(walkCycle) * 0.3;
            
            // Subtle body bobbing
            playerGroup.position.y = Math.abs(Math.sin(walkCycle)) * 0.1;
          }
          
          // Move player if gameState is MAP
          if (globalGameState === 'MAP' && isMoving) {
            // Calculate new position
            const newPosition = new THREE.Vector3(
              playerGroup.position.x + playerDirection.x * deltaTime * 5,
              playerGroup.position.y,
              playerGroup.position.z + playerDirection.z * deltaTime * 5
            );
            
            // Check for collisions before moving
            if (checkCollisions(newPosition)) {
              playerGroup.position.x = newPosition.x;
              playerGroup.position.z = newPosition.z;
              
              // Keep player within world bounds
              playerGroup.position.x = Math.max(-groundSize/2 + 5, Math.min(groundSize/2 - 5, playerGroup.position.x));
              playerGroup.position.z = Math.max(-groundSize/2 + 5, Math.min(groundSize/2 - 5, playerGroup.position.z));
              
              // Update camera to follow player with smoother transition
              camera.position.x = camera.position.x * 0.95 + playerGroup.position.x * 0.05;
              camera.position.z = camera.position.z * 0.95 + (playerGroup.position.z + 20) * 0.05;
              camera.lookAt(playerGroup.position.x, playerGroup.position.y + 1, playerGroup.position.z);
              
              // Check for tall grass encounters
              if (Math.random() < 0.01) { // Higher chance for encounters
                // Find if player is in tall grass
                let inTallGrass = false;
                scene.traverse((object) => {
                  if (object.userData && object.userData.isTallGrass) {
                    const distance = Math.sqrt(
                      Math.pow(playerGroup.position.x - object.position.x, 2) +
                      Math.pow(playerGroup.position.z - object.position.z, 2)
                    );
                    if (distance < 3) {
                      inTallGrass = true;
                    }
                  }
                });
                
                if (inTallGrass) {
                  try {
                    isMoving = false;
                    globalIsMoving = false;
                    setGameState('ENCOUNTER');
                    globalGameState = 'ENCOUNTER';
                    playSound('encounter');
                    
                    // Select a random companion for the encounter
                    const randomIndex = Math.floor(Math.random() * companionData.length);
                    setCurrentCompanion(companionData[randomIndex]);
                  } catch (error) {
                    console.error("Error during encounter transition:", error);
                    // Fallback to continue game
                    isMoving = true;
                    globalIsMoving = true;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Error in updateScene:", error);
        }
      };
      
      // Function to handle player movement
      const movePlayer = (direction: Direction) => {
        try {
          if (globalGameState !== 'MAP') return;
          
          isMoving = true;
          globalIsMoving = true;
          playSound('walk');
          
          switch (direction) {
            case 'up':
              playerDirection = { x: 0, z: -1 };
              break;
            case 'down':
              playerDirection = { x: 0, z: 1 };
              break;
            case 'left':
              playerDirection = { x: -1, z: 0 };
              break;
            case 'right':
              playerDirection = { x: 1, z: 0 };
              break;
            default:
              isMoving = false;
              globalIsMoving = false;
              break;
          }
          
          // Rotate player to face movement direction
          if (isMoving) {
            if (playerDirection.x === 1) {
              playerGroup.rotation.y = -Math.PI / 2;
            } else if (playerDirection.x === -1) {
              playerGroup.rotation.y = Math.PI / 2;
            } else if (playerDirection.z === 1) {
              playerGroup.rotation.y = 0;
            } else if (playerDirection.z === -1) {
              playerGroup.rotation.y = Math.PI;
            }
          }
        } catch (error) {
          console.error("Error in movePlayer:", error);
          // Reset movement state in case of error
          isMoving = false;
          globalIsMoving = false;
        }
      };
      
      // Make movePlayer accessible globally
      globalMovePlayerFn = movePlayer;
      
      // Animation loop with error handling
      const render = () => {
        try {
          requestAnimationFrame(render);
          updateScene(0);
          renderer.render(scene, camera);
          gl.endFrameEXP();
        } catch (error) {
          console.error("Error in render loop:", error);
        }
      };
      
      render();
    } catch (error) {
      console.error("Error in setupThreeJsScene:", error);
      Alert.alert(
        "Rendering Error",
        "There was a problem setting up the game environment. Please restart the app."
      );
    }
  };

  // Function to add companion to the 3D scene
  function addCompanionToScene(scene: THREE.Scene, companion: Companion) {
    const companionGroup = new THREE.Group();
    
    // Get position from companion data
    const x = companion.mapPosition?.x || 0;
    const z = companion.mapPosition?.y || 0; // Note: y in map data = z in 3D space
    
    companionGroup.position.set(x, 0, z);
    
    // Create companion body
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.2, 8, 8);
    
    // Use companion color for material
    let colorValue = companion.color || '#4CAF50';
    let color: number;
    if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
      color = parseInt(colorValue.replace('#', '0x'), 16);
    } else {
      color = 0x4CAF50; // Default green color
    }
    
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.3
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    companionGroup.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xFAD1A2, // Neutral skin tone
      roughness: 0.5,
      metalness: 0.1
    });
    
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2;
    head.castShadow = true;
    companionGroup.add(head);
    
    // Create simple floating tag above companion (alternative to text)
    const tagGeometry = new THREE.BoxGeometry(1.5, 0.5, 0.1);
    const tagMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333,
      transparent: true,
      opacity: 0.7
    });
    const tagMesh = new THREE.Mesh(tagGeometry, tagMaterial);
    tagMesh.position.y = 2.8;
    companionGroup.add(tagMesh);
    
    // Create small floating icon (representing avatar)
    const iconGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const iconMaterial = new THREE.MeshBasicMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.9
    });
    const iconMesh = new THREE.Mesh(iconGeometry, iconMaterial);
    iconMesh.position.y = 3.3;
    companionGroup.add(iconMesh);
    
    // Add companion to scene
    scene.add(companionGroup);
    
    // Store companion ID in userData for collision detection
    companionGroup.userData = { 
      isCompanion: true,
      companionId: companion.id
    };
    
    return companionGroup;
  }

  // Improved helper function to add grass patch
  function addGrassPatch(scene: THREE.Scene, x: number, z: number, isTallGrass = false) {
    // Create a group for the grass patch
    const grassPatch = new THREE.Group();
    grassPatch.position.set(x, 0, z);
    
    // More blades for denser grass
    const bladeCount = isTallGrass ? 25 + Math.floor(Math.random() * 15) : 8 + Math.floor(Math.random() * 6);
    
    // Grass texture for better appearance
    const bladeMaterials = [
      new THREE.MeshStandardMaterial({ 
        color: isTallGrass ? 0x4CAF50 : 0x8BC34A,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.1
      }),
      new THREE.MeshStandardMaterial({ 
        color: isTallGrass ? 0x388E3C : 0x7CB342,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.1
      }),
      new THREE.MeshStandardMaterial({ 
        color: isTallGrass ? 0x2E7D32 : 0x689F38,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.1
      })
    ];
    
    for (let i = 0; i < bladeCount; i++) {
      // Each blade is a curved plane for better appearance
      const bladeHeight = isTallGrass ? 1.2 + Math.random() * 0.8 : 0.4 + Math.random() * 0.3;
      const bladeWidth = 0.1 + Math.random() * 0.05;
      
      // Create custom grass blade geometry with curve
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(-bladeWidth/2, 0);
      bladeShape.lineTo(bladeWidth/2, 0);
      bladeShape.lineTo(0, bladeHeight);
      bladeShape.lineTo(-bladeWidth/2, 0);
      
      const bladeGeometry = new THREE.ShapeGeometry(bladeShape, 4);
      
      // Randomly select material for variation
      const materialIndex = Math.floor(Math.random() * bladeMaterials.length);
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterials[materialIndex]);
      
      // Random position within the patch
      const offsetX = (Math.random() - 0.5) * 1.2;
      const offsetZ = (Math.random() - 0.5) * 1.2;
      const baseY = 0;
      
      blade.position.set(offsetX, baseY, offsetZ);
      blade.userData = { 
        isGrassBlade: true,
        isTallGrass: isTallGrass,
        originalY: baseY
      };
      
      // Random rotation for variety
      blade.rotation.y = Math.random() * Math.PI;
      
      // Slight random lean
      blade.rotation.x = (Math.random() - 0.5) * 0.2;
      blade.rotation.z = (Math.random() - 0.5) * 0.2;
      
      // Cast shadows for 3D effect
      blade.castShadow = true;
      
      grassPatch.add(blade);
    }
    
    // Add a small mound for taller grass
    if (isTallGrass) {
      const moundGeometry = new THREE.CircleGeometry(1, 8);
      const moundMaterial = new THREE.MeshStandardMaterial({
        color: 0x33691E,
        roughness: 0.9,
        metalness: 0.1
      });
      
      const mound = new THREE.Mesh(moundGeometry, moundMaterial);
      mound.rotation.x = -Math.PI / 2;
      mound.position.y = 0.01; // Slightly above ground
      
      grassPatch.add(mound);
    }
    
    scene.add(grassPatch);
    
    // Mark if this is tall grass for encounters
    grassPatch.userData = {
      isTallGrass: isTallGrass,
      isGrassPatch: true
    };
    
    return grassPatch;
  }

  // Improved helper function to add water
  function addWater(scene: THREE.Scene, x: number, z: number, size: number) {
    // Create water as a shimmering blue surface
    const waterGeometry = new THREE.PlaneGeometry(size, size, 8, 8);
    const waterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x29B6F6,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.8,
      side: THREE.DoubleSide
    });
    
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.set(x, 0.05, z); // Slightly above ground
    water.userData = { isWater: true };
    
    // Add a darker bottom under the water
    const bottomGeometry = new THREE.PlaneGeometry(size, size);
    const bottomMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x0288D1,
      side: THREE.DoubleSide
    });
    
    const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.set(x, 0.01, z);
    
    scene.add(water);
    scene.add(bottom);
    
    return water;
  }

  // Improved helper function for tree
  function addTree(scene: THREE.Scene, x: number, z: number) {
    // Create a more detailed tree
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);
    
    // Tree trunk with texture
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8D6E63,
      roughness: 0.9,
      metalness: 0.1
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);
    
    // Tree leaves (multiple sections for fuller look)
    const leavesLayers = Math.floor(Math.random() * 2) + 3; // 3-4 layers
    const baseLeafSize = 1.2 + Math.random() * 0.8;
    const leafColor = new THREE.Color(
      0.1 + Math.random() * 0.1,    // R - vary the green
      0.5 + Math.random() * 0.3,    // G - stronger green component
      0.1 + Math.random() * 0.1     // B - vary the green
    );
    
    for (let i = 0; i < leavesLayers; i++) {
      const layerHeight = 2 + i * 0.8;
      const layerSize = baseLeafSize * (1 - i * 0.2);
      
      const leavesGeometry = new THREE.ConeGeometry(layerSize, 1.2, 8);
      const leavesMaterial = new THREE.MeshStandardMaterial({ 
        color: leafColor,
        roughness: 0.8,
        metalness: 0.1
      });
      
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.y = layerHeight;
      leaves.castShadow = true;
      leaves.receiveShadow = true;
      treeGroup.add(leaves);
    }
    
    scene.add(treeGroup);
    return treeGroup;
  }

  // Improved helper function for building
  function addBuilding(scene: THREE.Scene, x: number, z: number, roofColor: string = 'red') {
    const buildingGroup = new THREE.Group();
    buildingGroup.position.set(x, 0, z);
    
    // Building base with texture
    const baseWidth = 3 + Math.random() * 2;
    const baseDepth = 3 + Math.random() * 2;
    const baseHeight = 2 + Math.random() * 1.5;
    
    const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xECEFF1,
      roughness: 0.7,
      metalness: 0.2
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = baseHeight / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    buildingGroup.add(base);
    
    // Building roof
    let roofColorCode;
    switch(roofColor) {
      case 'red': roofColorCode = 0xE53935; break;
      case 'blue': roofColorCode = 0x1E88E5; break;
      case 'green': roofColorCode = 0x43A047; break;
      default: roofColorCode = 0xE53935; break;
    }
    
    const roofGeometry = new THREE.ConeGeometry(Math.max(baseWidth, baseDepth) * 0.7, baseHeight * 0.8, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ 
      color: roofColorCode,
      roughness: 0.6,
      metalness: 0.3
    });
    
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = baseHeight + (baseHeight * 0.4);
    roof.rotation.y = Math.PI / 4; // Rotate 45 degrees
    roof.castShadow = true;
    buildingGroup.add(roof);
    
    // Door
    const doorGeometry = new THREE.PlaneGeometry(baseWidth * 0.25, baseHeight * 0.4);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x5D4037,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, baseHeight * 0.2, baseDepth/2 + 0.01);
    buildingGroup.add(door);
    
    // Windows
    const windowGeometry = new THREE.PlaneGeometry(baseWidth * 0.15, baseHeight * 0.15);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x90CAF9,
      roughness: 0.3,
      metalness: 0.5,
      side: THREE.DoubleSide
    });
    
    // Left window
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-baseWidth/4, baseHeight * 0.6, baseDepth/2 + 0.01);
    buildingGroup.add(window1);
    
    // Right window
    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(baseWidth/4, baseHeight * 0.6, baseDepth/2 + 0.01);
    buildingGroup.add(window2);
    
    scene.add(buildingGroup);
    return buildingGroup;
  }

  // Improved helper function to add paths
  function addPaths(scene: THREE.Scene) {
    // Create more structured paths
    const pathMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xD7CCC8,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    
    // Create main path
    const mainPathGeometry = new THREE.PlaneGeometry(2, 80);
    const mainPath = new THREE.Mesh(mainPathGeometry, pathMaterial);
    mainPath.rotation.x = -Math.PI / 2;
    mainPath.position.set(0, 0.02, 0); // Slightly above ground to prevent z-fighting
    mainPath.receiveShadow = true;
    scene.add(mainPath);
    
    // Create cross path
    const crossPathGeometry = new THREE.PlaneGeometry(80, 2);
    const crossPath = new THREE.Mesh(crossPathGeometry, pathMaterial);
    crossPath.rotation.x = -Math.PI / 2;
    crossPath.position.set(0, 0.02, 0);
    crossPath.receiveShadow = true;
    scene.add(crossPath);
    
    // Path to first building
    const path1Geometry = new THREE.PlaneGeometry(2, 20);
    const path1 = new THREE.Mesh(path1Geometry, pathMaterial);
    path1.rotation.x = -Math.PI / 2;
    path1.rotation.z = Math.PI / 4; // 45 degrees
    path1.position.set(-10, 0.02, 10); // Position halfway to building
    path1.receiveShadow = true;
    scene.add(path1);
    
    // Path to second building
    const path2Geometry = new THREE.PlaneGeometry(2, 16);
    const path2 = new THREE.Mesh(path2Geometry, pathMaterial);
    path2.rotation.x = -Math.PI / 2;
    path2.rotation.z = -Math.PI / 6; // -30 degrees
    path2.position.set(14, 0.02, -8); // Position halfway to building
    path2.receiveShadow = true;
    scene.add(path2);
    
    return [mainPath, crossPath, path1, path2];
  }

  // This is the main component render function
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {renderGameContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#8BC34A',
  },
  mapHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  mapHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  mapViewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#333',
    borderRadius: 4,
    backgroundColor: '#6ABD9D',
    margin: 10,
  },
  mapTile: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileBase: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  tileSide: {
    position: 'absolute',
    width: '100%',
    height: '30%',
    bottom: -1,
    transform: [{ skewX: '45deg' }],
  },
  playerContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    zIndex: 1000,
  },
  playerSprite: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  playerShadow: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    width: '50%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    zIndex: 1,
  },
  playerFacingUp: {
    transform: [{ translateY: -2 }],
  },
  playerFacingDown: {
    transform: [{ translateY: 0 }],
  },
  playerFacingLeft: {
    transform: [{ scaleX: -1 }],
  },
  playerFacingRight: {
    transform: [{ scaleX: 1 }],
  },
  controls: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  dPad: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dPadButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 25,
  },
  dPadUp: {
    marginBottom: 5,
  },
  dPadMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dPadLeft: {
    marginRight: 5,
  },
  dPadCenter: {
    width: 40,
    height: 40,
  },
  dPadRight: {
    marginLeft: 5,
  },
  dPadDown: {
    marginTop: 5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,0,0,0.7)',
    borderRadius: 40,
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  actionButtonB: {
    backgroundColor: 'rgba(0, 0, 255, 0.7)',
  },
  actionButtonText: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: 'bold',
  },
  encounterFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  encounterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  encounterBackground: {
    width: '100%',
    height: '80%',
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  encounterGrass: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    alignItems: 'center',
  },
  encounterGrassEmoji: {
    fontSize: 32,
    letterSpacing: 5,
  },
  encounterImageContainer: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  encounterImage: {
    width: '100%',
    height: '100%',
  },
  encounterText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  encounterInfoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 15,
    width: '90%',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  encounterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  encounterLevel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  encounterType: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: 'bold',
  },
  encounterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  encounterButton: {
    backgroundColor: '#3a6ba5',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    minWidth: 120,
    alignItems: 'center',
  },
  encounterButtonSecondary: {
    backgroundColor: '#a53a3a',
  },
  encounterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  dialogueScreen: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogueCompanionImage: {
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  dialogueContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  dialogueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  dialogueText: {
    fontSize: 18,
  },
  dialogueTapArea: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 5,
    marginTop: 10,
  },
  dialogueTapText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectionContainer: {
    flex: 1,
    padding: 20,
  },
  selectionHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  selectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  selectionContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  selectionImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  selectionImage: {
    width: width * 0.6,
    height: width * 0.4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  selectionTypeTag: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  selectionTypeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectionInfo: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
  },
  selectionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  selectionRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  selectionStats: {
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statName: {
    width: 100,
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#EEE',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  statFill: {
    height: '100%',
  },
  statValue: {
    width: 30,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  selectionAbilities: {
    marginTop: 10,
  },
  abilitiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  abilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  abilityName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  selectionButtons: {
    marginTop: 20,
  },
  selectionButton: {
    backgroundColor: '#3a6ba5',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectionButtonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  selectionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  selectionButtonSecondaryText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  npcContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
  },
  npcTrainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  npcShadow: {
    position: 'absolute',
    bottom: 0,
    width: '50%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
  },
  npcAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  npcEmoji: {
    fontSize: 18,
  },
  speechIndicator: {
    position: 'absolute',
    top: -15,
    right: -5,
    backgroundColor: '#FFEB3B',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  speechIndicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  grassTuftsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  grassTuft1: {
    width: 4,
    height: 8,
    backgroundColor: '#5EA051',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  grassTuft2: {
    width: 4,
    height: 10,
    backgroundColor: '#4E8A41',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginTop: 2,
  },
  grassTuft3: {
    width: 4,
    height: 8,
    backgroundColor: '#5EA051',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    transform: [{ rotate: '-10deg' }],
  },
  waterRipplesContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterRipple: {
    width: '70%',
    height: '25%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 50,
  },
  tallGrassEffect: {
    backgroundColor: '#2E8B57',
  },
  waterEffect: {
    backgroundColor: '#4FA4E2',
  },
  buildingContainer: {
    width: '100%',
    height: '150%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    zIndex: 10,
  },
  treeContainer: {
    width: '100%',
    height: '150%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    zIndex: 10,
  },
  flowersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  flower1: {
    width: 4,
    height: 4,
    backgroundColor: '#FF69B4',
    borderRadius: 2,
  },
  flower2: {
    width: 6,
    height: 6,
    backgroundColor: '#FF1493',
    borderRadius: 3,
    marginTop: 2,
  },
  flower3: {
    width: 4,
    height: 4,
    backgroundColor: '#FF69B4',
    borderRadius: 2,
    marginTop: 4,
  },
  treeTrunk: {
    width: '100%',
    height: 20,
    backgroundColor: '#2E7D32',
    position: 'absolute',
    bottom: 0,
  },
  treeLeaves: {
    width: '100%',
    height: 40,
    position: 'absolute',
    bottom: 0,
  },
  buildingRoof: {
    width: '100%',
    height: 20,
    backgroundColor: '#FFECB3',
    position: 'absolute',
    bottom: 0,
  },
  buildingWall: {
    width: '100%',
    height: 100,
    position: 'absolute',
    bottom: 0,
  },
  buildingWindow: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 40,
    left: 40,
  },
  buildingDoor: {
    width: 20,
    height: 40,
    backgroundColor: '#FFECB3',
    position: 'absolute',
    top: 80,
    left: 40,
  },
  unityGameButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  unityGameButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dPadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  gameButtonContainer: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    alignItems: 'center',
  },
  gameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  gameButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gameButtonSubtext: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default OnboardingCompanion; 