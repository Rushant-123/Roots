import { firestore, storage, isDemo } from '../firebase/config';
import firebase from 'firebase/compat/app';

// Core interfaces for WhatsApp data
export interface WhatsAppConversation {
  contactName: string;
  messageCount: number;
  lastMessage: {
    text: string;
    timestamp: string;
    sender: string;
  };
}

export interface WhatsAppAnalysisResults {
  conversationCount: number;
  messageCount: number;
  sentimentScore: number;
  topContacts: string[];
  topWords?: string[];
  weekdayActivity?: Record<string, number>;
  hourlyActivity?: Record<string, number>;
}

export interface WhatsAppInsight {
  title: string;
  summary: string;
  description?: string;
  type: 'positive' | 'neutral' | 'negative';
  icon?: string;
}

export interface WhatsAppData {
  connectionStatus: {
    connected: boolean;
    lastSync: string;
  };
  conversations: WhatsAppConversation[];
  analysisResults: WhatsAppAnalysisResults;
  insights: WhatsAppInsight[];
}

export interface WhatsAppUploadResult {
  success: boolean;
  error?: string;
}

export interface WhatsAppConnectionResult {
  connected: boolean;
  lastSync: string | null;
}

/**
 * Fetch WhatsApp data for a user
 * In a real app, this would connect to the WhatsApp API or parse exported chat data
 */
export const fetchWhatsAppData = async (userId: string): Promise<WhatsAppData | null> => {
  try {
    console.log(`Fetching WhatsApp data for user: ${userId}`);
    
    // In demo mode, return mock data
    if (isDemo) {
      console.log('Demo mode: Returning mock WhatsApp data');
      
      // Get mock data from Firestore
      const docRef = firestore.collection('whatsappData').doc(userId);
      const doc = await docRef.get();
      
      if (doc.exists) {
        return doc.data() as WhatsAppData;
      }
      
      return null;
    }
    
    // Fetch real data from Firestore
    const docRef = firestore.collection('whatsappData').doc(userId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      return doc.data() as WhatsAppData;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching WhatsApp data:', error);
    return null;
  }
};

/**
 * Upload WhatsApp chat export file
 * In a real app, this would parse a WhatsApp export file
 */
export const uploadWhatsAppExport = async (
  userId: string, 
  fileUri: string
): Promise<WhatsAppUploadResult> => {
  try {
    console.log(`Uploading WhatsApp export for user: ${userId}, file: ${fileUri}`);
    
    // In demo mode, simulate a successful upload
    if (isDemo) {
      console.log('Demo mode: Simulating WhatsApp export upload');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get the current timestamp
      const now = new Date().toISOString();
      
      // Create mock analysis results based on the demo data
      const mockData = {
        connectionStatus: {
          connected: true,
          lastSync: now
        },
        conversations: [
          {
            contactName: "Family Group",
            messageCount: 342,
            lastMessage: {
              text: "Let's meet this weekend!",
              timestamp: now,
              sender: "Mom"
            }
          },
          {
            contactName: "Work Team",
            messageCount: 157,
            lastMessage: {
              text: "The project deadline is next Friday",
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              sender: "Manager"
            }
          }
        ],
        analysisResults: {
          conversationCount: 2,
          messageCount: 499,
          sentimentScore: 0.72,
          topContacts: ["Family Group", "Work Team"],
          topWords: ["meeting", "weekend", "project", "deadline", "family"],
          weekdayActivity: {
            Monday: 78,
            Tuesday: 92,
            Wednesday: 105,
            Thursday: 83,
            Friday: 66,
            Saturday: 45,
            Sunday: 30
          },
          hourlyActivity: {
            morning: 123,
            afternoon: 215,
            evening: 161
          }
        },
        insights: [
          {
            title: "Social Connection",
            summary: "Strong",
            description: "You maintain active conversations with your family and work colleagues",
            type: "positive",
            icon: "users"
          },
          {
            title: "Work-Life Balance",
            summary: "Good",
            description: "Messages decrease during weekends, indicating you disconnect from work",
            type: "positive",
            icon: "balance-scale"
          },
          {
            title: "Communication Style",
            summary: "Positive",
            description: "Your messages reflect a positive sentiment overall",
            type: "positive",
            icon: "comment-smile"
          }
        ]
      };
      
      // Save the mock data to Firestore
      await firestore
        .collection('whatsappData')
        .doc(userId)
        .set(mockData);
      
      return { success: true };
    }
    
    // For real implementation:
    // 1. Upload the file to Firebase Storage
    const storageRef = storage.ref(`whatsapp-exports/${userId}/${Date.now()}.txt`);
    const response = await fetch(fileUri);
    const blob = await response.blob();
    await storageRef.put(blob);
    const downloadUrl = await storageRef.getDownloadURL();
    
    // 2. Trigger analysis (could be via Cloud Function)
    // This would be implemented on the backend, we'll simulate it here
    
    // 3. Store metadata about the upload
    await firestore
      .collection('whatsappUploads')
      .add({
        userId,
        fileUrl: downloadUrl,
        timestamp: new Date().toISOString(),
        status: 'processing'
      });
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Error uploading WhatsApp export:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload WhatsApp export';
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Generate wellness insights based on WhatsApp data
 */
export const generateWellnessInsights = async (userId: string): Promise<WhatsAppInsight[]> => {
  try {
    console.log(`Generating wellness insights for user: ${userId}`);
    
    // In demo mode, return mock insights
    if (isDemo) {
      console.log('Demo mode: Returning mock insights');
      
      // Get mock data from Firestore
      const docRef = firestore.collection('whatsappData').doc(userId);
      const doc = await docRef.get();
      
      if (doc.exists) {
        const data = doc.data() as WhatsAppData;
        return data.insights || [];
      }
      
      return [];
    }
    
    // For real implementation, this would involve:
    // 1. Fetching the user's WhatsApp data
    const whatsappData = await fetchWhatsAppData(userId);
    
    if (!whatsappData) {
      return [];
    }
    
    // 2. Analyzing the data to generate insights
    // This would typically be done on the backend
    
    // 3. Store the insights in Firestore
    // For now, we'll return the existing insights
    return whatsappData.insights;
  } catch (error) {
    console.error('Error generating wellness insights:', error);
    return [];
  }
};

/**
 * Get WhatsApp connection status
 */
export const getWhatsAppConnectionStatus = async (userId: string): Promise<WhatsAppConnectionResult> => {
  try {
    console.log(`Checking WhatsApp connection status for user: ${userId}`);
    
    // In demo mode
    if (isDemo) {
      console.log('Demo mode: Returning mock connection status');
      
      return {
        connected: true,
        lastSync: new Date().toISOString()
      };
    }
    
    // Fetch real status from Firestore
    const docRef = firestore.collection('whatsappData').doc(userId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data() as WhatsAppData;
      return {
        connected: data.connectionStatus.connected,
        lastSync: data.connectionStatus.lastSync
      };
    }
    
    return {
      connected: false,
      lastSync: null
    };
  } catch (error) {
    console.error('Error checking WhatsApp connection:', error);
    return {
      connected: false,
      lastSync: null
    };
  }
}; 