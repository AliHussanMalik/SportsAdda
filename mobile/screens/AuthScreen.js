import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { API_BASE } from '../config';
import { useTheme } from '../context/ThemeContext';
import ThemeSelector from '../components/ThemeSelector';

export default function AuthScreen() {
  const { theme } = useTheme();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${API_BASE}/auth/profiles`, {
        signal: controller.signal,
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles);
      } else {
        setError(data.error || 'Failed to fetch profiles');
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.error('AuthScreen fetch error:', e);
      setError(e.name === 'AbortError' ? 'Connection timed out. Check backend server.' : 'Network request failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleToggleTier = async (userId, currentTier) => {
    const nextTier = currentTier === 'PRO' ? 'FREE' : 'PRO';
    try {
      const res = await fetch(`${API_BASE}/auth/profiles/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_tier: nextTier })
      });
      if (res.ok) fetchProfiles();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.title, { color: theme.text }]}>👤 Player Profiles & Settings</Text>
      <Text style={[styles.subtitle, { color: theme.subText }]}>Specialized Profile Tiers & Theme Preferences</Text>

      {/* Theme Switcher Widget */}
      <ThemeSelector />

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 20 }} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.accent }]} onPress={fetchProfiles}>
            <Text style={styles.retryText}>🔄 Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        profiles.map((p) => (
          <View key={p.user_id} style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
                <Text style={styles.avatarText}>#{p.jersey_number || 0}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.name, { color: theme.text }]}>{p.display_name}</Text>
                <Text style={[styles.sportRole, { color: theme.subText }]}>{p.primary_sport} • {p.preferred_role}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleToggleTier(p.user_id, p.subscription_tier)}
                style={[styles.badge, p.subscription_tier === 'PRO' ? styles.badgePro : styles.badgeFree]}
              >
                <Text style={styles.badgeText}>{p.subscription_tier}</Text>
              </TouchableOpacity>
            </View>

            {/* Badges */}
            <View style={styles.badgesRow}>
              {p.is_captain && <View style={[styles.miniBadge, { backgroundColor: 'rgba(16,185,129,0.2)' }]}><Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 11 }}>👑 CAPTAIN</Text></View>}
              {p.is_coach && <View style={[styles.miniBadge, { backgroundColor: 'rgba(139,92,246,0.2)' }]}><Text style={{ color: '#a78bfa', fontWeight: 'bold', fontSize: 11 }}>📋 COACH</Text></View>}
              {p.is_keeper && <View style={[styles.miniBadge, { backgroundColor: 'rgba(6,182,212,0.2)' }]}><Text style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: 11 }}>🧤 {p.keeper_type}</Text></View>}
            </View>

            {/* Keeper Stats Box */}
            {p.is_keeper && (
              <View style={styles.keeperBox}>
                <Text style={styles.keeperBoxTitle}>🧤 Keeper Performance Metrics</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statCol}>
                    <Text style={[styles.statVal, { color: theme.text }]}>{p.total_saves || 0}</Text>
                    <Text style={[styles.statLbl, { color: theme.subText }]}>Saves</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={[styles.statVal, { color: theme.text }]}>{p.clean_sheets || 0}</Text>
                    <Text style={[styles.statLbl, { color: theme.subText }]}>Clean Sheets</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={[styles.statVal, { color: theme.text }]}>{p.stumpings || p.penalties_saved || 0}</Text>
                    <Text style={[styles.statLbl, { color: theme.subText }]}>{p.keeper_type === 'WICKETKEEPER' ? 'Stumpings' : 'Penalties'}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginBottom: 16 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  name: { fontSize: 16, fontWeight: '700' },
  sportRole: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgePro: { backgroundColor: '#f59e0b' },
  badgeFree: { backgroundColor: '#374151' },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#000' },
  badgesRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  keeperBox: {
    marginTop: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderRadius: 12,
    padding: 12
  },
  keeperBoxTitle: { color: '#22d3ee', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statCol: { alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '800' },
  statLbl: { fontSize: 10 },
  errorContainer: { alignItems: 'center', marginTop: 40, padding: 16 },
  errorText: { color: '#ef4444', fontSize: 14, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 13 }
});
