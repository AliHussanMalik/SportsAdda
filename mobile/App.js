import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import AuthScreen from './screens/AuthScreen';
import BookingsScreen from './screens/BookingsScreen';
import TeamsScreen from './screens/TeamsScreen';
import CricketLiveModal from './components/CricketLiveModal';

function MainApp() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [showLiveCricket, setShowLiveCricket] = useState(false);
  const { theme, isDark } = useTheme();

  const renderScreen = () => {
    switch (activeTab) {
      case 'profiles':
        return <AuthScreen />;
      case 'bookings':
        return <BookingsScreen />;
      case 'teams':
        return <TeamsScreen />;
      default:
        return <BookingsScreen />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.brandTitle, { color: theme.text }]}>SportsAdda</Text>
          <Text style={[styles.countryTag, { color: theme.subText }]}> 🇵🇰 PK</Text>
        </View>

        <TouchableOpacity
          style={[styles.liveScoreBtn, { backgroundColor: theme.badgeBg, borderColor: theme.accent }]}
          onPress={() => setShowLiveCricket(true)}
        >
          <View style={[styles.liveDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.liveScoreText, { color: theme.accent }]}>🏏 Live Scorecard</Text>
        </TouchableOpacity>
      </View>

      {/* Main Screen Body */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Bottom Navigation Bar */}
      <View style={[styles.navBar, { backgroundColor: theme.navBg, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'profiles' && { backgroundColor: theme.badgeBg }]}
          onPress={() => setActiveTab('profiles')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={[styles.navLabel, { color: theme.subText }, activeTab === 'profiles' && { color: theme.accent }]}>
            Profiles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'bookings' && { backgroundColor: theme.badgeBg }]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={styles.navIcon}>📅</Text>
          <Text style={[styles.navLabel, { color: theme.subText }, activeTab === 'bookings' && { color: theme.accent }]}>
            Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'teams' && { backgroundColor: theme.badgeBg }]}
          onPress={() => setActiveTab('teams')}
        >
          <Text style={styles.navIcon}>🛡️</Text>
          <Text style={[styles.navLabel, { color: theme.subText }, activeTab === 'teams' && { color: theme.accent }]}>
            Teams
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cricket Live Score Modal */}
      <CricketLiveModal visible={showLiveCricket} onClose={() => setShowLiveCricket(false)} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  countryTag: {
    fontSize: 13,
    fontWeight: '700'
  },
  liveScoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6
  },
  liveScoreText: {
    fontSize: 11,
    fontWeight: '800'
  },
  content: {
    flex: 1
  },
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingBottom: 16,
    justifyContent: 'space-around'
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12
  },
  navIcon: {
    fontSize: 20
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  }
});
