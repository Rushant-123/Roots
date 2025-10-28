import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

const DemoChat = () => {
  const navigation = useNavigation();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'companion',
      text: 'Hi Alex! I noticed your sleep patterns have been irregular this week. Would you like to discuss some relaxation techniques that might help?',
      timestamp: '11:42 AM'
    }
  ]);
  const scrollViewRef = useRef();
  const [isTyping, setIsTyping] = useState(false);

  // Get current time for message timestamps
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Auto responses from AI companion
  const getCompanionResponse = (userMessage) => {
    setIsTyping(true);
    
    // Simulate network delay
    setTimeout(() => {
      let response = '';
      const userMessageLower = userMessage.toLowerCase();
      
      if (userMessageLower.includes('sleep') || userMessageLower.includes('tired') || userMessageLower.includes('rest') || userMessageLower.includes('yes')) {
        response = "Based on your recent data, you've been going to bed at irregular times. Research shows that maintaining a consistent sleep schedule helps regulate your body's internal clock. Would you like me to help you create a bedtime routine?";
      } 
      else if (userMessageLower.includes('stress') || userMessageLower.includes('anxious') || userMessageLower.includes('worry')) {
        response = "I'm sensing you're feeling stressed. Let's try a quick breathing exercise: Breathe in for 4 counts, hold for 7, and exhale for 8. Repeat this 4 times. How do you feel afterward?";
      }
      else if (userMessageLower.includes('meditation') || userMessageLower.includes('relax') || userMessageLower.includes('calm')) {
        response = "Great choice! Meditation can significantly reduce stress and improve sleep quality. I've prepared a 5-minute guided relaxation session. Would you like to try it now?";
      }
      else if (userMessageLower.includes('hello') || userMessageLower.includes('hi') || userMessageLower.includes('hey')) {
        response = "Hello Alex! It's good to hear from you. How are you feeling today?";
      }
      else if (userMessageLower.includes('bad') || userMessageLower.includes('not good') || userMessageLower.includes('terrible')) {
        response = "I'm sorry to hear you're not feeling well. Would you like to talk about what's bothering you? Or perhaps try a quick mood-lifting exercise?";
      }
      else if (userMessageLower.includes('good') || userMessageLower.includes('great') || userMessageLower.includes('fine')) {
        response = "I'm glad to hear you're doing well! Is there anything specific you'd like to focus on improving today?";
      }
      else {
        response = "Thank you for sharing that. Based on what you've told me, would you be interested in trying a mindfulness exercise? It might help with your current situation.";
      }
      
      const newMessage = {
        id: messages.length + 2,
        sender: 'companion',
        text: response,
        timestamp: getCurrentTime()
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if (inputText.trim() === '') return;
    
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputText,
      timestamp: getCurrentTime()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    getCompanionResponse(inputText);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View style={styles.chatContainer}>
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={handleBackPress} style={{marginRight: 16}}>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.companionAvatar}>
          <Text style={styles.avatarText}>🌱</Text>
        </View>
        
        <View style={{marginLeft: 12}}>
          <Text style={styles.companionName}>Dr. Mei</Text>
          <Text style={styles.companionStatus}>
            {isTyping ? 'Typing...' : 'Online'}
          </Text>
        </View>
        
        <TouchableOpacity style={{marginLeft: 'auto'}}>
          <Icon name="dots-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Chat Messages */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={styles.chatMessages}
          ref={scrollViewRef}
          contentContainerStyle={{paddingBottom: 20}}
        >
          {messages.map((message, index) => (
            <Animatable.View 
              key={message.id}
              animation={message.sender === 'user' ? 'fadeInRight' : 'fadeInLeft'}
              duration={500}
              delay={index === messages.length - 1 ? 100 : 0}
              style={[
                message.sender === 'user' 
                  ? styles.messageBubbleUser 
                  : styles.messageBubbleCompanion
              ]}
            >
              <Text style={styles.messageBubbleText}>
                {message.text}
              </Text>
              <Text style={styles.messageTime}>
                {message.timestamp}
              </Text>
            </Animatable.View>
          ))}
          
          {isTyping && (
            <Animatable.View 
              animation="fadeInLeft"
              duration={500}
              style={[styles.messageBubbleCompanion, {width: 80}]}
            >
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, {animationDelay: '0.2s'}]} />
                <View style={[styles.typingDot, {animationDelay: '0.4s'}]} />
              </View>
            </Animatable.View>
          )}
        </ScrollView>
        
        {/* Chat Input */}
        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type a message..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              {opacity: inputText.trim() === '' ? 0.5 : 1}
            ]} 
            onPress={handleSend}
            disabled={inputText.trim() === ''}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  companionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(142, 45, 226, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  companionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  companionStatus: {
    fontSize: 14,
    color: '#4CAF50',
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  messageBubbleCompanion: {
    backgroundColor: 'rgba(142, 45, 226, 0.1)',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 16,
    marginBottom: 16,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageBubbleUser: {
    backgroundColor: 'rgba(142, 45, 226, 0.3)',
    borderRadius: 16,
    borderTopRightRadius: 4,
    padding: 16,
    marginBottom: 16,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  messageBubbleText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: 'white',
    marginRight: 12,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#8E2DE2',
    borderRadius: 24,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginHorizontal: 2,
    opacity: 0.6,
    // Animation handled via React Native Animatable
  },
});

export default DemoChat; 