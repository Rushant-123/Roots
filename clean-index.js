// Simple entry point file with minimal dependencies
import 'react-native-gesture-handler'; // Keep this first import
import { registerRootComponent } from 'expo';
import CleanApp from './CleanApp';

// Register the clean app component
registerRootComponent(CleanApp); 