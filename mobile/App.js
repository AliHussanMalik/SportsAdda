import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import AuthScreen from './screens/AuthScreen';
import BookingsScreen from './screens/BookingsScreen';
import TeamsScreen from './screens/TeamsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('profiles');

  const renderScreen = () => {
    switch (activeTab) {
      case 'profiles':
        return <AuthScreen />;
      case 'bookings':
        return <BookingsScreen />;
      case 'teams':
        return <TeamsScreen />;
      default:
        return <AuthScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Screen Body */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'profiles' && styles.activeNavItem]}
          onPress={() => setActiveTab('profiles')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={[styles.navLabel, activeTab === 'profiles' && styles.activeNavLabel]}>Profiles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'bookings' && styles.activeNavItem]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={styles.navIcon}>📅</Text>
          <Text style={[styles.navLabel, activeTab === 'bookings' && styles.activeNavLabel]}>Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'teams' && styles.activeNavItem]}
          onPress={() => setActiveTab('teams')}
        >
          <Text style={styles.navIcon}>🛡️</Text>
          <Text style={[styles.navLabel, activeTab === 'teams' && styles.activeNavLabel]}>Teams</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8,
    paddingBottom: 16,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeNavItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  activeNavLabel: {
    color: '#10b981',
  },
});
