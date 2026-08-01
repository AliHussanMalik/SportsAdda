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
            { borderColor: theme.border },
            themeMode === 'dark' && { backgroundColor: theme.accent, borderColor: theme.accent }
          ]}
          onPress={() => setThemeMode('dark')}
        >
          <Text style={[styles.optionText, { color: themeMode === 'dark' ? '#fff' : theme.text }]}>
            🌙 Dark
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionBtn,
            { borderColor: theme.border },
            themeMode === 'light' && { backgroundColor: theme.accent, borderColor: theme.accent }
          ]}
          onPress={() => setThemeMode('light')}
        >
          <Text style={[styles.optionText, { color: themeMode === 'light' ? '#fff' : theme.text }]}>
            ☀️ Light
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionBtn,
            { borderColor: theme.border },
            themeMode === 'system' && { backgroundColor: theme.accent, borderColor: theme.accent }
          ]}
          onPress={() => setThemeMode('system')}
        >
          <Text style={[styles.optionText, { color: themeMode === 'system' ? '#fff' : theme.text }]}>
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
    marginBottom: 16
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 12
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1
  },
  optionText: {
    fontSize: 12,
    fontWeight: '800'
  }
});
