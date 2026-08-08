import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemeSelector from './ThemeSelector';

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
  const { theme } = useTheme();

  if (!visible) return null;

  const navigateToTab = (tab) => {
    setActiveTab(tab);
    onClose();
  };

  const navItemsCore = [
    { id: 'profiles', label: 'Player Profiles & Roles', icon: '👤' },
    { id: 'bookings', label: 'Indoor Pitch Bookings', icon: '🏟️' },
    { id: 'teams', label: 'Teams & Squad Rosters', icon: '👥' }
  ];

  const navItemsEngines = [
    { label: 'Single-Scorer Engine', icon: '🏏', action: onOpenScoringConsole },
    { label: 'Tournament Tree Brackets', icon: '🏆', action: onOpenTournaments },
    { label: 'Sports Store & Sponsored Ads', icon: '🛍️', action: onOpenSportsStore },
    { label: 'Live Cricket Feed (RSS)', icon: '📻', action: onOpenLiveCricket }
  ];

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Sliding Left Sidebar Drawer */}
        <View style={[styles.drawerContent, { backgroundColor: theme.cardBg, borderRightColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.drawerHeader, { borderBottomColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.logoBadge, { backgroundColor: theme.accent }]}>
                <Text style={styles.logoBadgeText}>SA</Text>
              </View>
              <View>
                <Text style={[styles.drawerTitle, { color: theme.text }]}>SportsAdda</Text>
                <Text style={[styles.drawerSubtitle, { color: theme.subText }]}>Indoor Sports Ecosystem</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ color: theme.subText, fontSize: 20, fontWeight: '800' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Links */}
          <ScrollView style={{ flex: 1, paddingVertical: 12 }}>
            <Text style={[styles.sectionTitle, { color: theme.subText }]}>CORE MANAGEMENT</Text>

            {navItemsCore.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.navItem,
                    isActive && { backgroundColor: theme.badgeBg, borderColor: theme.accent, borderWidth: 1 }
                  ]}
                  onPress={() => navigateToTab(item.id)}
                >
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  <Text style={[styles.navLabel, { color: isActive ? theme.accent : theme.text }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <Text style={[styles.sectionTitle, { color: theme.subText }]}>MATCH ENGINE & MODALS</Text>

            {navItemsEngines.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.navItem}
                onPress={() => {
                  onClose();
                  if (item.action) item.action();
                }}
              >
                <Text style={styles.navIcon}>{item.icon}</Text>
                <Text style={[styles.navLabel, { color: theme.text }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer Theme Control */}
          <View style={[styles.drawerFooter, { borderTopColor: theme.border, backgroundColor: theme.navBg }]}>
            <ThemeSelector />
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
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoBadgeText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '900'
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
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
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
    minHeight: 50,
    marginHorizontal: 8,
    marginVertical: 3,
    borderRadius: 12
  },
  navIcon: {
    fontSize: 18,
    marginRight: 14
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
  }
});
