import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import WhatsAppVerification from '../components/WhatsAppVerification';
import WhatsAppInsights from '../components/WhatsAppInsights';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { useTheme } from '../contexts/ThemeContext';
import { NavigationProp } from '@react-navigation/native';

interface WhatsAppScreenProps {
  navigation: NavigationProp<any>;
}

const WhatsAppScreen: React.FC<WhatsAppScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { isConnected } = useWhatsApp();
  
  // No longer need to check connection status on focus since that's handled in the WhatsAppProvider

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colors.text }]}>
          WhatsApp Integration
        </Text>
        
        <Text style={[styles.screenDescription, { color: colors.textSecondary }]}>
          Connect your WhatsApp to receive personalized wellness insights based on your conversations.
        </Text>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <WhatsAppVerification />
        </View>
        
        {isConnected && (
          <View style={styles.insightsContainer}>
            <WhatsAppInsights />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  screenDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  insightsContainer: {
    marginTop: 24,
  },
});

export default WhatsAppScreen; 