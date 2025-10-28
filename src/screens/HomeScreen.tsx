import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const HomeScreen: React.FC = () => {
  console.log('HomeScreen rendering');
  
  useEffect(() => {
    console.log('HomeScreen mounted');
    
    // Check if we're running in a proper environment
    try {
      console.log('HomeScreen checks:');
      console.log('- Ionicons available:', typeof Ionicons !== 'undefined');
      console.log('- useWhatsApp available:', typeof useWhatsApp === 'function');
    } catch (error) {
      console.log('HomeScreen check error:', error);
    }
  }, []);

  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  let isConnected = false;
  try {
    const whatsAppContext = useWhatsApp();
    isConnected = whatsAppContext.isConnected;
    console.log('WhatsApp connection status:', isConnected);
  } catch (error) {
    console.log('Error accessing WhatsApp context:', error);
  }

  const handleConnectWhatsApp = () => {
    console.log('handleConnectWhatsApp pressed');
    try {
      navigation.navigate('MainTabs', { screen: 'WhatsApp' });
    } catch (error) {
      console.log('Navigation error:', error);
    }
  };

  const handleOpenWhatsAppInsights = () => {
    console.log('handleOpenWhatsAppInsights pressed');
    try {
      navigation.navigate('MainTabs', { screen: 'WhatsApp' });
    } catch (error) {
      console.log('Navigation error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Roots</Text>
          <Text style={styles.headerSubtitle}>Your wellness journey starts here</Text>
        </View>

        {/* Feature Card for WhatsApp Integration */}
        <View style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <Text style={styles.featureTitle}>WhatsApp Integration</Text>
          </View>
          <Text style={styles.featureDescription}>
            Connect your WhatsApp account to get personalized wellness insights based on your conversations.
          </Text>
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={isConnected ? handleOpenWhatsAppInsights : handleConnectWhatsApp}
          >
            <Text style={styles.featureButtonText}>
              {isConnected ? 'View Insights' : 'Connect WhatsApp'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Demo Content */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Wellness Summary</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <View style={[styles.progressCircle, { borderColor: '#25D366' }]}>
              <Text style={styles.progressText}>85%</Text>
            </View>
            <Text style={styles.summaryLabel}>Mental Wellness</Text>
          </View>

          <View style={styles.summaryItem}>
            <View style={[styles.progressCircle, { borderColor: '#4285F4' }]}>
              <Text style={styles.progressText}>72%</Text>
            </View>
            <Text style={styles.summaryLabel}>Social Activity</Text>
          </View>

          <View style={styles.summaryItem}>
            <View style={[styles.progressCircle, { borderColor: '#FBBC05' }]}>
              <Text style={styles.progressText}>63%</Text>
            </View>
            <Text style={styles.summaryLabel}>Stress Levels</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Insights</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIconContainer}>
            <Ionicons name="bulb-outline" size={24} color="#25D366" />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Positive Social Connections</Text>
            <Text style={styles.insightDescription}>
              Your conversations show strong social connections which contribute positively to mental wellness.
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIconContainer}>
            <Ionicons name="warning-outline" size={24} color="#FBBC05" />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Evening Communication Patterns</Text>
            <Text style={styles.insightDescription}>
              Late night messaging may be affecting your sleep cycle. Consider setting digital boundaries.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#65676B',
    marginTop: 4,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 10,
  },
  featureDescription: {
    fontSize: 14,
    color: '#65676B',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureButton: {
    backgroundColor: '#25D366',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sectionLink: {
    fontSize: 14,
    color: '#25D366',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryItem: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#65676B',
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#65676B',
    lineHeight: 20,
  },
});

export default HomeScreen; 