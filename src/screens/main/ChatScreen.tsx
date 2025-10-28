import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

type ChatScreenParams = {
  conversationId: string;
  title: string;
};

type ChatScreenProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<{ Chat: ChatScreenParams }, 'Chat'>;
};

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isSent: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { conversationId, title } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set the navigation title
    navigation.setOptions({
      title: title || 'Chat',
    });

    // In a real app, we would fetch messages for this conversationId
    // For now, we'll just simulate some loading and add mock messages
    const timer = setTimeout(() => {
      setMessages([
        {
          id: '1',
          text: 'Hello! How are you doing today?',
          sender: 'other',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          isSent: true,
        },
        {
          id: '2',
          text: 'I just wanted to check if you are coming to the community garden event this weekend?',
          sender: 'other',
          timestamp: new Date(Date.now() - 3500000),
          isSent: true,
        },
        {
          id: '3',
          text: "I'm good, thanks! Yes, I'll be there around 10am.",
          sender: 'self',
          timestamp: new Date(Date.now() - 3400000),
          isSent: true,
        },
      ]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation, title]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'self',
      timestamp: new Date(),
      isSent: true,
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');

    // In a real app, we would send this to the backend
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'self' ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        {item.sender === 'self' && (
          <Ionicons
            name={item.isSent ? 'checkmark-done' : 'time-outline'}
            size={14}
            color="#8E8E93"
            style={styles.statusIcon}
          />
        )}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          inverted={false}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
});

export default ChatScreen; 