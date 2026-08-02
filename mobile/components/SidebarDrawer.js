import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SidebarDrawer({
  visible,
  onClose,
  activeTab,
  setActiveTab,
  onOpenScoringConsole,
  onOpenTournaments,
  onOpenSportsStore,
  onOpenLiveCricket
}) {
  const { theme, isDark, toggleTheme } = useTheme();

  if (!visible) return null;

  const navigateToTab = (tab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Sliding Left Sidebar Drawer */}
        <View style={[styles.drawerContent, { backgroundColor: theme.cardBg, borderRightColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.drawerHeader, { borderBottomColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.logoBadge}>
                <Text style={{ fontSize: 14, color: '#fff', fontWeight: '900' }}>SA</Text>
              </View>
              <View>
                <Text style={[styles.drawerTitle, { color: theme.text }]}>SportsAdda</Text>
                <Text style={[styles.drawerSubtitle, { color: theme.subText }]}>Indoor Sports Ecosystem</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ color: theme.subText, fontSize: 18, fontWeight: '800' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Links */}
          <ScrollView style={{ flex: 1, paddingVertical: 12 }}>
            <Text style={[styles.sectionTitle, { color: theme.subText }]}>CORE MANAGEMENT</Text>

            <TouchableOpacity
              style={[styles.navItem, activeTab === 'profiles' && { backgroundColor: theme.badgeBg }]}
              onPress={() => navigateToTab('profiles')}
            >
              <Text style={[styles.navLabel, { color: activeTab === 'profiles' ? theme.accent : theme.text }]}>
                Player Profiles & Roles
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navItem, activeTab === 'bookings' && { backgroundColor: theme.badgeBg }]}
              onPress={() => navigateToTab('bookings')}
            >
              <Text style={[styles.navLabel, { color: activeTab === 'bookings' ? theme.accent : theme.text }]}>
                Indoor Pitch Bookings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navItem, activeTab === 'teams' && { backgroundColor: theme.badgeBg }]}
              onPress={() => navigateToTab('teams')}
            >
              <Text style={[styles.navLabel, { color: activeTab === 'teams' ? theme.accent : theme.text }]}>
                Teams & Squad Rosters
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <Text style={[styles.sectionTitle, { color: theme.subText }]}>MATCH ENGINE & MODALS</Text>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                onClose();
                onOpenScoringConsole();
              }}
            >
              <Text style={[styles.navLabel, { color: '#06b6d4' }]}>
                Single-Scorer Engine
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                onClose();
                onOpenTournaments();
              }}
            >
              <Text style={[styles.navLabel, { color: '#8b5cf6' }]}>
                Tournament Tree Brackets
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                onClose();
                onOpenSportsStore();
              }}
            >
              <Text style={[styles.navLabel, { color: '#f59e0b' }]}>
                Sports Store & Sponsored Ads
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                onClose();
                onOpenLiveCricket();
              }}
            >
              <Text style={[styles.navLabel, { color: theme.accent }]}>
                Live Cricket Feed (RSS)
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer Theme Toggle */}
          <View style={[styles.drawerFooter, { borderTopColor: theme.border, backgroundColor: theme.navBg }]}>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
              <Text style={[styles.themeBtnText, { color: theme.text }]}>
                Theme: {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Backdrop Dismiss Area on Right Side */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  backdrop: {
    flex: 1
  },
  drawerContent: {
    width: 290,
    height: '100%',
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center'
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  drawerSubtitle: {
    fontSize: 10,
    fontWeight: '600'
  },
  closeBtn: {
    padding: 6
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 10
  },
  navIcon: {
    fontSize: 18,
    marginRight: 12
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '700'
  },
  divider: {
    height: 1,
    marginVertical: 10,
    marginHorizontal: 16
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  themeBtnText: {
    fontSize: 13,
    fontWeight: '700'
  }
});
