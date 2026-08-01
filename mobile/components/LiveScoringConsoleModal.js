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

  // Score State
  const [runs, setRuns] = useState(142);
  const [wickets, setWickets] = useState(3);
  const [overs, setOvers] = useState(16);
  const [balls, setBalls] = useState(4);
  const [currentOverBalls, setCurrentOverBalls] = useState(['1', '4', '0', 'W', '6', '2']);

  // Player Stats State
  const [striker, setStriker] = useState({ name: 'Babar Azam', runs: 64, balls: 42, fours: 7, sixes: 2 });
  const [nonStriker, setNonStriker] = useState({ name: 'Rizwan Keeper', runs: 38, balls: 28, fours: 4, sixes: 1 });
  const [bowler, setBowler] = useState({ name: 'Shaheen Afridi', overs: 3.4, runs: 28, wickets: 2 });

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
      }
    } catch (e) {
      console.log('Live scoring poll (using local state):', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchScoreboard();
      // Auto-sync interval every 3 seconds for conflict-free dual team score updates
      const interval = setInterval(fetchScoreboard, 3000);
      return () => clearInterval(interval);
    }
  }, [visible]);

  // Record a Ball / Event
  const handleScoreBall = (eventLabel, runVal = 0, isWicket = false, isExtra = false) => {
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

    // Update Striker Stats
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

    // Send payload to backend
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
    if (currentOverBalls.length === 0 && balls === 0) return;
    const lastBall = currentOverBalls[currentOverBalls.length - 1];
    setCurrentOverBalls(currentOverBalls.slice(0, -1));
    if (balls > 0) setBalls(balls - 1);
    Alert.alert('↺ Undo Ball', `Reverted last ball (${lastBall || '0'})`);
  };

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
                  🟢 Real-Time Synced (Both Teams View Enabled)
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
              <Text style={styles.matchTeams}>Lahore Qalandars vs Karachi Kings</Text>
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreBig, { color: theme.text }]}>
                  {runs}/{wickets}
                </Text>
                <Text style={[styles.oversText, { color: theme.accent }]}>
                  ({overs}.{balls} Overs)
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={[styles.metaText, { color: theme.subText }]}>
                  CRR: {((runs / (overs + balls / 6 || 1)).toFixed(2))}
                </Text>
                <Text style={[styles.metaText, { color: theme.subText }]}>Target: 185 (Need 43 in 20b)</Text>
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
                <Text style={[styles.tableCol, { color: theme.text, fontWeight: '800' }]}>{striker.runs}</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>{striker.balls}</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>{striker.fours}</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>{striker.sixes}</Text>
                <Text style={[styles.tableCol, { color: theme.accent, fontWeight: '700' }]}>
                  {((striker.runs / (striker.balls || 1)) * 100).toFixed(0)}
                </Text>
              </View>

              {/* Non-Striker */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, styles.colName, { color: theme.text }]}>{nonStriker.name}</Text>
                <Text style={[styles.tableCol, { color: theme.text, fontWeight: '800' }]}>{nonStriker.runs}</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>{nonStriker.balls}</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>{nonStriker.fours}</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>{nonStriker.sixes}</Text>
                <Text style={[styles.tableCol, { color: theme.subText }]}>
                  {((nonStriker.runs / (nonStriker.balls || 1)) * 100).toFixed(0)}
                </Text>
              </View>
            </View>

            {/* Active Bowler Card */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Active Bowler:</Text>
            <View style={[styles.bowlerCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <Text style={[styles.bowlerName, { color: theme.text }]}>🎯 {bowler.name}</Text>
              <Text style={[styles.bowlerStats, { color: theme.accent }]}>
                {bowler.wickets} Wickets • {bowler.runs} Runs • {overs}.{balls} Overs (Econ: {((bowler.runs / (overs + balls/6 || 1)).toFixed(2))})
              </Text>
            </View>

            {/* Interactive Ball Score Entry Console */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Mark Score & Ball Details:</Text>
            <View style={styles.consoleGrid}>
              <TouchableOpacity style={styles.btnDot} onPress={() => handleScoreBall('0', 0)}>
                <Text style={styles.btnText}>0 (Dot)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnRun} onPress={() => handleScoreBall('1', 1)}>
                <Text style={styles.btnText}>1 Run</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnRun} onPress={() => handleScoreBall('2', 2)}>
                <Text style={styles.btnText}>2 Runs</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnRun} onPress={() => handleScoreBall('3', 3)}>
                <Text style={styles.btnText}>3 Runs</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnFour} onPress={() => handleScoreBall('4', 4)}>
                <Text style={styles.btnTextBold}>4 (FOUR! 💥)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSix} onPress={() => handleScoreBall('6', 6)}>
                <Text style={styles.btnTextBold}>6 (SIX! 🚀)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnWicket} onPress={() => handleScoreBall('W', 0, true)}>
                <Text style={styles.btnTextBold}>☝️ WICKET!</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnExtra} onPress={() => handleScoreBall('WD', 1, false, true)}>
                <Text style={styles.btnText}>WD (Wide)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnExtra} onPress={() => handleScoreBall('NB', 1, false, true)}>
                <Text style={styles.btnText}>NB (No Ball)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnUndo} onPress={handleUndo}>
                <Text style={styles.btnTextBold}>↺ UNDO</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
    borderWidth: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  title: { fontSize: 18, fontWeight: '900' },
  syncRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 6 },
  syncText: { fontSize: 11, fontWeight: '700' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 16, fontWeight: 'bold' },
  scoreBanner: { borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1 },
  matchTeams: { color: '#9ca3af', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  scoreBig: { fontSize: 32, fontWeight: '900' },
  oversText: { fontSize: 18, fontWeight: '800' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  metaText: { fontSize: 12, fontWeight: '600' },
  sectionLabel: { fontSize: 13, fontWeight: '800', marginTop: 8, marginBottom: 8 },
  overBallsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  ballChip: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  normalChip: { backgroundColor: '#1f2937' },
  fourChip: { backgroundColor: '#f59e0b' },
  sixChip: { backgroundColor: '#8b5cf6' },
  wicketChip: { backgroundColor: '#ef4444' },
  ballText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  playerTable: { borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1 },
  tableRowHeader: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  tableRow: { flexDirection: 'row', paddingTop: 8, paddingBottom: 4 },
  tableCol: { flex: 1, fontSize: 12, textAlign: 'center' },
  colName: { flex: 3, textAlign: 'left' },
  bowlerCard: { borderRadius: 14, padding: 12, marginBottom: 14, borderWidth: 1 },
  bowlerName: { fontSize: 14, fontWeight: '800' },
  bowlerStats: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  consoleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  btnDot: { width: '31%', backgroundColor: '#374151', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnRun: { width: '31%', backgroundColor: '#1f2937', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnFour: { width: '48%', backgroundColor: '#f59e0b', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnSix: { width: '48%', backgroundColor: '#8b5cf6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnWicket: { width: '48%', backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnExtra: { width: '23%', backgroundColor: '#06b6d4', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnUndo: { width: '48%', backgroundColor: '#4b5563', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  btnTextBold: { color: '#fff', fontSize: 13, fontWeight: '900' }
});
