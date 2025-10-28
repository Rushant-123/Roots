import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { useTheme } from '../contexts/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';

const WhatsAppVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { colors } = useTheme();
  const { 
    isConnected, 
    connectWhatsApp, 
    verifyWhatsApp,
    uploadWhatsAppExport
  } = useWhatsApp();

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number');
      return;
    }

    setIsVerifying(true);
    try {
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const result = await connectWhatsApp(formattedNumber);
      if (result.success && result.verificationId) {
        setVerificationId(result.verificationId);
        Alert.alert('Success', 'Verification code sent to your phone');
      } else {
        Alert.alert('Error', result.error || 'Failed to send verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code');
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 6 || !verificationId) {
      Alert.alert('Invalid Code', 'Please enter a valid verification code');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyWhatsApp(verificationId, verificationCode);
      if (result.success) {
        Alert.alert('Success', 'WhatsApp verified successfully');
        setVerificationId(null);
        setVerificationCode('');
      } else {
        Alert.alert('Error', result.error || 'Failed to verify code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code');
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUploadChatExport = async () => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        setIsUploading(false);
        return;
      }
      
      const file = result.assets[0];
      if (file) {
        const uploadResult = await uploadWhatsAppExport(file.uri);
        if (uploadResult.success) {
          Alert.alert('Success', 'WhatsApp data uploaded successfully');
        } else {
          Alert.alert('Error', uploadResult.error || 'Failed to upload WhatsApp data');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload WhatsApp chat');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isConnected) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>WhatsApp Connected</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your WhatsApp is connected. You can upload a chat export for analysis.
        </Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleUploadChatExport}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Upload WhatsApp Chat Export</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Connect WhatsApp</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Connect your WhatsApp account to get personalized insights
      </Text>
      
      {!verificationId ? (
        <>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Phone Number (with country code)"
            placeholderTextColor={colors.textSecondary}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSendCode}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Send Verification Code</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Enter 6-digit verification code"
            placeholderTextColor={colors.textSecondary}
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleVerifyCode}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Verify Code</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WhatsAppVerification; 