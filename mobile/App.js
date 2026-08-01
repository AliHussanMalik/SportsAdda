import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import AuthScreen from './screens/AuthScreen';
import BookingsScreen from './screens/BookingsScreen';
import TeamsScreen from './screens/TeamsScreen';
import CricketLiveModal from './components/CricketLiveModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [showLiveCricket, setShowLiveCricket] = useState(false);

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={styles.headerBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.brandTitle}>SportsAdda</Text>
          <Text style={styles.countryTag}> 🇵🇰 PK</Text>
        </View>

        <TouchableOpacity style={styles.liveScoreBtn} onPress={() => setShowLiveCricket(true)}>
          <View style={styles.liveDot} />
          <Text style={styles.liveScoreText}>🏏 Live Scorecard</Text>
        </TouchableOpacity>
      </View>

      {/* Main Screen Body */}
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

      {/* Cricket Live Score Modal */}
      <CricketLiveModal visible={showLiveCricket} onClose={() => setShowLiveCricket(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0d1322',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  brandTitle: {
    color: '#fff',
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)'
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6
  },
  liveScoreText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800'
  },
  content: {
    flex: 1
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
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
  activeNavItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)'
  },
  navIcon: {
    fontSize: 20
  },
  navLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  },
  activeNavLabel: {
    color: '#10b981'
  }
});
