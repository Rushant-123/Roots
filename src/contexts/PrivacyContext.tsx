import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { usingDummyValues } from '../services/firebase/config';

// Interface representing the shape of our privacy settings
interface PrivacySettings {
  shareLocation: boolean;
  shareInterests: boolean;
  shareEvents: boolean;
  sharePodMembers: boolean;
  allowMessaging: boolean;
  [key: string]: boolean; // Index signature to allow dynamic field access
}

// Default privacy settings
const defaultPrivacySettings: PrivacySettings = {
  shareLocation: true,
  shareInterests: true,
  shareEvents: true,
  sharePodMembers: true,
  allowMessaging: true,
};

// Privacy context interface
interface PrivacyContextType {
  privacySettings: PrivacySettings;
  isLoading: boolean;
  error: string | null;
  updatePrivacySetting: (setting: keyof PrivacySettings, value: boolean) => Promise<void>;
  getFieldVisibility: (fieldName: keyof PrivacySettings) => boolean;
  updateFieldVisibility: (fieldName: keyof PrivacySettings, isVisible: boolean) => Promise<void>;
}

// Create the context with default values
const PrivacyContext = createContext<PrivacyContextType>({
  privacySettings: defaultPrivacySettings,
  isLoading: false,
  error: null,
  updatePrivacySetting: async () => {},
  getFieldVisibility: () => true,
  updateFieldVisibility: async () => {},
});

// Hook to use the privacy context
export const usePrivacy = () => useContext(PrivacyContext);

interface PrivacyProviderProps {
  children: ReactNode;
}

// Provider component
export const PrivacyProvider: React.FC<PrivacyProviderProps> = ({ children }) => {
  console.log("[PrivacyProvider] Initializing, demo mode:", usingDummyValues);
  const { user } = useAuth();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's privacy settings from Firestore
  useEffect(() => {
    console.log("[PrivacyProvider] User changed, loading privacy settings");
    
    if (usingDummyValues) {
      // In demo mode, use default privacy settings
      console.log("[PrivacyProvider] Using default privacy settings for demo mode");
      setPrivacySettings(defaultPrivacySettings);
      return;
    }
    
    if (!user) {
      setPrivacySettings(defaultPrivacySettings);
      return;
    }

    const fetchPrivacySettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real app, this would fetch from Firestore
        // For now, we'll just use the defaults
        setPrivacySettings(defaultPrivacySettings);
      } catch (err: any) {
        console.error('[PrivacyProvider] Error fetching privacy settings:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacySettings();
  }, [user]);

  // Update a privacy setting
  const updatePrivacySetting = async (setting: keyof PrivacySettings, value: boolean) => {
    if (!user && !usingDummyValues) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Update local state
      setPrivacySettings(prev => ({
        ...prev,
        [setting]: value
      }));
      
      if (!usingDummyValues) {
        // In a real app, this would update Firestore
        // For now, we'll just update the local state
        console.log(`[PrivacyProvider] Updated ${setting} to ${value}`);
      } else {
        console.log(`[PrivacyProvider] Demo mode: Updated ${setting} to ${value}`);
      }
    } catch (err: any) {
      console.error(`[PrivacyProvider] Error updating ${setting}:`, err);
      setError(err.message);
      
      // Revert to previous state on error
      setPrivacySettings(prev => ({
        ...prev,
        [setting]: !value
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Get visibility for a specific field
  const getFieldVisibility = (fieldName: keyof PrivacySettings): boolean => {
    return privacySettings[fieldName] || false;
  };

  // Update visibility for a specific field
  const updateFieldVisibility = async (fieldName: keyof PrivacySettings, isVisible: boolean): Promise<void> => {
    return updatePrivacySetting(fieldName, isVisible);
  };

  // Log privacy settings changes
  useEffect(() => {
    console.log("[PrivacyProvider] Privacy settings updated:", privacySettings);
  }, [privacySettings]);

  // Context value
  const value = {
    privacySettings,
    isLoading,
    error,
    updatePrivacySetting,
    getFieldVisibility,
    updateFieldVisibility,
  };

  return (
    <PrivacyContext.Provider value={value}>
      {children}
    </PrivacyContext.Provider>
  );
};

export default PrivacyContext; 