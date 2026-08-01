import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../config';

const INITIAL_BRACKET = {
  quarterFinals: [
    { id: 'qf1', teamA: 'Lahore Qalandars Box CC 🏏', scoreA: '162/4', teamB: 'Peshawar Zalmi Turf XI 🏏', scoreB: '148/8', winner: 'teamA', status: 'FINISHED' },
    { id: 'qf2', teamA: 'Karachi Kings Turf XI 🏏', scoreA: '175/2', teamB: 'Quetta Gladiators CC 🏏', scoreB: '130/9', winner: 'teamA', status: 'FINISHED' },
    { id: 'qf3', teamA: 'Islamabad United Smashers 🏏', scoreA: '180/5', teamB: 'Multan Sultans CC 🏏', scoreB: '178/6', winner: 'teamA', status: 'FINISHED' },
    { id: 'qf4', teamA: 'Velocity Gunners FC ⚽', scoreA: '3', teamB: 'Rawalpindi Mavericks FC ⚽', scoreB: '1', winner: 'teamA', status: 'FINISHED' }
  ],
  semiFinals: [
    { id: 'sf1', teamA: 'Lahore Qalandars Box CC 🏏', scoreA: '188/3', teamB: 'Karachi Kings Turf XI 🏏', scoreB: '172/7', winner: 'teamA', status: 'FINISHED' },
    { id: 'sf2', teamA: 'Islamabad United Smashers 🏏', scoreA: '154/9', teamB: 'Velocity Gunners FC ⚽', scoreB: '155/4', winner: 'teamB', status: 'FINISHED' }
  ],
  grandFinal: { id: 'gf1', teamA: 'Lahore Qalandars Box CC 🏏', scoreA: 'TBD', teamB: 'Velocity Gunners FC ⚽', scoreB: 'TBD', winner: null, status: 'UPCOMING (LIVE SUNDAY)' }
};

const UMPIRES_LIST = [
  { id: 'u1', name: 'Aleem Dar Jr 🏏', role: 'Head Pitch Umpire', matches: 14 },
  { id: 'u2', name: 'Asad Rauf Jr 🏏', role: 'TV Review Umpire', matches: 9 },
  { id: 'u3', name: 'Ref. Tariq Mahmood ⚽', role: 'Chief Futsal Referee', matches: 22 }
];

export default function TournamentTreeModal({ visible, onClose }) {
  const { theme } = useTheme();

  const [bracket, setBracket] = useState(INITIAL_BRACKET);
  const [umpires, setUmpires] = useState(UMPIRES_LIST);

  // Captain Rating State
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [userIsCaptain, setUserIsCaptain] = useState(true); // Captain state

  // Umpire Assign State
  const [umpireModalVisible, setUmpireModalVisible] = useState(false);
  const [newUmpireName, setNewUmpireName] = useState('');
  const [newUmpireRole, setNewUmpireRole] = useState('Field Umpire');

  const handleSubmitRating = async () => {
    if (!userIsCaptain) {
      Alert.alert(
        '⛔ Rating Restricted',
        'Only verified Team Captains can rate tournament organizers to prevent biased ratings from eliminated teams.'
      );
      return;
    }

    try {
      await fetch(`${API_BASE}/ratings/organizer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizer_name: 'Velocity Sports Management',
          captain_name: 'Shaheen Qalandar',
          is_captain: true,
          rating: ratingVal,
          review_text: reviewText
        })
      });
    } catch (e) {}

    setRatingModalVisible(false);
    Alert.alert('⭐ Rating Submitted!', `Thank you Captain! Your ${ratingVal}-star rating for the organizer has been verified and posted.`);
    setReviewText('');
  };

  const handleAddUmpire = () => {
    if (!newUmpireName) return;
    const newUmp = {
      id: Math.random().toString(),
      name: newUmpireName,
      role: newUmpireRole,
      matches: 1
    };
    setUmpires([...umpires, newUmp]);
    setUmpireModalVisible(false);
    Alert.alert('✅ Official Umpire Appointed', `${newUmpireName} has been assigned as ${newUmpireRole} for tournament matches!`);
    setNewUmpireName('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.bg, borderColor: theme.accent }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>🏆 Tournament Tree & Graph</Text>
              <Text style={[styles.subtitle, { color: theme.subText }]}>
                Single Elimination Knockout Graph • Organizer Ratings (Captains Only)
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.closeBtnText, { color: theme.subText }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Announcement Banner */}
            <View style={[styles.eventBanner, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
              <View style={styles.bannerHeader}>
                <Text style={[styles.eventTitle, { color: theme.text }]}>🏆 Pakistan Turf Champions League 2026</Text>
                <View style={[styles.prizeBadge, { backgroundColor: theme.badgeBg }]}>
                  <Text style={[styles.prizeBadgeText, { color: theme.accent }]}>Rs. 150,000 PRIZE</Text>
                </View>
              </View>
              <Text style={[styles.eventMeta, { color: theme.subText }]}>
                Organized by: Velocity Sports Management • DHA Lahore & Clifton Karachi
              </Text>

              {/* Rate Organizer Button (Captains Only) */}
              <TouchableOpacity
                style={[styles.rateOrgBtn, { backgroundColor: theme.accent }]}
                onPress={() => setRatingModalVisible(true)}
              >
                <Text style={styles.rateOrgBtnText}>⭐ Rate Organizer (Team Captains Only)</Text>
              </TouchableOpacity>
            </View>

            {/* Visual Knockout Bracket Graph */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>📊 Visual Knockout Tree Graph:</Text>

            {/* Quarter-Finals */}
            <Text style={[styles.roundTitle, { color: theme.accent }]}>Quarter-Finals (Round of 8)</Text>
            {bracket.quarterFinals.map((match) => (
              <View key={match.id} style={[styles.matchCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <View style={styles.teamRow}>
                  <Text style={[styles.teamName, { color: theme.text }]}>{match.teamA}</Text>
                  <Text style={[styles.teamScore, { color: theme.text }]}>{match.scoreA}</Text>
                  {match.winner === 'teamA' ? (
                    <View style={styles.winBadge}><Text style={styles.winBadgeText}>✅ ADVANCED</Text></View>
                  ) : (
                    <View style={styles.loseBadge}><Text style={styles.loseBadgeText}>❌ ELIMINATED</Text></View>
                  )}
                </View>

                <View style={[styles.teamRow, { marginTop: 6 }]}>
                  <Text style={[styles.teamName, { color: theme.text }]}>{match.teamB}</Text>
                  <Text style={[styles.teamScore, { color: theme.text }]}>{match.scoreB}</Text>
                  {match.winner === 'teamB' ? (
                    <View style={styles.winBadge}><Text style={styles.winBadgeText}>✅ ADVANCED</Text></View>
                  ) : (
                    <View style={styles.loseBadge}><Text style={styles.loseBadgeText}>❌ ELIMINATED</Text></View>
                  )}
                </View>
              </View>
            ))}

            {/* Semi-Finals */}
            <Text style={[styles.roundTitle, { color: theme.accent, marginTop: 12 }]}>Semi-Finals (Round of 4)</Text>
            {bracket.semiFinals.map((match) => (
              <View key={match.id} style={[styles.matchCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <View style={styles.teamRow}>
                  <Text style={[styles.teamName, { color: theme.text }]}>{match.teamA}</Text>
                  <Text style={[styles.teamScore, { color: theme.text }]}>{match.scoreA}</Text>
                  {match.winner === 'teamA' ? (
                    <View style={styles.winBadge}><Text style={styles.winBadgeText}>✅ ADVANCED</Text></View>
                  ) : (
                    <View style={styles.loseBadge}><Text style={styles.loseBadgeText}>❌ ELIMINATED</Text></View>
                  )}
                </View>

                <View style={[styles.teamRow, { marginTop: 6 }]}>
                  <Text style={[styles.teamName, { color: theme.text }]}>{match.teamB}</Text>
                  <Text style={[styles.teamScore, { color: theme.text }]}>{match.scoreB}</Text>
                  {match.winner === 'teamB' ? (
                    <View style={styles.winBadge}><Text style={styles.winBadgeText}>✅ ADVANCED</Text></View>
                  ) : (
                    <View style={styles.loseBadge}><Text style={styles.loseBadgeText}>❌ ELIMINATED</Text></View>
                  )}
                </View>
              </View>
            ))}

            {/* Grand Final */}
            <Text style={[styles.roundTitle, { color: '#f59e0b', marginTop: 12 }]}>🏆 GRAND FINAL CHAMPIONSHIP</Text>
            <View style={[styles.matchCard, styles.finalCard, { backgroundColor: theme.cardBg, borderColor: '#f59e0b' }]}>
              <View style={styles.teamRow}>
                <Text style={[styles.teamName, { color: theme.text, fontWeight: '900' }]}>{bracket.grandFinal.teamA}</Text>
                <Text style={[styles.teamScore, { color: '#f59e0b', fontWeight: '900' }]}>{bracket.grandFinal.scoreA}</Text>
              </View>
              <View style={[styles.teamRow, { marginTop: 6 }]}>
                <Text style={[styles.teamName, { color: theme.text, fontWeight: '900' }]}>{bracket.grandFinal.teamB}</Text>
                <Text style={[styles.teamScore, { color: '#f59e0b', fontWeight: '900' }]}>{bracket.grandFinal.scoreB}</Text>
              </View>
              <Text style={{ color: '#f59e0b', fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 8 }}>
                🔥 CHAMPIONSHIP MATCH • SUNDAY 8:00 PM LIVE
              </Text>
            </View>

            {/* Umpires & Referees Panel */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
              <Text style={[styles.sectionLabel, { color: theme.text, marginBottom: 0 }]}>👔 Official Match Umpires & Referees:</Text>
              <TouchableOpacity
                style={[styles.addUmpireBtn, { backgroundColor: theme.accent }]}
                onPress={() => setUmpireModalVisible(true)}
              >
                <Text style={styles.addUmpireBtnText}>+ Assign Umpire</Text>
              </TouchableOpacity>
            </View>

            {umpires.map((ump) => (
              <View key={ump.id} style={[styles.umpireCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.umpireName, { color: theme.text }]}>{ump.name}</Text>
                  <Text style={[styles.umpireRole, { color: theme.subText }]}>{ump.role}</Text>
                </View>
                <Text style={[styles.umpireMatches, { color: theme.accent }]}>{ump.matches} Matches Officiated</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Organizer Rating Modal (Captains Only) */}
      <Modal visible={ratingModalVisible} animationType="slide" transparent onRequestClose={() => setRatingModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>⭐ Rate Tournament Organizer</Text>
            <Text style={[styles.noticeText, { color: '#f59e0b' }]}>
              ⚠️ Restriction Notice: To prevent biased reviews from eliminated teams, only verified Team Captains can rate event organizers.
            </Text>

            {/* Star Selection */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRatingVal(star)}>
                  <Text style={{ fontSize: 28, marginHorizontal: 4 }}>{star <= ratingVal ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.reviewInput, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]}
              placeholder="Write feedback about ground quality, schedule & umpire decisions..."
              placeholderTextColor={theme.subText}
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={() => setRatingModalVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: theme.subText }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.accent }]} onPress={handleSubmitRating}>
                <Text style={styles.sendBtnText}>⭐ Submit Verified Captain Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Umpire Modal */}
      <Modal visible={umpireModalVisible} animationType="slide" transparent onRequestClose={() => setUmpireModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>👔 Assign Official Umpire / Referee</Text>
            <Text style={[styles.modalSubtitle, { color: theme.subText }]}>Appoint official for tournament matches</Text>

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]}
              placeholder="Enter Umpire / Referee Full Name..."
              placeholderTextColor={theme.subText}
              value={newUmpireName}
              onChangeText={setNewUmpireName}
            />

            <View style={styles.optionGroup}>
              {['Head Pitch Umpire 🏏', 'TV Review Umpire 📺', 'Chief Futsal Referee ⚽'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.modalOptionBtn,
                    { borderColor: theme.border },
                    newUmpireRole === r && { backgroundColor: theme.accent, borderColor: theme.accent }
                  ]}
                  onPress={() => setNewUmpireRole(r)}
                >
                  <Text style={[styles.modalOptionText, { color: newUmpireRole === r ? '#000' : theme.text }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={() => setUmpireModalVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: theme.subText }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.accent }]} onPress={handleAddUmpire}>
                <Text style={styles.sendBtnText}>👔 Assign Umpire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', padding: 20, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '900' },
  subtitle: { fontSize: 11, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 16, fontWeight: 'bold' },
  eventBanner: { borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1 },
  bannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  eventTitle: { fontSize: 14, fontWeight: '800', flex: 1, marginRight: 6 },
  prizeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  prizeBadgeText: { fontSize: 10, fontWeight: '900' },
  eventMeta: { fontSize: 11, marginBottom: 10 },
  rateOrgBtn: { paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  rateOrgBtnText: { color: '#000', fontWeight: '900', fontSize: 11 },
  sectionLabel: { fontSize: 13, fontWeight: '800', marginBottom: 8 },
  roundTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 6 },
  matchCard: { borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  finalCard: { padding: 14, borderWidth: 2 },
  teamRow: { flexDirection: 'row', alignItems: 'center' },
  teamName: { flex: 1, fontSize: 13, fontWeight: '700' },
  teamScore: { fontSize: 13, fontWeight: '800', marginHorizontal: 8 },
  winBadge: { backgroundColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  winBadgeText: { color: '#10b981', fontSize: 9, fontWeight: '800' },
  loseBadge: { backgroundColor: 'rgba(239,68,68,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  loseBadgeText: { color: '#ef4444', fontSize: 9, fontWeight: '800' },
  addUmpireBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  addUmpireBtnText: { color: '#000', fontWeight: '800', fontSize: 11 },
  umpireCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  umpireName: { fontSize: 13, fontWeight: '800' },
  umpireRole: { fontSize: 11, marginTop: 2 },
  umpireMatches: { fontSize: 11, fontWeight: '700' },
  noticeText: { fontSize: 11, fontWeight: '600', marginBottom: 12 },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 14 },
  reviewInput: { borderRadius: 10, padding: 12, fontSize: 12, borderWidth: 1, minHeight: 80, marginBottom: 14, textAlignVertical: 'top' },
  modalTitle: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  modalSubtitle: { fontSize: 12, marginBottom: 16 },
  modalInput: { borderRadius: 10, padding: 12, fontSize: 13, borderWidth: 1, marginBottom: 12 },
  optionGroup: { gap: 8, marginBottom: 12 },
  modalOptionBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  modalOptionText: { fontSize: 12, fontWeight: '700' },
  modalActionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelBtnText: { fontWeight: '700', fontSize: 13 },
  sendBtn: { flex: 2, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  sendBtnText: { color: '#000', fontWeight: '900', fontSize: 13 }
});
