import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { auth } from '../services/firebase/config';
import * as WhatsAppService from '../services/whatsapp/whatsappService';
import * as PhoneAuthService from '../services/auth/phoneAuthService';
import { 
  WhatsAppData, 
  WhatsAppInsight,
  WhatsAppUploadResult 
} from '../services/whatsapp/whatsappService';

// Context interface
interface WhatsAppContextProps {
  isConnected: boolean;
  lastSync: Date | null;
  isLoading: boolean;
  insights: WhatsAppInsight[];
  whatsAppData: WhatsAppData | null;
  connectWhatsApp: (phoneNumber: string) => Promise<{success: boolean; verificationId?: string; error?: string}>;
  verifyWhatsApp: (verificationId: string, code: string) => Promise<{success: boolean; error?: string}>;
  uploadWhatsAppExport: (fileUri: string) => Promise<WhatsAppUploadResult>;
  refreshWhatsAppData: () => Promise<void>;
  refreshInsights: () => Promise<void>;
  getWhatsAppConnectionStatus: () => Promise<void>;
}

// Create context with default values
const WhatsAppContext = createContext<WhatsAppContextProps>({
  isConnected: false,
  lastSync: null,
  isLoading: false,
  insights: [],
  whatsAppData: null,
  connectWhatsApp: async () => ({ success: false, error: 'Not implemented' }),
  verifyWhatsApp: async () => ({ success: false, error: 'Not implemented' }),
  uploadWhatsAppExport: async () => ({ success: false, error: 'Not implemented' }),
  refreshWhatsAppData: async () => {},
  refreshInsights: async () => {},
  getWhatsAppConnectionStatus: async () => {},
});

// Hook to use the WhatsApp context
export const useWhatsApp = () => useContext(WhatsAppContext);

// Provider component
export const WhatsAppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [whatsAppData, setWhatsAppData] = useState<WhatsAppData | null>(null);
  const [insights, setInsights] = useState<WhatsAppInsight[]>([]);
  
  // Check connection status on user change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        checkConnectionStatus(user.uid);
        loadWhatsAppData(user.uid);
        loadInsights(user.uid);
      } else {
        setIsConnected(false);
        setLastSync(null);
        setWhatsAppData(null);
        setInsights([]);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Check WhatsApp connection status
  const checkConnectionStatus = async (userId: string) => {
    try {
      const status = await WhatsAppService.getWhatsAppConnectionStatus(userId);
      setIsConnected(status.connected);
      setLastSync(status.lastSync ? new Date(status.lastSync) : null);
    } catch (error) {
      console.error('Error checking WhatsApp connection:', error);
    }
  };
  
  // Public method to check connection status
  const getWhatsAppConnectionStatus = async () => {
    if (!auth.currentUser) return;
    await checkConnectionStatus(auth.currentUser.uid);
  };
  
  // Load WhatsApp data
  const loadWhatsAppData = async (userId: string) => {
    setIsLoading(true);
    try {
      const data = await WhatsAppService.fetchWhatsAppData(userId);
      if (data) {
        setWhatsAppData(data);
        setLastSync(new Date(data.connectionStatus.lastSync));
        setIsConnected(data.connectionStatus.connected);
      }
    } catch (error) {
      console.error('Error loading WhatsApp data:', error);
      Alert.alert('Error', 'Failed to load WhatsApp data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load insights
  const loadInsights = async (userId: string) => {
    try {
      const insights = await WhatsAppService.generateWellnessInsights(userId);
      setInsights(insights);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };
  
  // Connect WhatsApp by sending verification code
  const connectWhatsApp = async (phoneNumber: string) => {
    if (!auth.currentUser) {
      return { success: false, error: 'You must be logged in to connect WhatsApp' };
    }
    
    try {
      return await PhoneAuthService.sendVerificationCode(phoneNumber);
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      return { success: false, error: 'Failed to connect WhatsApp' };
    }
  };
  
  // Verify WhatsApp with code
  const verifyWhatsApp = async (verificationId: string, code: string) => {
    if (!auth.currentUser) {
      return { success: false, error: 'You must be logged in to verify WhatsApp' };
    }
    
    try {
      const result = await PhoneAuthService.verifyCode(verificationId, code);
      
      if (result.success) {
        // Update local state
        setIsConnected(true);
        setLastSync(new Date());
        
        // Reload data after verification
        await loadWhatsAppData(auth.currentUser.uid);
        await loadInsights(auth.currentUser.uid);
      }
      
      return result;
    } catch (error) {
      console.error('Error verifying WhatsApp:', error);
      return { success: false, error: 'Failed to verify WhatsApp' };
    }
  };
  
  // Upload WhatsApp export
  const uploadWhatsAppExport = async (fileUri: string) => {
    if (!auth.currentUser) {
      return { success: false, error: 'You must be logged in to upload WhatsApp data' };
    }
    
    setIsLoading(true);
    try {
      const result = await WhatsAppService.uploadWhatsAppExport(auth.currentUser.uid, fileUri);
      
      if (result.success) {
        // Reload data after upload
        await loadWhatsAppData(auth.currentUser.uid);
        await loadInsights(auth.currentUser.uid);
      }
      
      return result;
    } catch (error) {
      console.error('Error uploading WhatsApp export:', error);
      return { success: false, error: 'Failed to upload WhatsApp data' };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh WhatsApp data
  const refreshWhatsAppData = async () => {
    if (!auth.currentUser) {
      return;
    }
    
    setIsLoading(true);
    try {
      await loadWhatsAppData(auth.currentUser.uid);
    } catch (error) {
      console.error('Error refreshing WhatsApp data:', error);
      Alert.alert('Error', 'Failed to refresh WhatsApp data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh insights
  const refreshInsights = async () => {
    if (!auth.currentUser) {
      return;
    }
    
    try {
      await loadInsights(auth.currentUser.uid);
    } catch (error) {
      console.error('Error refreshing insights:', error);
      Alert.alert('Error', 'Failed to refresh insights');
    }
  };
  
  // Provide the WhatsApp context to the app
  return (
    <WhatsAppContext.Provider
      value={{
        isConnected,
        lastSync,
        isLoading,
        insights,
        whatsAppData,
        connectWhatsApp,
        verifyWhatsApp,
        uploadWhatsAppExport,
        refreshWhatsAppData,
        refreshInsights,
        getWhatsAppConnectionStatus,
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
}; 