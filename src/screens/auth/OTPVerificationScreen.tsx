import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

type OTPVerificationParams = {
  phoneNumber: string;
  verificationId: string;
};

type OTPVerificationScreenProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<{ OTPVerification: OTPVerificationParams }, 'OTPVerification'>;
};

const OTP_LENGTH = 6;

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { phoneNumber, verificationId } = route.params;
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyCode, sendVerificationCode } = useAuth();
  const inputRef = useRef<TextInput>(null);

  // Auto-focus on input when screen loads
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  // Setup countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerifyCode = async () => {
    if (code.length !== OTP_LENGTH) {
      Alert.alert('Invalid Code', 'Please enter a valid verification code');
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await verifyCode(verificationId, code);
      
      if (result.success) {
        // If auth worked but no profile, proceed to profile creation
        navigation.navigate('Location');
      } else {
        Alert.alert('Verification Failed', result.error || 'Invalid verification code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    try {
      setIsLoading(true);
      const result = await sendVerificationCode(phoneNumber);
      
      if (result.success) {
        // Reset state
        setCode('');
        setCountdown(60);
        setCanResend(false);
        
        Alert.alert('Success', 'Verification code resent successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to resend verification code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display, e.g., +91 98765 43210
    const digits = phone.replace(/\D/g, '');
    
    if (phone.startsWith('+91') && digits.length >= 10) {
      return `+91 ${digits.slice(-10, -5)} ${digits.slice(-5)}`;
    }
    
    return phone;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Verify Your Number</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to{'\n'}
            <Text style={styles.phoneNumber}>{formatPhoneNumber(phoneNumber)}</Text>
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              maxLength={OTP_LENGTH}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerifyCode}
            disabled={isLoading || code.length !== OTP_LENGTH}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendCode} disabled={isLoading}>
                <Text style={styles.resendButton}>Resend</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.countdownText}>Resend in {countdown}s</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.changeNumberButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.changeNumberText}>Change Phone Number</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  phoneNumber: {
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7', // Lighter green
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendButton: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  countdownText: {
    fontSize: 14,
    color: '#999',
  },
  changeNumberButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  changeNumberText: {
    fontSize: 14,
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
});

export default OTPVerificationScreen; 