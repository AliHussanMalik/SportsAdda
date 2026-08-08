import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSelector() {
  const { theme, themeMode, setThemeMode, systemColorScheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>🎨 Display Theme Settings</Text>
      <Text style={[styles.subtitle, { color: theme.subText }]}>
        Device System Mode: {systemColorScheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.optionBtn,
            { borderColor: theme.border, backgroundColor: themeMode === 'dark' ? theme.accent : 'transparent' }
          ]}
          onPress={() => setThemeMode('dark')}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionText, { color: themeMode === 'dark' ? '#ffffff' : theme.text }]}>
            🌙 Dark
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionBtn,
            { borderColor: theme.border, backgroundColor: themeMode === 'light' ? theme.accent : 'transparent' }
          ]}
          onPress={() => setThemeMode('light')}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionText, { color: themeMode === 'light' ? '#ffffff' : theme.text }]}>
            ☀️ Light
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionBtn,
            { borderColor: theme.border, backgroundColor: themeMode === 'system' ? theme.accent : 'transparent' }
          ]}
          onPress={() => setThemeMode('system')}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionText, { color: themeMode === 'system' ? '#ffffff' : theme.text }]}>
            📱 System
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 10
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8
  },
  optionBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  optionText: {
    fontSize: 12,
    fontWeight: '800'
  }
});
