import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AuthScreen from './screens/AuthScreen';
import BookingsScreen from './screens/BookingsScreen';
import TeamsScreen from './screens/TeamsScreen';
import CricketLiveModal from './components/CricketLiveModal';
import LiveScoringConsoleModal from './components/LiveScoringConsoleModal';
import SportsStoreModal from './components/SportsStoreModal';
import TournamentTreeModal from './components/TournamentTreeModal';
import SidebarDrawer from './components/SidebarDrawer';

function MainApp() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [showSidebar, setShowSidebar] = useState(false);
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Single Hamburger Menu Toggle for Sidebar */}
          <TouchableOpacity
            style={[styles.hamburgerBtn, { backgroundColor: theme.badgeBg, borderColor: theme.border }]}
            onPress={() => setShowSidebar(true)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 18, color: theme.text, fontWeight: '800' }}>≡</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.brandTitle, { color: theme.text }]}>SportsAdda</Text>
            <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
              <Text style={{ fontSize: 10, color: theme.accent, fontWeight: '800' }}>PK</Text>
            </View>
          </View>
        </View>

        {/* Header Right Status Pill */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent }} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText }}>Online</Text>
        </View>
      </View>

      {/* Main Screen Body */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Responsive Bottom Navigation Bar with Safe Area Inset Padding */}
      <View style={[styles.navBar, { backgroundColor: theme.navBg, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'profiles' && { backgroundColor: theme.badgeBg }]}
          onPress={() => setActiveTab('profiles')}
        >
          <Text style={[styles.navLabel, { color: theme.subText }, activeTab === 'profiles' && { color: theme.accent }]}>
            Profiles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'bookings' && { backgroundColor: theme.badgeBg }]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={[styles.navLabel, { color: theme.subText }, activeTab === 'bookings' && { color: theme.accent }]}>
            Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'teams' && { backgroundColor: theme.badgeBg }]}
          onPress={() => setActiveTab('teams')}
        >
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

      {/* Navigation Sidebar Drawer */}
      <SidebarDrawer
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScoringConsole={() => setShowScoringConsole(true)}
        onOpenTournaments={() => setShowTournaments(true)}
        onOpenSportsStore={() => setShowSportsStore(true)}
        onOpenLiveCricket={() => setShowLiveCricket(true)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
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
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  content: {
    flex: 1
  },
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 64,
    elevation: 10,
    zIndex: 50
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '800'
  }
});
