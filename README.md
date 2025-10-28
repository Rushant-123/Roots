# 🌱 Roots - AI Wellness Companion & 3D Adventure

<div align="center">

![Roots Logo](assets/logo.png)

**An AI-powered wellness companion that combines mental health support with immersive 3D community exploration.**

[![React Native](https://img.shields.io/badge/React%20Native-0.73.6-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~52.0.0-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-blue.svg)](https://www.typescriptlang.org/)
[![Azure OpenAI](https://img.shields.io/badge/Azure%20OpenAI-4.91.1-green.svg)](https://azure.microsoft.com/en-us/products/ai-services/openai-service)

[🚀 Demo](#-demo) • [✨ Features](#-features) • [🛠️ Installation](#-installation) • [🎮 3D Game](#-3d-adventure) • [🤖 AI Features](#-ai-capabilities) • [📱 Screenshots](#-screenshots)

</div>

---

## 🌟 Overview

**Roots** is a revolutionary wellness app that seamlessly blends AI-powered mental health support with an immersive 3D social experience. Users can analyze their emotional patterns through WhatsApp conversations, receive personalized wellness insights, and explore beautiful 3D neighborhoods to build meaningful community connections.

## ✨ Features

### 🧠 AI Wellness Companion
- **Conversation Analysis**: Deep analysis of WhatsApp chats to understand emotional patterns and communication habits
- **Personalized Insights**: AI-generated wellness recommendations based on your unique communication style
- **Smart Coaching**: Real-time chat suggestions to improve communication and build deeper connections
- **Conflict Mediation**: AI-generated scripts to help resolve disagreements empathetically
- **Icebreaker Generator**: Context-aware conversation starters for different social situations

### 🌍 Community & Connection
- **Pod System**: Algorithm-based neighborhood grouping for local community building
- **Event Discovery**: Location-aware community events and activities
- **Social Matching**: Find like-minded people in your area based on interests and values
- **Real-time Chat**: Seamless messaging with pod members

### 🎮 3D Adventure Experience (Prototype)
- **Basic 3D World**: Simple HTML5 Canvas prototype with grids and concentric circles
- **Companion Characters**: Framework for AI companions (currently placeholder)
- **Touch Controls**: Basic navigation controls implemented
- **Unity Ready**: Architecture prepared for full Unity WebGL integration

### 🔒 Privacy-First Design
- **Local Processing**: Sensitive data processed on-device when possible
- **Granular Permissions**: Clear control over data access and usage
- **Encrypted Storage**: All user data encrypted and securely stored
- **Data Deletion**: Users can delete their data anytime

## 🚀 Demo

Experience the full onboarding flow and explore the main app features:

```bash
# Clone the repository
git clone https://github.com/yourusername/roots.git
cd roots

# Install dependencies
npm install

# Start the development server
npm start
```

### Demo Flow
1. **Welcome** - Beautiful animated introduction
2. **Phone Auth** - Secure SMS verification
3. **Permissions** - Granular privacy controls
4. **Companion Selection** - Choose your AI companion
5. **3D World** - Explore the immersive environment
6. **Pod Matching** - Connect with your community
7. **Main App** - Dashboard with insights and chat

## 🛠️ Installation

### Prerequisites
- **Node.js** (v14 or later)
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go** app on your phone (for testing)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/roots.git
cd roots

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm start
```

### Environment Setup

Create a `.env` file with your API keys:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=your_azure_endpoint
AZURE_OPENAI_API_KEY=your_azure_api_key
AZURE_OPENAI_API_VERSION=2023-05-15
AZURE_OPENAI_DEPLOYMENT_ID=your_deployment_id

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🎮 3D Adventure

### Current Implementation
- Basic HTML5 Canvas prototype with grids and concentric circles
- Simple touch controls for navigation
- Placeholder companion character system
- Mobile-responsive design framework

### Unity WebGL Integration (Future)
The architecture supports full Unity WebGL builds:

1. Export Unity build to `public/unity-webgl/`
2. Metro bundler serves static files
3. WebView component loads the 3D experience
4. Two-way communication between React Native and Unity

## 🤖 AI Capabilities

### Conversation Analysis
```typescript
// Analyze WhatsApp conversations for emotional patterns
const insights = await analyzeChatAndProvideCoaching(messages, userProfiles);
```

### Connection Suggestions
```typescript
// Get AI-powered connection recommendations
const suggestions = await getConnectionSuggestions(userId, userProfile, podMembers);
```

### Conflict Mediation
```typescript
// Generate empathetic resolution scripts
const mediationScript = await generateConflictMediationScript(
  conflictDescription,
  perspectiveA,
  perspectiveB
);
```

## 📱 Screenshots

<div align="center">

| Onboarding Flow | 3D World Prototype | Companion Selection |
|:---:|:---:|:---:|
| ![Onboarding](assets/onboarding-bg.jpg) | ![3D World](assets/select-comp.png) | ![Companion](assets/select-companion.png) |

*Note: Screenshots show current prototype state. 3D world displays basic canvas with grids and concentric circles.*

</div>

## 🏗️ Architecture

```
roots/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts for state management
│   ├── navigation/         # App navigation configuration
│   ├── screens/           # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── main/          # Main app screens
│   │   └── onboarding/    # Onboarding flow
│   └── services/          # Business logic & API integrations
│       ├── ai/            # Azure OpenAI services
│       ├── auth/          # Firebase authentication
│       ├── firebase/      # Firebase configuration
│       └── whatsapp/      # WhatsApp integration
├── assets/                # Images, animations, and media
├── public/               # Static files for WebGL builds
└── screens/              # Legacy screen components (being migrated)
```

## 🧪 Tech Stack

### Frontend
- **React Native 0.73.6** - Cross-platform mobile development
- **Expo ~52.0.0** - Development platform and native APIs
- **TypeScript 5.3.0** - Type-safe JavaScript
- **React Navigation 6.x** - Navigation library

### 3D & Graphics
- **Three.js 0.166.1** - 3D graphics library
- **Expo-GL 15.0.5** - OpenGL bindings for Expo
- **Expo-Three 8.0.0** - Three.js integration

### AI & Backend
- **Azure OpenAI 4.91.1** - AI-powered features
- **Firebase 9.19.1** - Backend services and authentication
- **@react-native-async-storage/async-storage** - Local storage

### UI & Animations
- **React Native Animatable 1.3.3** - Smooth animations
- **Lottie React Native 7.1.0** - Vector animations
- **Expo Linear Gradient** - Gradient backgrounds
- **Expo Vector Icons** - Icon library

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run TypeScript checks
npm run tsc

# Run linter
npm run lint
```

### Project Structure
- **Feature branches** for new features
- **Pull requests** with detailed descriptions
- **Tests** for new functionality
- **Documentation** updates for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Native & Expo** teams for the amazing development platform
- **Azure OpenAI** for powerful AI capabilities
- **Firebase** for robust backend services
- **Three.js** community for 3D graphics support
- **Mental health research** community for wellness insights

## 📞 Contact

- **Project Lead**: [Your Name]
- **Email**: your.email@example.com
- **LinkedIn**: [Your LinkedIn]
- **Twitter**: [@yourhandle]

---

<div align="center">

**Made with ❤️ for better mental health and stronger communities**

[⭐ Star us on GitHub](https://github.com/yourusername/roots) • [📱 Download on App Store](#) • [🤖 Download on Play Store](#)

</div> 