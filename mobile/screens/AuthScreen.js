import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { API_BASE } from '../config';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ThemeSelector from '../components/ThemeSelector';
import NotificationBellMobile from '../components/NotificationBellMobile';

export default function AuthScreen() {
  const { theme } = useTheme();
  const { user, login, register, updateProfile, logout, error: authError } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localMsg, setLocalMsg] = useState(null);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [accountRole, setAccountRole] = useState('PLAYER'); // 'PLAYER' or 'INDOOR_OWNER'
  const [primarySport, setPrimarySport] = useState('CRICKET');
  const [jerseyNumber, setJerseyNumber] = useState('10');

  // Edit Mode State for logged-in user
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editJersey, setEditJersey] = useState('');

  const fetchAllProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const res = await fetch(`${API_BASE}/auth/profiles`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles);
      }
    } catch (e) {
      console.error('Failed to fetch public player directory:', e);
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'INDOOR_OWNER' || user.role === 'ADMIN')) {
      fetchAllProfiles();
    }
  }, [user]);

  const handleLogin = async () => {
    if (!displayName.trim() || !password.trim()) {
      setLocalMsg('Please enter your Name and Password');
      return;
    }
    setSubmitting(true);
    setLocalMsg(null);
    const res = await login(displayName, password);
    setSubmitting(false);
    if (!res.success) {
      setLocalMsg(res.error || 'Invalid credentials');
    } else {
      setDisplayName('');
      setPassword('');
    }
  };

  const handleRegister = async () => {
    if (!displayName.trim() || displayName.trim().length < 2) {
      setLocalMsg('Please enter a valid Display Name (min 2 chars)');
      return;
    }
    if (!password.trim() || password.trim().length < 4) {
      setLocalMsg('Password must be at least 4 characters long');
      return;
    }
    setSubmitting(true);
    setLocalMsg(null);
    const res = await register({
      display_name: displayName,
      password: password,
      role: accountRole,
      primary_sport: primarySport,
      jersey_number: parseInt(jerseyNumber) || 10
    });
    setSubmitting(false);
    if (!res.success) {
      setLocalMsg(res.error || 'Registration failed');
    } else {
      setDisplayName('');
      setPassword('');
    }
  };

  const handleSaveOwnProfile = async () => {
    if (!editName.trim()) return;
    setSubmitting(true);
    const res = await updateProfile({
      display_name: editName,
      jersey_number: parseInt(editJersey) || user.jersey_number
    });
    setSubmitting(false);
    if (res.success) {
      setIsEditing(false);
      fetchAllProfiles();
    } else {
      Alert.alert('Error', res.error || 'Failed to update profile');
    }
  };

  // -------------------------------------------------------------
  // Render Unauthenticated (Login / Sign Up Form)
  // -------------------------------------------------------------
  if (!user) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ padding: 16 }}>
        <Text style={[styles.title, { color: theme.text }]}>👤 User Authentication</Text>
        <Text style={[styles.subtitle, { color: theme.subText }]}>Log in or register with your Name & Password</Text>

        <ThemeSelector />

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, mode === 'login' && { backgroundColor: theme.accent }]}
            onPress={() => { setMode('login'); setLocalMsg(null); }}
          >
            <Text style={[styles.tabText, mode === 'login' ? { color: '#fff' } : { color: theme.text }]}>
              🔑 Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, mode === 'register' && { backgroundColor: theme.accent }]}
            onPress={() => { setMode('register'); setLocalMsg(null); }}
          >
            <Text style={[styles.tabText, mode === 'register' ? { color: '#fff' } : { color: theme.text }]}>
              📝 Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error / Alert Banner */}
        {(localMsg || authError) && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>⚠️ {localMsg || authError}</Text>
          </View>
        )}

        {/* Auth Form */}
        <View style={[styles.formCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.formLabel, { color: theme.subText }]}>Display Name / User Name</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
            placeholder="e.g. Cristiano Ronaldo"
            placeholderTextColor={theme.subText}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />

          <Text style={[styles.formLabel, { color: theme.subText, marginTop: 12 }]}>Password</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
            placeholder="••••••••"
            placeholderTextColor={theme.subText}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {mode === 'register' && (
            <>
              <Text style={[styles.formLabel, { color: theme.subText, marginTop: 12 }]}>Account Role & Capabilities</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                <TouchableOpacity
                  style={[
                    styles.sportChip,
                    accountRole === 'PLAYER' ? { backgroundColor: theme.accent } : { backgroundColor: theme.badgeBg }
                  ]}
                  onPress={() => setAccountRole('PLAYER')}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: accountRole === 'PLAYER' ? '#fff' : theme.text }}>
                    🏃 Player
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sportChip,
                    accountRole === 'INDOOR_OWNER' ? { backgroundColor: '#f59e0b' } : { backgroundColor: theme.badgeBg }
                  ]}
                  onPress={() => setAccountRole('INDOOR_OWNER')}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: accountRole === 'INDOOR_OWNER' ? '#000' : theme.text }}>
                    🏢 Indoor Owner
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.formLabel, { color: theme.subText, marginTop: 12 }]}>Primary Sport</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                {['CRICKET', 'FUTSAL', 'PADEL'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.sportChip,
                      primarySport === s ? { backgroundColor: theme.accent } : { backgroundColor: theme.badgeBg }
                    ]}
                    onPress={() => setPrimarySport(s)}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: primarySport === s ? '#fff' : theme.text }}>
                      {s === 'CRICKET' ? '🏏 Cricket' : s === 'FUTSAL' ? '⚽ Futsal' : '🎾 Padel'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.formLabel, { color: theme.subText, marginTop: 12 }]}>Jersey Number</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
                placeholder="10"
                placeholderTextColor={theme.subText}
                keyboardType="numeric"
                value={jerseyNumber}
                onChangeText={setJerseyNumber}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.accent }, submitting && { opacity: 0.7 }]}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === 'login' ? '🔑 Sign In to Account' : '🚀 Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* <Text style={[styles.passwordHint, { color: theme.subText }]}>
            💡 Your credentials and player account settings are saved securely.
          </Text> */}
        </View>

        {/* Security & Privacy Banner for Unauthenticated Users */}
        {/* <View style={[styles.formCard, { backgroundColor: theme.cardBg, borderColor: theme.border, alignItems: 'center', padding: 20 }]}> */}
        {/* <Text style={{ fontSize: 14, fontWeight: '800', color: theme.accent, marginBottom: 4 }}>
            🔒 Privacy & Account Protection
          </Text> */}
        {/* <Text style={{ fontSize: 11, color: theme.subText, textAlign: 'center', lineHeight: 16 }}>
            SportsAdda protects player data. Public user directories are hidden from non-authenticated and regular player views.
          </Text>
        </View> */}
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // Render Authenticated (Logged-In User Profile & Settings)
  // -------------------------------------------------------------
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>👤 My Account & Profile</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>Welcome back, {user.display_name}!</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <NotificationBellMobile />
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutBtnText}>🚪 Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ThemeSelector />

      {/* Logged-In User Profile Control Card */}
      <View style={[styles.myProfileCard, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.accent, width: 52, height: 52, borderRadius: 26 }]}>
            <Text style={[styles.avatarText, { fontSize: 18 }]}>#{user.jersey_number || 10}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.name, { color: theme.text, fontSize: 18 }]}>{user.display_name}</Text>
            <Text style={[styles.sportRole, { color: theme.subText }]}>{user.primary_sport} • {user.preferred_role || 'Player'}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
              <View style={[styles.miniBadge, { backgroundColor: user.role === 'INDOOR_OWNER' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)' }]}>
                <Text style={{ color: user.role === 'INDOOR_OWNER' ? '#f59e0b' : '#10b981', fontWeight: '800', fontSize: 10 }}>
                  {user.role === 'INDOOR_OWNER' ? '🏢 INDOOR OWNER' : '🏃 PLAYER'}
                </Text>
              </View>
              {user.is_captain && <View style={[styles.miniBadge, { backgroundColor: 'rgba(16,185,129,0.2)' }]}><Text style={{ color: '#10b981', fontWeight: '800', fontSize: 10 }}>👑 CAPTAIN</Text></View>}
            </View>
          </View>
          <View style={[styles.badge, user.subscription_tier === 'PRO' ? styles.badgePro : styles.badgeFree]}>
            <Text style={styles.badgeText}>{user.subscription_tier}</Text>
          </View>
        </View>

        {/* Mobile Player Career Performance Statistics Grid */}
        <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: theme.accent, marginBottom: 10, textTransform: 'uppercase' }}>
            📊 Career Statistics
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <View style={[styles.statBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
              <Text style={[styles.statVal, { color: theme.text }]}>{user.total_matches || 0}</Text>
              <Text style={[styles.statLbl, { color: theme.subText }]}>Matches</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: theme.bg, borderColor: '#10b981' }]}>
              <Text style={[styles.statVal, { color: '#10b981' }]}>{user.total_runs || 0}</Text>
              <Text style={[styles.statLbl, { color: theme.subText }]}>Total Runs</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: theme.bg, borderColor: '#f59e0b' }]}>
              <Text style={[styles.statVal, { color: '#f59e0b' }]}>{user.high_score || 0}</Text>
              <Text style={[styles.statLbl, { color: theme.subText }]}>Best Score</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: theme.bg, borderColor: '#3b82f6' }]}>
              <Text style={[styles.statVal, { color: '#3b82f6' }]}>
                {user.balls_faced > 0 ? ((user.total_runs / user.balls_faced) * 100).toFixed(1) : '0.0'}
              </Text>
              <Text style={[styles.statLbl, { color: theme.subText }]}>Strike Rate</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: theme.bg, borderColor: '#ef4444' }]}>
              <Text style={[styles.statVal, { color: '#ef4444' }]}>{user.wickets_taken || 0}</Text>
              <Text style={[styles.statLbl, { color: theme.subText }]}>Wickets</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: theme.bg, borderColor: '#a855f7' }]}>
              <Text style={[styles.statVal, { color: '#a855f7' }]}>
                {user.fours || 0} / {user.sixes || 0}
              </Text>
              <Text style={[styles.statLbl, { color: theme.subText }]}>4s / 6s</Text>
            </View>
          </View>
        </View>

        {/* Self Profile Edit Form Toggle */}
        {isEditing ? (
          <View style={styles.editSection}>
            <Text style={[styles.formLabel, { color: theme.subText }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
              value={editName}
              onChangeText={setEditName}
            />
            <Text style={[styles.formLabel, { color: theme.subText, marginTop: 8 }]}>Jersey Number</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
              value={editJersey}
              onChangeText={setEditJersey}
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.accent }]}
                onPress={handleSaveOwnProfile}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditing(false)}
              >
                <Text style={{ color: theme.subText, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: theme.border }]}
            onPress={() => {
              setEditName(user.display_name || '');
              setEditJersey(String(user.jersey_number || 10));
              setIsEditing(true);
            }}
          >
            <Text style={{ color: theme.accent, fontWeight: '800', fontSize: 13 }}>✏️ Edit My Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Directory Logic: Show Privacy Card for Regular Players, Roster for Owners */}
      {user.role === 'PLAYER' || !user.role ? (
        <View style={[styles.formCard, { backgroundColor: theme.cardBg, borderColor: 'rgba(16,185,129,0.4)', padding: 20, alignItems: 'center', marginTop: 16 }]}>
          {/* <Text style={{ fontSize: 15, fontWeight: '800', color: theme.accent, marginBottom: 6 }}>
            🔒 Player Account Privacy Protected
          </Text>
          <Text style={{ fontSize: 12, color: theme.subText, textAlign: 'center', lineHeight: 18 }}>
            Your account credentials, match bookings, and statistics are private to your logged-in account. The global player directory is restricted from regular player views.
          </Text> */}
        </View>
      ) : (
        <>
          <Text style={[styles.sectionHeading, { color: theme.text, marginTop: 24 }]}>
            👥 Arena Roster Directory ({profiles.length})
          </Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            (Indoor Owner View for Arena Roster Management)
          </Text>

          {loadingProfiles ? (
            <ActivityIndicator color={theme.accent} style={{ marginTop: 12 }} />
          ) : (
            profiles.map((p) => {
              const isSelf = p.user_id === user.user_id;
              return (
                <View
                  key={p.user_id}
                  style={[
                    styles.readOnlyCard,
                    { backgroundColor: theme.cardBg, borderColor: isSelf ? theme.accent : theme.border }
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.avatar, { backgroundColor: isSelf ? theme.accent : '#4b5563' }]}>
                      <Text style={styles.avatarText}>#{p.jersey_number || 0}</Text>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={[styles.name, { color: theme.text }]}>
                        {p.display_name} {isSelf && <Text style={{ color: theme.accent, fontSize: 12 }}>(You)</Text>}
                      </Text>
                      <Text style={[styles.sportRole, { color: theme.subText }]}>{p.primary_sport} • {p.role || 'PLAYER'}</Text>
                    </View>
                    <View style={[styles.badge, p.subscription_tier === 'PRO' ? styles.badgePro : styles.badgeFree]}>
                      <Text style={styles.badgeText}>{p.subscription_tier}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 12, marginBottom: 14 },
  sectionHeading: { fontSize: 16, fontWeight: '800' },
  tabContainer: { flexDirection: 'row', gap: 10, marginVertical: 14 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  tabText: { fontSize: 14, fontWeight: '800' },
  formCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  formLabel: { fontSize: 12, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14, marginTop: 4 },
  sportChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  submitBtn: { marginTop: 18, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  passwordHint: { fontSize: 11, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.15)', borderLeftWidth: 4, borderLeftColor: '#ef4444', padding: 10, borderRadius: 8, marginBottom: 12 },
  errorBoxText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  logoutBtn: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  myProfileCard: { padding: 16, borderRadius: 16, borderWidth: 2, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  name: { fontSize: 15, fontWeight: '700' },
  sportRole: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgePro: { backgroundColor: '#f59e0b' },
  badgeFree: { backgroundColor: '#374151' },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#000' },
  miniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  editBtn: { marginTop: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  editSection: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  saveBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  readOnlyCard: { padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  statBox: { width: '31%', padding: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '900' },
  statLbl: { fontSize: 10, marginTop: 2 }
});
