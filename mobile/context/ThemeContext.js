import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Alert } from 'react-native';

const ThemeContext = createContext();

export const DARK_THEME = {
  mode: 'dark',
  bg: '#090d16',
  cardBg: '#111827',
  text: '#ffffff',
  subText: '#9ca3af',
  border: 'rgba(255, 255, 255, 0.08)',
  accent: '#10b981',
  headerBg: '#0d1322',
  navBg: '#111827',
  badgeBg: 'rgba(16, 185, 129, 0.15)',
  inputBg: '#111827',
  inputText: '#ffffff'
};

export const LIGHT_THEME = {
  mode: 'light',
  bg: '#f3f4f6',
  cardBg: '#ffffff',
  text: '#111827',
  subText: '#4b5563',
  border: 'rgba(0, 0, 0, 0.08)',
  accent: '#059669',
  headerBg: '#ffffff',
  navBg: '#ffffff',
  badgeBg: 'rgba(5, 150, 105, 0.12)',
  inputBg: '#ffffff',
  inputText: '#111827'
};

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme(); // Detects mobile OS setting ('dark' or 'light')
  const [themeMode, setThemeMode] = useState('system'); // 'dark' | 'light' | 'system'

  // Determine active colors based on themeMode and system preference
  const isDark =
    themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const changeThemeMode = (newMode) => {
    if (newMode === 'system') {
      Alert.alert(
        '📱 System Display Preference',
        `SportsAdda theme has been set to sync with your device system settings (${systemColorScheme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}).`,
        [{ text: 'OK' }]
      );
    }
    setThemeMode(newMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        systemColorScheme,
        isDark,
        setThemeMode: changeThemeMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
