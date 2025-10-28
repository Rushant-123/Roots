import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "demo-mode-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "demo-mode.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "demo-mode-project",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "demo-mode.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef123456789",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-ABCDEF123"
};

// Check if we're in demo mode
const isDemo = !process.env.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY === "demo-mode-api-key";

let app: firebase.app.App;
let auth: firebase.auth.Auth;
let firestore: firebase.firestore.Firestore;
let storage: firebase.storage.Storage;

if (isDemo) {
  console.log("⚠️ Running in demo mode with mock Firebase services");
  
  // Mock user for demo mode
  const mockUser = {
    uid: "demo-user-123",
    email: "demo@roots-app.com",
    displayName: "Demo User",
    photoURL: null,
    emailVerified: true,
    whatsappVerified: true,
    phoneNumber: "+1234567890",
    providerData: [],
  };
  
  // Mock database with pre-populated data
  const mockDb: {
    users: { [key: string]: any };
    verificationCodes: { [key: string]: any };
    whatsappData: { [key: string]: any };
    [collectionName: string]: { [docId: string]: any };
  } = {
    users: {
      "demo-user-123": mockUser
    },
    verificationCodes: {
      "123456": {
        userId: "demo-user-123",
        phoneNumber: "+1234567890",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        verified: false
      }
    },
    whatsappData: {
      "demo-user-123": {
        connectionStatus: {
          connected: true,
          lastSync: new Date().toISOString(),
        },
        conversations: [
          {
            contactName: "Family Group",
            messageCount: 342,
            lastMessage: {
              text: "Let's meet this weekend!",
              timestamp: new Date().toISOString(),
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
      }
    }
  };
  
  // Mock Firebase Auth
  auth = {
    onAuthStateChanged: (callback: any) => {
      // Simulate auth state change
      setTimeout(() => callback(mockUser), 500);
      return () => {}; // Unsubscribe function
    },
    signInWithEmailAndPassword: async () => ({ user: mockUser }),
    createUserWithEmailAndPassword: async () => ({ user: mockUser }),
    signOut: async () => {},
    currentUser: mockUser,
    signInWithPhoneNumber: async (phoneNumber: string, appVerifier: any) => {
      console.log(`Mock sending verification code to ${phoneNumber}`);
      return {
        confirm: async (code: string) => {
          if (code === "123456") {
            console.log("Mock verification successful");
            return { user: mockUser };
          } else {
            throw new Error("Invalid verification code");
          }
        },
        verificationId: "mock-verification-id"
      };
    }
  } as unknown as firebase.auth.Auth;
  
  // Mock Firestore
  firestore = {
    collection: (collectionName: string) => {
      return {
        doc: (docId: string) => {
          const getDocData = () => {
            if (collectionName === "users" && mockDb.users[docId]) {
              return mockDb.users[docId];
            } else if (collectionName === "whatsappData" && mockDb.whatsappData[docId]) {
              return mockDb.whatsappData[docId];
            } else if (collectionName === "verificationCodes" && mockDb.verificationCodes[docId]) {
              return mockDb.verificationCodes[docId];
            }
            return null;
          };
          
          return {
            get: async () => ({
              exists: !!getDocData(),
              data: () => getDocData(),
              id: docId
            }),
            set: async (data: any) => {
              if (collectionName === "users") {
                mockDb.users[docId] = { ...mockDb.users[docId], ...data };
              } else if (collectionName === "whatsappData") {
                mockDb.whatsappData[docId] = { ...mockDb.whatsappData[docId], ...data };
              } else if (collectionName === "verificationCodes") {
                mockDb.verificationCodes[docId] = { ...mockDb.verificationCodes[docId], ...data };
              }
            },
            update: async (data: any) => {
              if (collectionName === "users" && mockDb.users[docId]) {
                mockDb.users[docId] = { ...mockDb.users[docId], ...data };
              } else if (collectionName === "whatsappData" && mockDb.whatsappData[docId]) {
                mockDb.whatsappData[docId] = { ...mockDb.whatsappData[docId], ...data };
              } else if (collectionName === "verificationCodes" && mockDb.verificationCodes[docId]) {
                mockDb.verificationCodes[docId] = { ...mockDb.verificationCodes[docId], ...data };
              }
            }
          };
        },
        where: () => ({
          get: async () => ({
            empty: false,
            docs: Object.keys(mockDb[collectionName] || {}).map(key => ({
              id: key,
              data: () => mockDb[collectionName][key],
              exists: true
            }))
          })
        }),
        add: async (data: any) => {
          const newId = `mock-${Date.now()}`;
          if (!mockDb[collectionName]) mockDb[collectionName] = {};
          mockDb[collectionName][newId] = data;
          return { id: newId };
        }
      };
    }
  } as unknown as firebase.firestore.Firestore;
  
  // Mock Storage
  storage = {
    ref: (path: string) => ({
      put: async (file: any) => ({
        ref: {
          getDownloadURL: async () => `https://mock-storage-url.com/${path}`
        }
      }),
      getDownloadURL: async () => `https://mock-storage-url.com/${path}`
    })
  } as unknown as firebase.storage.Storage;
  
} else {
  // Initialize real Firebase
  if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
  } else {
    app = firebase.app();
  }
  
  auth = firebase.auth();
  firestore = firebase.firestore();
  storage = firebase.storage();
}

export { auth, firestore, storage, isDemo, isDemo as usingDummyValues }; 