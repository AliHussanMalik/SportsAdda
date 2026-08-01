import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import AuthScreen from './screens/AuthScreen';
import BookingsScreen from './screens/BookingsScreen';
import TeamsScreen from './screens/TeamsScreen';
import CricketLiveModal from './components/CricketLiveModal';
import LiveScoringConsoleModal from './components/LiveScoringConsoleModal';
import SportsStoreModal from './components/SportsStoreModal';
import TournamentTreeModal from './components/TournamentTreeModal';

function MainApp() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [showLiveCricket, setShowLiveCricket] = useState(false);
  const [showScoringConsole, setShowScoringConsole] = useState(false);
  const [showSportsStore, setShowSportsStore] = useState(false);
  const [showTournaments, setShowTournaments] = useState(false);
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

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {/* Tournament Tree Button */}
          <TouchableOpacity
            style={[styles.liveScoreBtn, { backgroundColor: 'rgba(139, 92, 246, 0.15)', borderColor: '#8b5cf6' }]}
            onPress={() => setShowTournaments(true)}
          >
            <Text style={[styles.liveScoreText, { color: '#8b5cf6' }]}>🏆 Brackets</Text>
          </TouchableOpacity>

          {/* Sports Store & Ads Button */}
          <TouchableOpacity
            style={[styles.liveScoreBtn, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b' }]}
            onPress={() => setShowSportsStore(true)}
          >
            <Text style={[styles.liveScoreText, { color: '#f59e0b' }]}>🛒 Store</Text>
          </TouchableOpacity>

          {/* Live Scoring Console Button */}
          <TouchableOpacity
            style={[styles.liveScoreBtn, { backgroundColor: 'rgba(6, 182, 212, 0.15)', borderColor: '#06b6d4' }]}
            onPress={() => setShowScoringConsole(true)}
          >
            <Text style={[styles.liveScoreText, { color: '#06b6d4' }]}>⚡ Score</Text>
          </TouchableOpacity>

          {/* Live Scorecard Button */}
          <TouchableOpacity
            style={[styles.liveScoreBtn, { backgroundColor: theme.badgeBg, borderColor: theme.accent }]}
            onPress={() => setShowLiveCricket(true)}
          >
            <View style={[styles.liveDot, { backgroundColor: theme.accent }]} />
            <Text style={[styles.liveScoreText, { color: theme.accent }]}>🏏 RSS</Text>
          </TouchableOpacity>
        </View>
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

      {/* Real-time Conflict-Free Live Scoring Console Modal */}
      <LiveScoringConsoleModal visible={showScoringConsole} onClose={() => setShowScoringConsole(false)} />

      {/* Sports Center Sponsored Ads & Online Delivery Store Modal */}
      <SportsStoreModal visible={showSportsStore} onClose={() => setShowSportsStore(false)} />

      {/* Tournament Tree Graph & Organizer Rating Modal */}
      <TournamentTreeModal visible={showTournaments} onClose={() => setShowTournaments(false)} />
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
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  countryTag: {
    fontSize: 11,
    fontWeight: '700'
  },
  liveScoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 3
  },
  liveScoreText: {
    fontSize: 9.5,
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
    justify.content: 'space-around'
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
