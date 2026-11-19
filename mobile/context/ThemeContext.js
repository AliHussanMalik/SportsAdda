import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Appearance, Alert } from 'react-native';

const ThemeContext = createContext();

export const DARK_THEME = {
  mode: 'dark',
  bg: '#0b0f19',
  surface: '#131b2e',
  surfaceLow: '#0f172a',
  surfaceHigh: '#1e293b',
  cardBg: '#131b2e',
  text: '#f8fafc',
  subText: '#94a3b8',
  border: 'rgba(255, 255, 255, 0.1)',
  primary: '#0052ff',
  primaryDark: '#003ec7',
  accent: '#0052ff',
  headerBg: '#0f172a',
  navBg: '#131b2e',
  badgeBg: 'rgba(0, 82, 255, 0.18)',
  inputBg: '#1e293b',
  inputText: '#ffffff'
};

export const LIGHT_THEME = {
  mode: 'light',
  bg: '#faf8ff',
  surface: '#ffffff',
  surfaceLow: '#f2f3ff',
  surfaceHigh: '#e2e7ff',
  cardBg: '#ffffff',
  text: '#131b2e',
  subText: '#505f76',
  border: 'rgba(19, 27, 46, 0.1)',
  primary: '#0052ff',
  primaryDark: '#003ec7',
  accent: '#0052ff',
  headerBg: '#ffffff',
  navBg: '#ffffff',
  badgeBg: 'rgba(0, 82, 255, 0.12)',
  inputBg: '#ffffff',
  inputText: '#131b2e'
};

export function ThemeProvider({ children }) {
  const hookColorScheme = useColorScheme();
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || hookColorScheme || 'light');
  const [themeMode, setThemeMode] = useState('system'); // 'dark' | 'light' | 'system'

  useEffect(() => {
    const current = Appearance.getColorScheme() || hookColorScheme || 'light';
    setSystemScheme(current);

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setSystemScheme(colorScheme);
      }
    });

    return () => subscription.remove();
  }, [hookColorScheme]);

  const activeScheme = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = activeScheme === 'dark';
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const changeThemeMode = (newMode) => {
    if (newMode === 'system') {
      const activeOsMode = (systemScheme || 'light').toUpperCase();
      Alert.alert(
        '📱 System Display Preference',
        `Apex Athletics theme has been set to sync with your device OS settings (${activeOsMode} MODE ACTIVE).`,
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
        systemColorScheme: systemScheme,
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
