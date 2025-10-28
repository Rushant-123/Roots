import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../services/firebase/config';
import firebase from 'firebase/compat/app';
import * as AuthService from '../services/firebase/auth';
import { usingDummyValues } from '../services/firebase/config';

interface AuthContextType {
  user: firebase.User | null;
  isLoading: boolean;
  sendVerificationCode: (phoneNumber: string) => Promise<{ success: boolean; verificationId?: string; error?: string }>;
  verifyCode: (verificationId: string, code: string) => Promise<{ success: boolean; user?: firebase.User; error?: string }>;
  createUserProfile: (userId: string, profileData: any) => Promise<{ success: boolean; error?: string }>;
  updatePrivacySettings: (userId: string, privacySettings: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; user?: firebase.User; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; user?: firebase.User; isNewUser?: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; user?: firebase.User; isNewUser?: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; user?: firebase.User; error?: string }>;
  hasUserProfile: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  sendVerificationCode: async () => ({ success: false }),
  verifyCode: async () => ({ success: false }),
  createUserProfile: async () => ({ success: false }),
  updatePrivacySettings: async () => ({ success: false }),
  signOut: async () => ({ success: false }),
  signInWithEmail: async () => ({ success: false }),
  signInWithGoogle: async () => ({ success: false }),
  signInWithApple: async () => ({ success: false }),
  signUpWithEmail: async () => ({ success: false }),
  hasUserProfile: false,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log("[AuthProvider] Initializing auth context");
  const [user, setUser] = useState<firebase.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserProfile, setHasUserProfile] = useState(usingDummyValues ? true : false);

  // Listen for authentication state changes
  useEffect(() => {
    console.log("[AuthProvider] Setting up auth state listener");
    try {
      const unsubscribe = auth.onAuthStateChanged((authUser: firebase.User | null) => {
        console.log("[AuthProvider] Auth state changed:", authUser ? "User logged in" : "No user");
        setUser(authUser);
        
        // If using dummy values, we'll pretend the user has a profile
        if (usingDummyValues) {
          console.log("[AuthProvider] Using dummy values, setting hasUserProfile to true");
          setHasUserProfile(true);
        } else if (authUser) {
          // Check if user has a profile
          checkUserProfile(authUser.uid);
        }
        
        setIsLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("[AuthProvider] Error setting up auth listener:", error);
      setIsLoading(false);
      return () => {};
    }
  }, []);

  // Check if user has a profile
  const checkUserProfile = async (userId: string) => {
    try {
      console.log("[AuthProvider] Checking if user has profile:", userId);
      const userDoc = await firebase.firestore().collection('users').doc(userId).get();
      setHasUserProfile(userDoc.exists);
      console.log("[AuthProvider] User has profile:", userDoc.exists);
    } catch (error) {
      console.error("[AuthProvider] Error checking user profile:", error);
      setHasUserProfile(false);
    }
  };

  // Log current state when it changes
  useEffect(() => {
    console.log("[AuthProvider] State updated - isLoading:", isLoading, "user:", user ? "exists" : "null", "hasProfile:", hasUserProfile);
  }, [isLoading, user, hasUserProfile]);

  // Auth context value
  const value = {
    user,
    isLoading,
    sendVerificationCode: AuthService.sendVerificationCode,
    verifyCode: AuthService.verifyCode,
    createUserProfile: async (userId: string, profileData: any) => {
      const result = await AuthService.createUserProfile(userId, profileData);
      if (result.success) {
        setHasUserProfile(true);
      }
      return result;
    },
    updatePrivacySettings: AuthService.updatePrivacySettings,
    signOut: AuthService.signOut,
    signInWithEmail: AuthService.signInWithEmail,
    signInWithGoogle: AuthService.signInWithGoogle,
    signInWithApple: AuthService.signInWithApple,
    signUpWithEmail: AuthService.signUpWithEmail,
    hasUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 