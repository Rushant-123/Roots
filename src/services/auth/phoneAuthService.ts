import { auth, firestore, usingDummyValues } from '../firebase/config';
import firebase from 'firebase/compat/app';

// Interface for verification results
export interface VerificationResult {
  success: boolean;
  verificationId?: string;
  error?: string;
}

// Interface for OTP confirmation results
export interface OTPConfirmationResult {
  success: boolean;
  user?: any;
  error?: string;
}

// RecaptchaVerifier configuration for web platforms
let recaptchaVerifier: any = null;

/**
 * Initialize recaptcha verifier for web platforms
 * @param containerId HTML element ID where the reCAPTCHA should be rendered
 */
export const initRecaptchaVerifier = (containerId: string) => {
  if (typeof window !== 'undefined') {
    try {
      recaptchaVerifier = new firebase.auth.RecaptchaVerifier(containerId, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA resolved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
    } catch (error) {
      console.error('Error initializing recaptchaVerifier:', error);
    }
  }
};

/**
 * Send verification code to a phone number
 * In a real implementation, this would send the code via WhatsApp
 * @param phoneNumber Phone number to send verification code to
 * @returns Promise with verification result
 */
export const sendVerificationCode = async (phoneNumber: string): Promise<VerificationResult> => {
  console.log(`[phoneAuthService] Sending verification code to ${phoneNumber}, demo mode: ${usingDummyValues}`);

  try {
    if (usingDummyValues) {
      // In demo mode, return a mock verification ID
      return {
        success: true,
        verificationId: 'mock-verification-123'
      };
    }

    // Store verification attempt
    await firestore.collection('verificationAttempts').add({
      phoneNumber,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      platform: 'whatsapp'  // Indicate we're using WhatsApp for verification
    });

    // In a real implementation, we would use Firebase Phone Auth
    // For web platforms we need reCAPTCHA verification
    if (!recaptchaVerifier && typeof window !== 'undefined') {
      // Create an invisible reCAPTCHA if not already created
      recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        size: 'invisible'
      });
    }

    // Send verification code
    const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier);
    
    // Store verification ID in Firestore for tracking purposes
    await firestore.collection('verificationCodes').doc(phoneNumber).set({
      verificationId: confirmationResult.verificationId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      attempts: 0,
      verified: false
    });

    return {
      success: true,
      verificationId: confirmationResult.verificationId
    };
  } catch (error: any) {
    console.error('Error sending verification code:', error);
    return {
      success: false,
      error: error.message || 'Failed to send verification code'
    };
  }
};

/**
 * Verify code entered by user
 * @param verificationId Verification ID from the sendVerificationCode function
 * @param code Verification code entered by user
 * @returns Promise with confirmation result
 */
export const verifyCode = async (verificationId: string, code: string): Promise<OTPConfirmationResult> => {
  console.log(`[phoneAuthService] Verifying code, demo mode: ${usingDummyValues}`);

  try {
    if (usingDummyValues) {
      // In demo mode, accept code "123456" 
      if (code === '123456') {
        return {
          success: true,
          user: auth.currentUser
        };
      } else {
        return {
          success: false,
          error: 'Invalid verification code'
        };
      }
    }

    // Create credential
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);

    // Sign in with the credential
    const userCredential = await auth.signInWithCredential(credential);

    // Update verification status in Firestore
    const phoneNumber = userCredential.user?.phoneNumber;
    if (phoneNumber) {
      await firestore.collection('verificationCodes').doc(phoneNumber).update({
        verified: true,
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Update user profile to mark phone as verified
      if (userCredential.user?.uid) {
        await firestore.collection('users').doc(userCredential.user.uid).update({
          phoneNumber,
          whatsappVerified: true,
          lastVerified: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    return {
      success: true,
      user: userCredential.user
    };
  } catch (error: any) {
    console.error('Error verifying code:', error);

    // Increment attempt counter
    try {
      if (!usingDummyValues) {
        // Find phone number doc by verification ID
        const querySnapshot = await firestore.collection('verificationCodes')
          .where('verificationId', '==', verificationId)
          .limit(1)
          .get();

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          await doc.ref.update({
            attempts: firebase.firestore.FieldValue.increment(1)
          });
        }
      }
    } catch (counterError) {
      console.error('Error updating attempt counter:', counterError);
    }

    return {
      success: false,
      error: error.message || 'Invalid verification code'
    };
  }
};

/**
 * Link a verified phone number to an existing user account
 * @param user Firebase user object
 * @param verificationId Verification ID from sendVerificationCode
 * @param code Verification code entered by user
 * @returns Promise with linking result
 */
export const linkPhoneToAccount = async (
  user: firebase.User,
  verificationId: string,
  code: string
): Promise<OTPConfirmationResult> => {
  console.log(`[phoneAuthService] Linking phone to account, demo mode: ${usingDummyValues}`);

  try {
    if (usingDummyValues) {
      // In demo mode, just succeed
      return {
        success: true,
        user: auth.currentUser
      };
    }

    // Create credential
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);

    // Link phone credential to existing account
    const userCredential = await user.linkWithCredential(credential);

    // Update user profile
    const phoneNumber = userCredential.user?.phoneNumber;
    if (phoneNumber && userCredential.user) {
      await firestore.collection('users').doc(userCredential.user.uid).update({
        phoneNumber,
        whatsappVerified: true,
        lastVerified: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    return {
      success: true,
      user: userCredential.user
    };
  } catch (error: any) {
    console.error('Error linking phone to account:', error);
    return {
      success: false,
      error: error.message || 'Failed to link phone number'
    };
  }
};

/**
 * Check if a phone number is already registered
 * @param phoneNumber Phone number to check
 * @returns Promise with boolean result
 */
export const isPhoneNumberRegistered = async (phoneNumber: string): Promise<boolean> => {
  console.log(`[phoneAuthService] Checking if phone number is registered, demo mode: ${usingDummyValues}`);

  if (usingDummyValues) {
    // In demo mode, return false for most numbers except our test one
    return phoneNumber === '+919876543210';
  }

  try {
    // Query users collection for the phone number
    const querySnapshot = await firestore.collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .limit(1)
      .get();

    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if phone number is registered:', error);
    return false;
  }
}; 