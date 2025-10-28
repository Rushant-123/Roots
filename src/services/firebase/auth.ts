import { auth, firestore, usingDummyValues } from './config';
import firebase from 'firebase/compat/app';

interface UserProfile {
  displayName: string;
  location: {
    latitude: number;
    longitude: number;
    neighborhood: string;
  };
  interests: string[];
  values: string[];
  privacySettings: {
    [key: string]: {
      visibleTo: string[];
    }
  };
  createdAt: firebase.firestore.Timestamp;
}

// Mock user for demo purposes when using dummy values
const MOCK_USER = usingDummyValues ? {
  uid: 'mock-user-123',
  email: 'demo@example.com',
  displayName: 'Demo User',
  photoURL: 'https://example.com/avatar.jpg',
  emailVerified: true,
  phoneNumber: '+1234567890',
} : null;

// Send phone verification code
export const sendVerificationCode = async (phoneNumber: string): Promise<{ success: boolean; verificationId?: string; error?: string }> => {
  try {
    if (usingDummyValues) {
      // Return mock verification ID
      return { success: true, verificationId: 'mock-verification-id' };
    }
    
    const provider = new firebase.auth.PhoneAuthProvider();
    const verificationId = await provider.verifyPhoneNumber(
      phoneNumber,
      // @ts-ignore - RecaptchaVerifier is not needed in Expo
      null
    );
    return { success: true, verificationId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Verify phone code
export const verifyCode = async (
  verificationId: string,
  code: string
): Promise<{ success: boolean; user?: firebase.User; error?: string }> => {
  try {
    if (usingDummyValues) {
      // Return mock user
      return { success: true, user: MOCK_USER as any };
    }
    
    const credential = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      code
    );
    const userCredential = await auth.signInWithCredential(credential);
    return { success: true, user: userCredential.user || undefined };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Create user profile
export const createUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (usingDummyValues) {
      console.log('Creating mock user profile:', profileData);
      return { success: true };
    }
    
    await firestore.collection('users').doc(userId).set({
      ...profileData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Update privacy settings
export const updatePrivacySettings = async (
  userId: string,
  privacySettings: UserProfile['privacySettings']
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (usingDummyValues) {
      console.log('Updating mock privacy settings:', privacySettings);
      return { success: true };
    }
    
    await firestore.collection('users').doc(userId).update({
      privacySettings
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = (): firebase.User | null => {
  if (usingDummyValues) {
    return MOCK_USER as any;
  }
  return auth.currentUser;
};

// Sign out
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    if (usingDummyValues) {
      console.log('Mock sign out');
      return { success: true };
    }
    
    await auth.signOut();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: firebase.User; error?: string }> => {
  try {
    if (usingDummyValues) {
      // Simulate login success with demo credentials
      if (email === 'demo@example.com' && password === 'password') {
        return { success: true, user: MOCK_USER as any };
      }
      // Simulate login failure
      return { success: false, error: 'Invalid email or password' };
    }
    
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user || undefined };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<{ success: boolean; user?: firebase.User; isNewUser?: boolean; error?: string }> => {
  try {
    if (usingDummyValues) {
      // Simulate Google login
      return { 
        success: true, 
        user: MOCK_USER as any,
        isNewUser: false
      };
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    const userCredential = await auth.signInWithPopup(provider);
    
    // Check if this is a new user
    const isNewUser = userCredential.additionalUserInfo?.isNewUser;
    
    return { 
      success: true, 
      user: userCredential.user || undefined,
      isNewUser
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign in with Apple
export const signInWithApple = async (): Promise<{ success: boolean; user?: firebase.User; isNewUser?: boolean; error?: string }> => {
  try {
    if (usingDummyValues) {
      // Simulate Apple login
      return { 
        success: true, 
        user: MOCK_USER as any,
        isNewUser: false
      };
    }
    
    const provider = new firebase.auth.OAuthProvider('apple.com');
    const userCredential = await auth.signInWithPopup(provider);
    
    // Check if this is a new user
    const isNewUser = userCredential.additionalUserInfo?.isNewUser;
    
    return { 
      success: true, 
      user: userCredential.user || undefined,
      isNewUser
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: firebase.User; error?: string }> => {
  try {
    if (usingDummyValues) {
      // Simulate signup success
      return { success: true, user: MOCK_USER as any };
    }
    
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user || undefined };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}; 