import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import HomeScreen from './screens/HomeScreen';
import VenueDetailScreen from './screens/VenueDetailScreen';
import SlotCheckoutScreen from './screens/SlotCheckoutScreen';
import BookingsScreen from './screens/BookingsScreen';
import ProfileScreen from './screens/ProfileScreen';
import CricketLiveModal from './components/CricketLiveModal';
import LiveScoringConsoleModal from './components/LiveScoringConsoleModal';
import SportsStoreModal from './components/SportsStoreModal';
import TournamentTreeModal from './components/TournamentTreeModal';
import SidebarDrawer from './components/SidebarDrawer';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'explore' | 'checkout' | 'bookings' | 'profile'
  const [showSidebar, setShowSidebar] = useState(false);
  const [showLiveCricket, setShowLiveCricket] = useState(false);
  const [showScoringConsole, setShowScoringConsole] = useState(false);
  const [showSportsStore, setShowSportsStore] = useState(false);
  const [showTournaments, setShowTournaments] = useState(false);
  const { theme, isDark } = useTheme();

  const handleNavigate = (screen) => {
    setActiveTab(screen);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'explore':
      case 'venue_detail':
        return (
          <VenueDetailScreen
            onNavigate={handleNavigate}
            onCheckAvailability={() => setActiveTab('checkout')}
          />
        );
      case 'checkout':
        return (
          <SlotCheckoutScreen
            onNavigate={handleNavigate}
            onConfirmBooking={() => setActiveTab('bookings')}
          />
        );
      case 'bookings':
        return <BookingsScreen onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfileScreen onLogout={() => {
            if (logout) logout();
            setActiveTab('home');
          }} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Header Bar matching Stitch Apex Athletics */}
      <View style={[styles.headerBar, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            style={[styles.hamburgerBtn, { backgroundColor: theme.surfaceLow, borderColor: theme.border }]}
            onPress={() => setShowSidebar(true)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 18, color: theme.text, fontWeight: '800' }}>≡</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.brandTitle, { color: theme.primary }]}>Apex Athletics</Text>
            <View style={{ backgroundColor: 'rgba(0, 82, 255, 0.12)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
              <Text style={{ fontSize: 10, color: theme.primary, fontWeight: '800' }}>STITCH</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: theme.subText }}>Online</Text>
        </View>
      </View>

      {/* Main Screen Body */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Bottom Sticky Navigation Bar matching Stitch Design */}
      <View style={[styles.navBar, { backgroundColor: theme.navBg, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18 }}>🏠</Text>
          <Text style={[styles.navLabel, { color: activeTab === 'home' ? theme.primary : theme.subText }]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('explore')}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18 }}>🧭</Text>
          <Text style={[styles.navLabel, { color: (activeTab === 'explore' || activeTab === 'venue_detail') ? theme.primary : theme.subText }]}>
            Explore
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('bookings')}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18 }}>📅</Text>
          <Text style={[styles.navLabel, { color: (activeTab === 'bookings' || activeTab === 'checkout') ? theme.primary : theme.subText }]}>
            Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18 }}>👤</Text>
          <Text style={[styles.navLabel, { color: activeTab === 'profile' ? theme.primary : theme.subText }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals & Sidebar Drawer */}
      <CricketLiveModal visible={showLiveCricket} onClose={() => setShowLiveCricket(false)} />
      <LiveScoringConsoleModal visible={showScoringConsole} onClose={() => setShowScoringConsole(false)} />
      <SportsStoreModal visible={showSportsStore} onClose={() => setShowSportsStore(false)} />
      <TournamentTreeModal visible={showTournaments} onClose={() => setShowTournaments(false)} />
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
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    zIndex: 50
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2
  }
});
