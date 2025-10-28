import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

const DemoHome = () => {
  const navigation = useNavigation();

  const handleChatPress = () => {
    navigation.navigate('DemoChat');
  };

  // Mock data for demo
  const userName = "Alex";
  const currentTime = new Date();
  const hours = currentTime.getHours();
  
  let greeting = "Good morning";
  if (hours >= 12 && hours < 17) {
    greeting = "Good afternoon";
  } else if (hours >= 17) {
    greeting = "Good evening";
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Animatable.View animation="fadeIn" duration={800} style={styles.welcomeSection}>
          <Text style={styles.greeting}>{greeting}, {userName}</Text>
          <Text style={styles.title}>Your Roots companion is ready to chat</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} duration={800} style={styles.companionChatPreview}>
          <View style={styles.companionPreviewHeader}>
            <View style={styles.companionAvatar}>
              <Text style={styles.avatarText}>🌱</Text>
            </View>
            <View style={{marginLeft: 12}}>
              <Text style={styles.companionPreviewName}>Dr. Mei</Text>
              <Text style={styles.companionStatus}>Online</Text>
            </View>
          </View>

          <View style={styles.messagePreview}>
            <Text style={styles.messageText}>
              Hi Alex! I noticed your sleep patterns have been irregular this week. Would you like to discuss some relaxation techniques that might help?
            </Text>
            <Text style={styles.messageTime}>11:42 AM</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleChatPress}>
            <Text style={styles.buttonText}>Continue conversation</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={400} duration={800}>
          <Text style={styles.sectionTitle}>My wellness insights</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={500} duration={800} style={styles.card}>
          <Text style={styles.cardTitle}>Weekly reflection</Text>
          <Text style={styles.cardText}>
            Your stress levels have decreased by 15% since last week. Great progress on your mindfulness exercises!
          </Text>
          <View style={{flexDirection: 'row', marginTop: 12, alignItems: 'center'}}>
            <Icon name="trending-down" size={24} color="#4CAF50" />
            <Text style={[styles.cardText, {color: '#4CAF50', marginLeft: 8}]}>
              15% less stress detected
            </Text>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={600} duration={800} style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming events</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
            <Icon name="calendar-clock" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.cardText, {marginLeft: 8, marginBottom: 0}]}>
              Daily check-in - 2 hours from now
            </Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name="calendar-check" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.cardText, {marginLeft: 8, marginBottom: 0}]}>
              Weekly assessment - Tomorrow, 10:00 AM
            </Text>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={700} duration={800} style={[styles.card, {marginBottom: 100}]}>
          <Text style={styles.cardTitle}>Quick actions</Text>
          
          <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleChatPress}>
              <Icon name="message-text-outline" size={22} color="#8E2DE2" />
              <Text style={styles.quickActionText}>Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="meditation" size={22} color="#8E2DE2" />
              <Text style={styles.quickActionText}>Meditate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="emoticon-outline" size={22} color="#8E2DE2" />
              <Text style={styles.quickActionText}>Mood</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="chart-line" size={22} color="#8E2DE2" />
              <Text style={styles.quickActionText}>Progress</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <View style={[styles.tabIcon, styles.activeTabIcon]}>
            <Icon name="home" size={24} color="#8E2DE2" />
          </View>
          <Text style={[styles.tabText, styles.activeTabText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={handleChatPress}>
          <View style={styles.tabIcon}>
            <Icon name="message-text-outline" size={24} color="rgba(255,255,255,0.6)" />
          </View>
          <Text style={styles.tabText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <View style={styles.tabIcon}>
            <Icon name="account-outline" size={24} color="rgba(255,255,255,0.6)" />
          </View>
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark theme
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 90, // Extra padding for tab bar
  },
  welcomeSection: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 18,
    color: '#8E2DE2',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  companionChatPreview: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  companionPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  companionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(142, 45, 226, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  companionPreviewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  companionStatus: {
    fontSize: 14,
    color: '#4CAF50',
  },
  messagePreview: {
    backgroundColor: 'rgba(142, 45, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  button: {
    backgroundColor: '#8E2DE2',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    shadowColor: '#8E2DE2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    lineHeight: 22,
  },
  quickActionButton: {
    backgroundColor: 'rgba(142, 45, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(142, 45, 226, 0.2)',
  },
  quickActionText: {
    fontSize: 14,
    color: 'white',
    marginTop: 8,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30,30,30,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    height: 70,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTabIcon: {
    backgroundColor: 'rgba(142, 45, 226, 0.2)',
  },
  tabText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#8E2DE2',
    fontWeight: '700',
  },
});

export default DemoHome; 