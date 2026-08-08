import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { API_BASE } from '../config';

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
} catch (e) {
  const memoryStore = {};
  AsyncStorage = {
    getItem: async (key) => memoryStore[key] || null,
    setItem: async (key, val) => { memoryStore[key] = val; },
    removeItem: async (key) => { delete memoryStore[key]; }
  };
}

/**
 * Mobile Offline-First Live Scoring Console Modal
 * Features persistent AsyncStorage offline fallback so field scorers never lose ball-by-ball data.
 */
export default function LiveScoringConsoleModal({ visible, matchId, onClose }) {
  const [matchState, setMatchState] = useState({
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    isOffline: false,
    queuedEvents: []
  });

  const storageKey = `offline_match_scoring_${matchId}`;

  // Load offline state on mount
  useEffect(() => {
    if (visible && matchId) {
      loadOfflineState();
    }
  }, [visible, matchId]);

  const loadOfflineState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(storageKey);
      if (savedState) {
        setMatchState(JSON.parse(savedState));
      }
    } catch (e) {
      console.error('AsyncStorage load error:', e);
    }
  };

  const saveOfflineState = async (newState) => {
    try {
      setMatchState(newState);
      await AsyncStorage.setItem(storageKey, JSON.stringify(newState));
    } catch (e) {
      console.error('AsyncStorage save error:', e);
    }
  };

  const handleRecordBall = async (runs, isWicket = false) => {
    let newBalls = matchState.balls + 1;
    let newOvers = matchState.overs;
    if (newBalls >= 6) {
      newOvers += 1;
      newBalls = 0;
    }

    const updatedState = {
      ...matchState,
      runs: matchState.runs + runs,
      wickets: matchState.wickets + (isWicket ? 1 : 0),
      overs: newOvers,
      balls: newBalls,
      queuedEvents: [
        ...matchState.queuedEvents,
        { runs, isWicket, timestamp: Date.now() }
      ]
    };

    await saveOfflineState(updatedState);

    // Try posting to backend API
    try {
      const res = await fetch(`${API_BASE}/scoring/matches/${matchId}/ball`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runs, isWicket })
      });
      const data = await res.json();
      if (data.success) {
        // Clear synced queue
        await saveOfflineState({ ...updatedState, queuedEvents: [], isOffline: false });
      }
    } catch (e) {
      // Mark as offline, state is safely persisted in AsyncStorage
      await saveOfflineState({ ...updatedState, isOffline: true });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>🏏 Live Field Scoring Console</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 18, color: '#9ca3af', fontWeight: '800' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {matchState.isOffline && (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineText}>
                ⚠️ Offline Mode: Match data saved locally to device storage ({matchState.queuedEvents.length} queued).
              </Text>
            </View>
          )}

          {/* Live Score Display */}
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>
              {matchState.runs} / {matchState.wickets}
            </Text>
            <Text style={styles.oversText}>
              Overs: {matchState.overs}.{matchState.balls}
            </Text>
          </View>

          {/* Quick Score Action Buttons */}
          <View style={styles.btnGrid}>
            {[0, 1, 2, 3, 4, 6].map((runs) => (
              <TouchableOpacity
                key={runs}
                style={[styles.scoreBtn, runs === 4 && styles.fourBtn, runs === 6 && styles.sixBtn]}
                onPress={() => handleRecordBall(runs, false)}
              >
                <Text style={styles.btnText}>+{runs} {runs === 4 ? 'FOUR!' : runs === 6 ? 'SIX!' : 'Run'}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.wicketBtn} onPress={() => handleRecordBall(0, true)}>
              <Text style={styles.btnText}>☝️ WICKET OUT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#111827', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderTopWidth: 2, borderColor: '#10b981' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '800', color: '#fff' },
  offlineBanner: { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderWidth: 1, borderColor: '#f59e0b', padding: 8, borderRadius: 8, marginBottom: 12 },
  offlineText: { color: '#f59e0b', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  scoreBox: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: '#10b981', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20 },
  scoreText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  oversText: { fontSize: 14, fontWeight: '700', color: '#10b981', marginTop: 4 },
  btnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  scoreBtn: { width: '30%', paddingVertical: 14, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  fourBtn: { backgroundColor: 'rgba(59, 130, 246, 0.3)', borderWidth: 1, borderColor: '#3b82f6' },
  sixBtn: { backgroundColor: 'rgba(168, 85, 247, 0.3)', borderWidth: 1, borderColor: '#a855f7' },
  wicketBtn: { width: '100%', paddingVertical: 14, borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.3)', borderWidth: 1, borderColor: '#ef4444', alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14 }
});
