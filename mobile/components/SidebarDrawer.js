import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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
    { id: 'home', label: 'Home (Find Your Game)', icon: '🏠' },
    { id: 'explore', label: 'Explore & Venues', icon: '🧭' },
    { id: 'bookings', label: 'Pitch Bookings & Passes', icon: '📅' },
    { id: 'profile', label: 'User Profile & Settings', icon: '👤' }
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
              <View style={[styles.logoBadge, { backgroundColor: '#0052ff' }]}>
                <Text style={styles.logoBadgeText}>AA</Text>
              </View>
              <View>
                <Text style={[styles.drawerTitle, { color: theme.text }]}>Apex Athletics</Text>
                <Text style={[styles.drawerSubtitle, { color: theme.subText }]}>Indoor Sports Ecosystem</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ color: theme.subText, fontSize: 20, fontWeight: '800' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Links */}
          <ScrollView style={{ flex: 1, paddingVertical: 12 }}>
            <Text style={[styles.sectionTitle, { color: theme.subText }]}>APEX NAVIGATION</Text>

            {navItemsCore.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.navItem,
                    isActive && { backgroundColor: theme.badgeBg, borderColor: theme.primary, borderWidth: 1 }
                  ]}
                  onPress={() => navigateToTab(item.id)}
                >
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  <Text style={[styles.navLabel, { color: isActive ? theme.primary : theme.text }]}>
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

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <ThemeSelector />
            </View>
          </ScrollView>

          {/* Footer info */}
          <View style={[styles.drawerFooter, { borderTopColor: theme.border }]}>
            <Text style={[styles.footerText, { color: theme.subText }]}>Apex Athletics Mobile v1.0 • Expo 54</Text>
          </View>
        </View>

        {/* Backdrop Dismiss area */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  backdrop: {
    flex: 1
  },
  drawerContent: {
    width: '80%',
    maxWidth: 320,
    height: '100%',
    borderRightWidth: 1,
    paddingTop: 12
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoBadgeText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  drawerSubtitle: {
    fontSize: 11
  },
  closeBtn: {
    padding: 4
  },
  sectionTitle: {
    fontSize: 11,
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
    marginHorizontal: 10,
    borderRadius: 12,
    gap: 12,
    marginBottom: 4
  },
  navIcon: {
    fontSize: 18
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '700'
  },
  divider: {
    height: 1,
    marginVertical: 10,
    marginHorizontal: 16
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600'
  }
});
