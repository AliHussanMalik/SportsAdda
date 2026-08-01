import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { API_BASE } from '../config';

export default function TeamsScreen() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${API_BASE}/teams`, {
        signal: controller.signal,
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams);
      } else {
        setError(data.error || 'Failed to fetch teams');
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.error('TeamsScreen fetch error:', e);
      setError(e.name === 'AbortError' ? 'Connection timed out. Check backend server.' : 'Network request failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamRoster = async (teamId) => {
    try {
      const res = await fetch(`${API_BASE}/teams/${teamId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedTeam(data.team);
        setRoster(data.roster);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>🛡️ Teams & Squad Rosters</Text>
      <Text style={styles.subtitle}>Team branding, roster management, squad roles</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#06b6d4" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchTeams}>
            <Text style={styles.retryText}>🔄 Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {teams.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.teamCard, selectedTeam?.id === t.id && styles.selectedCard]}
              onPress={() => fetchTeamRoster(t.id)}
            >
              <View style={styles.teamHeader}>
                <View style={styles.logoPlaceholder}>
                  <Text style={{ fontSize: 20 }}>🛡️</Text>
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.teamName}>{t.team_name}</Text>
                  <Text style={styles.captainText}>Captain: {t.captain_name || 'N/A'}</Text>
                </View>
                <Text style={styles.rosterBadge}>{t.roster_count || 0} Players</Text>
              </View>
            </TouchableOpacity>
          ))}

          {selectedTeam && (
            <View style={styles.rosterBox}>
              <Text style={styles.rosterTitle}>
                {selectedTeam.team_name} - Squad Roster
              </Text>
              {roster.map((p) => (
                <View key={p.player_id} style={styles.rosterRow}>
                  <View>
                    <Text style={styles.playerName}>{p.display_name}</Text>
                    <Text style={styles.playerRole}>#{p.jersey_number} • {p.preferred_role}</Text>
                  </View>
                  <View style={styles.squadRoleBadge}>
                    <Text style={styles.squadRoleText}>{p.role_in_team}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginBottom: 16 },
  teamCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  selectedCard: { borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.1)' },
  teamHeader: { flexDirection: 'row', alignItems: 'center' },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center'
  },
  teamName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  captainText: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  rosterBadge: { color: '#06b6d4', fontWeight: '700', fontSize: 12 },
  rosterBox: {
    marginTop: 16,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  rosterTitle: { color: '#06b6d4', fontSize: 14, fontWeight: '800', marginBottom: 12 },
  rosterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  playerName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  playerRole: { color: '#9ca3af', fontSize: 11 },
  squadRoleBadge: { backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  squadRoleText: { color: '#10b981', fontSize: 10, fontWeight: '800' },
  errorContainer: { alignItems: 'center', marginTop: 40, padding: 16 },
  errorText: { color: '#ef4444', fontSize: 14, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  retryBtn: { backgroundColor: '#06b6d4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 13 }
});
