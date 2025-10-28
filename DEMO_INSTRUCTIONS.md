# Roots Demo Instructions

This document provides detailed instructions for testing and exploring the Roots app demo.

## Setup Instructions

1. Make sure you have the Expo development environment set up:
   - Node.js installed (v14 or later)
   - Expo CLI: `npm install -g expo-cli`
   - If testing on a physical device, download the "Expo Go" app from the App Store or Google Play

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   npx expo start
   ```

4. Run the app on your preferred platform:
   - For iOS simulator: Press `i` in the terminal
   - For Android emulator: Press `a` in the terminal
   - For web: Press `w` in the terminal
   - On a physical device: Scan the QR code with the Expo Go app (Android) or Camera app (iOS)

## Demo Flow

The demo showcases the onboarding experience for a new user of the Roots app. Follow these steps to explore the full demo:

### 1. Hero Screen
- View the app's introductory screen
- Take note of the modern UI design and animation effects
- Press "Get Started" to proceed

### 2. Phone Verification
- Enter a 10-digit phone number (e.g., 9876543210)
- Observe the validation behavior
- Press "Send Verification Code" to proceed

### 3. OTP Verification
- Enter a 6-digit code (e.g., 123456)
- Notice the clear formatting of the OTP field
- Press "Verify" to proceed

### 4. Permissions Screen
- Toggle each permission switch
- Note how the Continue button is disabled until at least one permission is granted
- Read the explanations for each permission to understand the app's data usage
- Press "Continue" to proceed

### 5. Data Loading Screen
- Observe the animated loading progress
- Watch as the progress bar fills and steps complete
- Note the detailed breakdown of the analysis process
- This screen will automatically advance after the loading animation completes

### 6. Home/Success Screen
- View the demo completion screen
- Explore the initial insights generated for the user
- Press "Start Your Wellness Journey" to complete the demo

## Key Features to Test

- **Animations**: Observe smooth transitions between screens
- **Form Validation**: Try entering invalid inputs to see error messages
- **Permission Toggles**: Test enabling/disabling different permissions
- **Loading Animation**: Watch the progress bar and step indicators
- **Voice Feedback**: If testing on a device (not simulator), note the voice guidance

## Developer Notes

This demo focuses on the UI/UX of the onboarding flow. In a production app, these features would be implemented:

- Actual API calls for phone verification
- Real permission requests using device APIs
- Backend integration for data analysis
- Full navigation system for the main app experience
- Local storage for user preferences and data

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are installed: `npm install`
2. Clear the Metro bundler cache: `npx expo start -c`
3. Check that you're using a compatible Node.js version
4. Verify that the Expo Go app is up to date

For simulator-specific issues:
- iOS: Try restarting the simulator
- Android: Ensure the emulator has Google Play services installed

## Feedback

After exploring the demo, we'd appreciate your feedback on:
- Visual design and aesthetic
- Flow and usability
- Animation quality and smoothness
- Conceptual clarity of the app's purpose
- Any bugs or unexpected behavior 