import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  success: string;
  warning: string;
  error: string;
}

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
}

const lightColors: ThemeColors = {
  primary: '#4CAF50',   // Green primary color for Roots
  secondary: '#81C784', // Lighter green for secondary elements
  background: '#FFFFFF',
  card: '#F5F5F5',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  notification: '#FF9800',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

const darkColors: ThemeColors = {
  primary: '#81C784',   // Lighter green for dark theme
  secondary: '#4CAF50', // Primary green for secondary elements in dark
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  border: '#333333',
  notification: '#FFB74D',
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
};

const defaultContext: ThemeContextType = {
  theme: 'system',
  colors: lightColors,
  isDark: false,
  setTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('system');
  const colorScheme = useColorScheme();
  
  // Determine if we're in dark mode based on theme setting and system preference
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');
  
  // Get the colors based on the theme
  const colors = isDark ? darkColors : lightColors;
  
  // Monitor for changes to colorScheme when using system theme
  useEffect(() => {
    if (theme === 'system') {
      // Force a re-render when system theme changes
    }
  }, [colorScheme, theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 