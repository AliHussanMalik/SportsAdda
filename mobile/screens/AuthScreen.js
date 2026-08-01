import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { API_BASE } from '../config';

export default function AuthScreen() {
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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>👤 Player Profiles</Text>
      <Text style={styles.subtitle}>Specialized Profile Tiers & Role Badges</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProfiles}>
            <Text style={styles.retryText}>🔄 Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        profiles.map((p) => (
          <View key={p.user_id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>#{p.jersey_number || 0}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{p.display_name}</Text>
                <Text style={styles.sportRole}>{p.primary_sport} • {p.preferred_role}</Text>
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
                    <Text style={styles.statVal}>{p.total_saves || 0}</Text>
                    <Text style={styles.statLbl}>Saves</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statVal}>{p.clean_sheets || 0}</Text>
                    <Text style={styles.statLbl}>Clean Sheets</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statVal}>{p.stumpings || p.penalties_saved || 0}</Text>
                    <Text style={styles.statLbl}>{p.keeper_type === 'WICKETKEEPER' ? 'Stumpings' : 'Penalties'}</Text>
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
  container: { flex: 1, backgroundColor: '#090d16' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginBottom: 16 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  name: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sportRole: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
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
  statVal: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statLbl: { color: '#9ca3af', fontSize: 10 },
  errorContainer: { alignItems: 'center', marginTop: 40, padding: 16 },
  errorText: { color: '#ef4444', fontSize: 14, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  retryBtn: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 13 }
});
