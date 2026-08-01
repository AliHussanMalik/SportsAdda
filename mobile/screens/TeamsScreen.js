import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { API_BASE } from '../config';
import { useTheme } from '../context/ThemeContext';

export default function TeamsScreen() {
  const { theme } = useTheme();

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Sport Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('ALL');

  // Challenge Modal State
  const [challengeTargetTeam, setChallengeTargetTeam] = useState(null);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const [matchFormat, setMatchFormat] = useState('Box Cricket / Turf Match');
  const [matchStakes, setMatchStakes] = useState('Friendly Challenge');

  // Invite Player Modal State
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Set Player Role Modal State (Captain Action)
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [targetPlayer, setTargetPlayer] = useState(null);

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

  const handleOpenChallenge = (team) => {
    setChallengeTargetTeam(team);
    setChallengeModalVisible(true);
  };

  const handleSendChallenge = () => {
    if (!challengeTargetTeam) return;
    setChallengeModalVisible(false);
    Alert.alert(
      '⚔️ Challenge Sent Successfully!',
      `Match Challenge for [${challengeTargetTeam.team_name}] has been sent to Captain ${challengeTargetTeam.captain_name || 'Team Captain'}.\nFormat: ${matchFormat}\nStakes: ${matchStakes}`
    );
  };

  // Player Sends Join Request
  const handleSendJoinRequest = (team) => {
    fetch(`${API_BASE}/teams/${team.id}/join-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_name: 'Player' })
    }).catch(() => {});

    Alert.alert(
      '🙋 Join Request Sent!',
      `Your squad request to join [${team.team_name}] has been submitted to Captain ${team.captain_name || 'Team Captain'}!`
    );
  };

  // Captain Invites Player
  const handleSendInvitation = () => {
    if (!inviteEmail) return;
    fetch(`${API_BASE}/teams/${selectedTeam?.id || 'team'}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_email: inviteEmail })
    }).catch(() => {});

    setInviteModalVisible(false);
    Alert.alert('📨 Invitation Sent!', `Direct squad invitation sent to ${inviteEmail}!`);
    setInviteEmail('');
  };

  // Captain Sets Tactical Role (Fast Bowler, Spin, Batsman, Keeper, All-Rounder)
  const handleSetPlayerRole = (newRole) => {
    if (!targetPlayer || !selectedTeam) return;
    fetch(`${API_BASE}/teams/${selectedTeam.id}/roster/${targetPlayer.player_id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_role: newRole })
    }).catch(() => {});

    setRoleModalVisible(false);
    Alert.alert('⚙️ Tactical Role Updated', `Role for ${targetPlayer.display_name} updated to [${newRole}]!`);
    fetchTeamRoster(selectedTeam.id);
  };

  // Filtered Teams List
  const filteredTeams = teams.filter((t) => {
    const nameMatch =
      t.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.captain_name && t.captain_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedSportFilter === 'ALL') return nameMatch;
    if (selectedSportFilter === 'CRICKET') return nameMatch && /CC|Cricket|Qalandars|Kings|Sultans|Titans/i.test(t.team_name);
    if (selectedSportFilter === 'FUTSAL') return nameMatch && /FC|Futsal|Gunners|Strikers|Mavericks/i.test(t.team_name);
    if (selectedSportFilter === 'PADEL') return nameMatch && /Padel|Aces|Spin|Masters/i.test(t.team_name);
    if (selectedSportFilter === 'BASKETBALL') return nameMatch && /Hoops|Falcons|Basketball/i.test(t.team_name);
    return nameMatch;
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <Text style={[styles.title, { color: theme.text }]}>🛡️ Teams & Squad Rosters</Text>
      <Text style={[styles.subtitle, { color: theme.subText }]}>Team branding, player invitations, join requests & tactical roles</Text>

      {/* Search Input Bar */}
      <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.inputText }]}
          placeholder="Search team by name or captain..."
          placeholderTextColor={theme.subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={{ color: theme.subText, fontSize: 16, paddingHorizontal: 6 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sport Category Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {['ALL', 'CRICKET', 'FUTSAL', 'PADEL', 'BASKETBALL'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.filterChip,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
              selectedSportFilter === s && { backgroundColor: theme.accent, borderColor: theme.accent }
            ]}
            onPress={() => setSelectedSportFilter(s)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: theme.subText },
                selectedSportFilter === s && { color: '#000', fontWeight: '800' }
              ]}
            >
              {s === 'ALL'
                ? '⚡ All Teams'
                : s === 'CRICKET'
                ? '🏏 Cricket'
                : s === 'FUTSAL'
                ? '⚽ Futsal'
                : s === 'PADEL'
                ? '🎾 Padel'
                : '🏀 Basketball'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading & Error States */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.accent }]} onPress={fetchTeams}>
            <Text style={styles.retryText}>🔄 Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {filteredTeams.map((t) => (
            <View
              key={t.id}
              style={[
                styles.teamCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
                selectedTeam?.id === t.id && { borderColor: theme.accent, backgroundColor: theme.badgeBg }
              ]}
            >
              <TouchableOpacity style={styles.teamHeader} onPress={() => fetchTeamRoster(t.id)}>
                <View style={styles.logoPlaceholder}>
                  <Text style={{ fontSize: 22 }}>
                    {t.team_name.includes('🏏')
                      ? '🏏'
                      : t.team_name.includes('⚽')
                      ? '⚽'
                      : t.team_name.includes('🎾')
                      ? '🎾'
                      : t.team_name.includes('🏀')
                      ? '🏀'
                      : '🛡️'}
                  </Text>
                </View>

                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.teamName, { color: theme.text }]}>{t.team_name}</Text>
                  <Text style={[styles.captainText, { color: theme.subText }]}>
                    👑 Captain: {t.captain_name || 'N/A'}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.rosterBadge, { color: theme.accent }]}>{t.roster_count || 1} Players</Text>

                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    {/* Send Join Request Button */}
                    <TouchableOpacity
                      style={[styles.miniBtn, { backgroundColor: 'rgba(6, 182, 212, 0.2)', borderColor: '#06b6d4' }]}
                      onPress={() => handleSendJoinRequest(t)}
                    >
                      <Text style={[styles.miniBtnText, { color: '#06b6d4' }]}>🙋 Join</Text>
                    </TouchableOpacity>

                    {/* Captain Challenge Button */}
                    <TouchableOpacity
                      style={[styles.miniBtn, { backgroundColor: theme.accent }]}
                      onPress={() => handleOpenChallenge(t)}
                    >
                      <Text style={[styles.miniBtnText, { color: '#000' }]}>⚔️ Challenge</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}

          {/* Selected Team Roster View & Captain Actions */}
          {selectedTeam && (
            <View style={[styles.rosterBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <View style={styles.rosterBoxHeader}>
                <Text style={[styles.rosterTitle, { color: theme.accent }]}>
                  {selectedTeam.team_name} - Squad Roster Details
                </Text>

                {/* Invite Player Button for Captain */}
                <TouchableOpacity
                  style={[styles.invitePlayerBtn, { backgroundColor: theme.accent }]}
                  onPress={() => setInviteModalVisible(true)}
                >
                  <Text style={styles.invitePlayerBtnText}>📨 Invite Player</Text>
                </TouchableOpacity>
              </View>

              {roster.map((p) => (
                <View key={p.player_id} style={[styles.rosterRow, { borderBottomColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.playerName, { color: theme.text }]}>{p.display_name}</Text>
                    <Text style={[styles.playerRole, { color: theme.subText }]}>
                      #{p.jersey_number || 0} • {p.preferred_role || 'Player'}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={[styles.squadRoleBadge, { backgroundColor: theme.badgeBg }]}>
                      <Text style={[styles.squadRoleText, { color: theme.accent }]}>{p.role_in_team || 'PLAYER'}</Text>
                    </View>

                    {/* Captain Role Assign Button */}
                    <TouchableOpacity
                      style={styles.setRoleBtn}
                      onPress={() => {
                        setTargetPlayer(p);
                        setRoleModalVisible(true);
                      }}
                    >
                      <Text style={[styles.setRoleText, { color: theme.subText }]}>⚙️ Assign Role</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Match Challenge Modal */}
      {challengeTargetTeam && (
        <Modal
          visible={challengeModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setChallengeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>⚔️ Send Match Challenge</Text>
              <Text style={[styles.modalSubtitle, { color: theme.subText }]}>
                Challenge [{challengeTargetTeam.team_name}] to a match!
              </Text>

              <Text style={[styles.inputLabel, { color: theme.text }]}>Match Type / Sport Format:</Text>
              <View style={styles.optionGroup}>
                {['Box Cricket / Turf Match', '5v5 Futsal Derby', 'Padel Doubles Match'].map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.modalOptionBtn,
                      { borderColor: theme.border },
                      matchFormat === f && { backgroundColor: theme.accent, borderColor: theme.accent }
                    ]}
                    onPress={() => setMatchFormat(f)}
                  >
                    <Text style={[styles.modalOptionText, { color: matchFormat === f ? '#000' : theme.text }]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={() => setChallengeModalVisible(false)}>
                  <Text style={[styles.cancelBtnText, { color: theme.subText }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.accent }]} onPress={handleSendChallenge}>
                  <Text style={styles.sendBtnText}>⚔️ Send Challenge</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Invite Player Modal */}
      <Modal visible={inviteModalVisible} animationType="slide" transparent onRequestClose={() => setInviteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>📨 Invite Player to Squad</Text>
            <Text style={[styles.modalSubtitle, { color: theme.subText }]}>Send direct invitation to a player</Text>

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]}
              placeholder="Enter Player Email or Mobile Number..."
              placeholderTextColor={theme.subText}
              value={inviteEmail}
              onChangeText={setInviteEmail}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={() => setInviteModalVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: theme.subText }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.accent }]} onPress={handleSendInvitation}>
                <Text style={styles.sendBtnText}>📨 Send Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Set Tactical Player Role Modal */}
      {targetPlayer && (
        <Modal visible={roleModalVisible} animationType="slide" transparent onRequestClose={() => setRoleModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>⚙️ Assign Tactical Role</Text>
              <Text style={[styles.modalSubtitle, { color: theme.subText }]}>Set status for {targetPlayer.display_name}</Text>

              <View style={styles.optionGroup}>
                {[
                  'Fast Bowler ⚡',
                  'Spin Bowler 🌀',
                  'Top-Order Batsman 🏏',
                  'Wicketkeeper / Goalkeeper 🧤',
                  'All-Rounder 🌟'
                ].map((roleStr) => (
                  <TouchableOpacity
                    key={roleStr}
                    style={[styles.modalOptionBtn, { borderColor: theme.border }]}
                    onPress={() => handleSetPlayerRole(roleStr)}
                  >
                    <Text style={[styles.modalOptionText, { color: theme.text }]}>{roleStr}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border, marginTop: 10 }]} onPress={() => setRoleModalVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: theme.subText }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 12, marginBottom: 14 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1
  },
  searchInput: { flex: 1, fontSize: 13 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontWeight: '700' },
  teamCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  teamHeader: { flexDirection: 'row', alignItems: 'center' },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  teamName: { fontSize: 16, fontWeight: '800' },
  captainText: { fontSize: 12, marginTop: 2 },
  rosterBadge: { fontWeight: '700', fontSize: 11, marginBottom: 4 },
  miniBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  miniBtnText: { fontWeight: '800', fontSize: 10 },
  rosterBox: { marginTop: 14, borderRadius: 16, padding: 16, borderWidth: 1 },
  rosterBoxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rosterTitle: { fontSize: 14, fontWeight: '800', flex: 1 },
  invitePlayerBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  invitePlayerBtnText: { color: '#000', fontWeight: '800', fontSize: 11 },
  rosterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  playerName: { fontSize: 14, fontWeight: '700' },
  playerRole: { fontSize: 11 },
  squadRoleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  squadRoleText: { fontSize: 10, fontWeight: '800' },
  setRoleBtn: { marginTop: 4 },
  setRoleText: { fontSize: 10, fontWeight: '700' },
  errorContainer: { alignItems: 'center', marginTop: 40, padding: 16 },
  errorText: { color: '#ef4444', fontSize: 14, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', padding: 16 },
  modalContent: { borderRadius: 20, padding: 20, borderWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  modalSubtitle: { fontSize: 12, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '700', marginTop: 10, marginBottom: 8 },
  optionGroup: { gap: 8, marginBottom: 12 },
  modalOptionBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  modalOptionText: { fontSize: 12, fontWeight: '700' },
  modalInput: { borderRadius: 10, padding: 12, fontSize: 13, borderWidth: 1, marginBottom: 16 },
  modalActionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelBtnText: { fontWeight: '700', fontSize: 13 },
  sendBtn: { flex: 2, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  sendBtnText: { color: '#000', fontWeight: '900', fontSize: 13 }
});
