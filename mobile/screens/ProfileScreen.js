import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

import { API_BASE } from '../config';

export default function ProfileScreen({ onLogout }) {
  const { theme } = useTheme();
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${API_BASE}/auth/profiles`);
        const data = await res.json();
        if (data.success && Array.isArray(data.profiles) && data.profiles.length > 0) {
          setProfile(data.profiles[0]);
        }
      } catch (err) {
        console.warn('Mobile API profile fetch error:', err);
      }
    }
    loadProfile();
  }, []);

  const userName = profile?.display_name || 'Sarah Mitchell';
  const userSub = profile ? `${profile.role} • ${profile.primary_sport}` : 'Member since 2021';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingBottom: 110 }}>
      {/* Profile Header & Info Card */}
      <View style={[styles.profileHeaderCard, { backgroundColor: theme.surface }]}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' }}
            style={styles.avatarImage}
          />
          <TouchableOpacity style={[styles.editBadge, { backgroundColor: theme.primary }]}>
            <Text style={{ fontSize: 10, color: '#ffffff' }}>✏️</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
        <Text style={[styles.userSub, { color: theme.subText }]}>{userSub}</Text>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: theme.surfaceLow }]}>
            <Text style={[styles.statNum, { color: theme.primary }]}>24</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>Total Bookings</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.surfaceLow }]}>
            <Text style={[styles.statNum, { color: theme.primary }]}>36</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>Hours Played</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.surfaceLow }]}>
            <Text style={{ fontSize: 20, marginBottom: 2 }}>🎾</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>Top Sport</Text>
          </View>
        </View>
      </View>

      {/* Account Settings */}
      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={[styles.sectionHeading, { color: theme.subText }]}>ACCOUNT SETTINGS</Text>

        <View style={[styles.optionsGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.optionRow}>
            <View style={[styles.optionIconBox, { backgroundColor: theme.surfaceLow }]}>
              <Text style={{ fontSize: 16 }}>👤</Text>
            </View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Personal Information</Text>
            <Text style={{ fontSize: 14, color: theme.subText }}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.optionRow}>
            <View style={[styles.optionIconBox, { backgroundColor: theme.surfaceLow }]}>
              <Text style={{ fontSize: 16 }}>💳</Text>
            </View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Payment Methods</Text>
            <Text style={{ fontSize: 14, color: theme.subText }}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.optionRow}>
            <View style={[styles.optionIconBox, { backgroundColor: theme.surfaceLow }]}>
              <Text style={{ fontSize: 16 }}>🔔</Text>
            </View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Notifications</Text>
            <Text style={{ fontSize: 14, color: theme.subText }}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.optionRow}>
            <View style={[styles.optionIconBox, { backgroundColor: theme.surfaceLow }]}>
              <Text style={{ fontSize: 16 }}>🔒</Text>
            </View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Security</Text>
            <Text style={{ fontSize: 14, color: theme.subText }}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.optionRow}>
            <View style={[styles.optionIconBox, { backgroundColor: theme.surfaceLow }]}>
              <Text style={{ fontSize: 16 }}>📜</Text>
            </View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Privacy Policy</Text>
            <Text style={{ fontSize: 14, color: theme.subText }}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Help & Support */}
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Text style={[styles.sectionHeading, { color: theme.subText }]}>HELP & SUPPORT</Text>

        <View style={[styles.optionsGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.optionRow}>
            <View style={[styles.optionIconBox, { backgroundColor: theme.surfaceLow }]}>
              <Text style={{ fontSize: 16 }}>❓</Text>
            </View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Help Center</Text>
            <Text style={{ fontSize: 14, color: theme.subText }}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.optionRow}>
            <View style={[styles.optionIconBox, { backgroundColor: theme.surfaceLow }]}>
              <Text style={{ fontSize: 16 }}>🎧</Text>
            </View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Contact Us</Text>
            <Text style={{ fontSize: 14, color: theme.subText }}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Log Out Button */}
      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert('Log Out', 'Are you sure you want to log out of Apex Athletics?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: () => onLogout && onLogout() }
            ]);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>🚪 Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  profileHeaderCard: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
    marginBottom: 12
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  userName: {
    fontSize: 20,
    fontWeight: '800'
  },
  userSub: {
    fontSize: 12,
    marginTop: 2
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    width: '100%'
  },
  statBox: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800'
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4
  },
  optionsGroup: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden'
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12
  },
  optionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700'
  },
  divider: {
    height: 1,
    marginLeft: 64
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '800'
  }
});
