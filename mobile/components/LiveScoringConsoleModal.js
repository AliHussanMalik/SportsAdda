import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { API_BASE } from '../config';
import { useTheme } from '../context/ThemeContext';

export default function LiveScoringConsoleModal({ visible, matchId = 'demo-match-101', onClose }) {
  const { theme } = useTheme();

  // Match State
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Score State (Dynamic Initial Values = 0)
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overs, setOvers] = useState(0);
  const [balls, setBalls] = useState(0);
  const [maxWickets, setMaxWickets] = useState(10);
  const [totalOversLimit, setTotalOversLimit] = useState(10);
  const [currentOverBalls, setCurrentOverBalls] = useState([]);

  // Dynamic Player Stats State
  const [striker, setStriker] = useState({ name: 'Opening Striker', runs: 0, balls: 0, fours: 0, sixes: 0 });
  const [nonStriker, setNonStriker] = useState({ name: 'Non-Striker', runs: 0, balls: 0, fours: 0, sixes: 0 });
  const [bowler, setBowler] = useState({ name: 'Opening Bowler', overs: 0.0, runs: 0, wickets: 0 });

  const fetchScoreboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/scoring/${matchId}/events`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      const data = await res.json();
      if (data.success && data.scores) {
        setMatchData(data);
        if (data.scores.team_a_score !== undefined) {
          setRuns(data.scores.team_a_score);
          setWickets(data.scores.team_a_wickets);
        }
        if (data.match) {
          setMaxWickets(data.match.max_wickets || 10);
          setTotalOversLimit(data.match.total_overs || 10);
        }
      }
    } catch (e) {
      console.log('Live scoring poll sync:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchScoreboard();
      const interval = setInterval(fetchScoreboard, 3000);
      return () => clearInterval(interval);
    }
  }, [visible, matchId]);

  // Record a Ball / Event
  const handleScoreBall = (eventLabel, runVal = 0, isWicket = false, isExtra = false) => {
    if (wickets >= maxWickets && isWicket) {
      Alert.alert('🔴 Innings Complete', `All Out limit of ${maxWickets} wickets reached!`);
      return;
    }

    let newRuns = runs + runVal;
    let newWickets = wickets + (isWicket ? 1 : 0);
    let newBalls = balls + (isExtra ? 0 : 1);
    let newOvers = overs;

    if (newBalls >= 6) {
      newOvers += 1;
      newBalls = 0;
      setCurrentOverBalls([]);
    } else {
      setCurrentOverBalls([...currentOverBalls, eventLabel]);
    }

    setRuns(newRuns);
    setWickets(newWickets);
    setOvers(newOvers);
    setBalls(newBalls);

    // Update Striker & Bowler Stats
    if (!isExtra) {
      setStriker((prev) => ({
        ...prev,
        runs: prev.runs + runVal,
        balls: prev.balls + 1,
        fours: prev.fours + (runVal === 4 ? 1 : 0),
        sixes: prev.sixes + (runVal === 6 ? 1 : 0)
      }));

      setBowler((prev) => ({
        ...prev,
        runs: prev.runs + runVal,
        wickets: prev.wickets + (isWicket ? 1 : 0)
      }));
    }

    // Single run rotates strike
    if (runVal === 1 || runVal === 3) {
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    }

    // Send payload to backend API
    fetch(`${API_BASE}/scoring/${matchId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
      body: JSON.stringify({
        event_type: isWicket ? 'WICKET' : 'RUN',
        details: { runs: runVal, label: eventLabel }
      })
    }).catch(() => {});
  };

  // Undo Last Ball
  const handleUndo = () => {
    if (currentOverBalls.length === 0 && balls === 0 && overs === 0) return;
    const lastBall = currentOverBalls[currentOverBalls.length - 1];
    setCurrentOverBalls(currentOverBalls.slice(0, -1));
    if (balls > 0) setBalls(balls - 1);
    Alert.alert('↺ Undo Ball', `Reverted last ball (${lastBall || '0'})`);
  };

  const teamAName = matchData?.match?.team_a_name || 'Team Alpha';
  const teamBName = matchData?.match?.team_b_name || 'Team Beta';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.bg, borderColor: theme.accent }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>🏏 Live Match Scoring Console</Text>
              <View style={styles.syncRow}>
                <View style={styles.liveDot} />
                <Text style={[styles.syncText, { color: theme.accent }]}>
                  🟢 Real-Time Synced (Limit: {totalOversLimit} Overs • {maxWickets} Wkts Max)
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.closeBtnText, { color: theme.subText }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Live Scoreboard Banner */}
            <View style={[styles.scoreBanner, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <Text style={styles.matchTeams}>{teamAName} vs {teamBName}</Text>
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreBig, { color: theme.text }]}>
                  {runs}/{wickets}
                </Text>
                <Text style={[styles.oversText, { color: theme.accent }]}>
                  ({overs}.{balls} / {totalOversLimit}.0 Overs)
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={[styles.metaText, { color: theme.subText }]}>
                  CRR: {((runs / (overs + balls / 6 || 1)).toFixed(2))}
                </Text>
                <Text style={[styles.metaText, { color: theme.subText }]}>Max Wickets Cap: {maxWickets}</Text>
              </View>
            </View>

            {/* Current Over Ball Track */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Current Over ({overs}.{balls}):</Text>
            <View style={styles.overBallsRow}>
              {currentOverBalls.map((b, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.ballChip,
                    b === '4' ? styles.fourChip : b === '6' ? styles.sixChip : b === 'W' ? styles.wicketChip : styles.normalChip
                  ]}
                >
                  <Text style={styles.ballText}>{b}</Text>
                </View>
              ))}
            </View>

            {/* Batsmen Statistics Table */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Batting Scorecard:</Text>
            <View style={[styles.playerTable, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <View style={styles.tableRowHeader}>
                <Text style={[styles.tableCol, styles.colName, { color: theme.subText }]}>Batsman</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>R</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>B</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>4s</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>6s</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>SR</Text>
              </View>

              {/* Striker */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, styles.colName, { color: theme.accent, fontWeight: '800' }]}>
                  {striker.name} *
                </Text>
                <Text style={[styles.tableCol, { color: theme.text }]}>{striker.runs}</Text>
                <Text style={[styles.tableCol, { color: theme.text }]}>{striker.balls}</Text>
                <Text style={[styles.tableCol, { color: theme.text }]}>{striker.fours}</Text>
                <Text style={[styles.tableCol, { color: theme.text }]}>{striker.sixes}</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>
                  {((striker.runs / (striker.balls || 1)) * 100).toFixed(0)}
                </Text>
              </View>

              {/* Non-Striker */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, styles.colName, { color: theme.text }]}>
                  {nonStriker.name}
                </Text>
                <Text style={[styles.tableCol, { color: theme.text }]}>{nonStriker.runs}</Text>
                <Text style={[styles.tableCol, { color: theme.text }]}>{nonStriker.balls}</Text>
                <Text style={[styles.tableCol, { color: theme.text }]}>{nonStriker.fours}</Text>
                <Text style={[styles.tableCol, { color: theme.text }]}>{nonStriker.sixes}</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>
                  {((nonStriker.runs / (nonStriker.balls || 1)) * 100).toFixed(0)}
                </Text>
              </View>
            </View>

            {/* Bowler Card */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Current Bowler:</Text>
            <View style={[styles.bowlerCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <Text style={[styles.bowlerName, { color: theme.text }]}>{bowler.name}</Text>
              <Text style={[styles.bowlerStats, { color: theme.subText }]}>
                {bowler.overs} overs • {bowler.wickets} wickets • {bowler.runs} runs
              </Text>
            </View>

            {/* Action Buttons Keypad */}
            <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 16 }]}>Log Ball Result:</Text>
            <View style={styles.keypadGrid}>
              <TouchableOpacity style={styles.keyBtn} onPress={() => handleScoreBall('0', 0)}>
                <Text style={styles.keyBtnText}>0 (Dot)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keyBtn} onPress={() => handleScoreBall('1', 1)}>
                <Text style={styles.keyBtnText}>1 Run</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keyBtn} onPress={() => handleScoreBall('2', 2)}>
                <Text style={styles.keyBtnText}>2 Runs</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keyBtn} onPress={() => handleScoreBall('3', 3)}>
                <Text style={styles.keyBtnText}>3 Runs</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.keyBtn, styles.btnFour]} onPress={() => handleScoreBall('4', 4)}>
                <Text style={styles.keyBtnText}>4 FOUR!</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.keyBtn, styles.btnSix]} onPress={() => handleScoreBall('6', 6)}>
                <Text style={styles.keyBtnText}>6 SIX!</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.keyBtn, styles.btnWicket]} onPress={() => handleScoreBall('W', 0, true)}>
                <Text style={styles.keyBtnText}>☝️ WICKET</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.keyBtn, styles.btnExtra]} onPress={() => handleScoreBall('1WD', 1, false, true)}>
                <Text style={styles.keyBtnText}>Wide (+1)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.keyBtn, styles.btnExtra]} onPress={() => handleScoreBall('1NB', 1, false, true)}>
                <Text style={styles.keyBtnText}>No Ball (+1)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.undoBtn} onPress={handleUndo}>
              <Text style={styles.undoText}>↺ Undo Last Ball</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
    borderWidth: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  title: { fontSize: 18, fontWeight: '800' },
  syncRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', marginRight: 6 },
  syncText: { fontSize: 11, fontWeight: '700' },
  closeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  closeBtnText: { fontSize: 16, fontWeight: '800' },
  scoreBanner: { padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginBottom: 16 },
  matchTeams: { color: '#9ca3af', fontSize: 12, fontWeight: '700' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6, gap: 10 },
  scoreBig: { fontSize: 36, fontWeight: '900' },
  oversText: { fontSize: 18, fontWeight: '800' },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  metaText: { fontSize: 11, fontWeight: '600' },
  sectionLabel: { fontSize: 13, fontWeight: '800', marginBottom: 8, marginTop: 12 },
  overBallsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  ballChip: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  normalChip: { backgroundColor: '#374151' },
  fourChip: { backgroundColor: '#3b82f6' },
  sixChip: { backgroundColor: '#8b5cf6' },
  wicketChip: { backgroundColor: '#ef4444' },
  ballText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  playerTable: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 12 },
  tableRowHeader: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', padding: 10 },
  tableRow: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  tableCol: { flex: 1, textAlign: 'center', fontSize: 12 },
  colName: { flex: 2, textAlign: 'left' },
  bowlerCard: { padding: 12, borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between' },
  bowlerName: { fontSize: 13, fontWeight: '700' },
  bowlerStats: { fontSize: 12 },
  keypadGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  keyBtn: { flexBasis: '30%', backgroundColor: '#1f2937', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  keyBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  btnFour: { backgroundColor: '#2563eb' },
  btnSix: { backgroundColor: '#7c3aed' },
  btnWicket: { backgroundColor: '#dc2626' },
  btnExtra: { backgroundColor: '#4b5563' },
  undoBtn: { backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  undoText: { color: '#9ca3af', fontWeight: '700', fontSize: 13 }
});
