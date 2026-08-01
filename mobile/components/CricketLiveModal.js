import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Share,
  Alert
} from 'react-native';
import { API_BASE } from '../config';
import { useTheme } from '../context/ThemeContext';

export default function CricketLiveModal({ visible, onClose }) {
  const { theme } = useTheme();

  const [feedMode, setFeedMode] = useState('LOCAL'); // 'LOCAL' or 'INTERNATIONAL'
  const [matches, setMatches] = useState([]);
  const [communityMatches, setCommunityMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchLiveScores = async () => {
    try {
      // 1. Fetch International/PSL Feed from Backend Proxy JSON
      const res = await fetch(`${API_BASE}/scoring/live-cricket-feed`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      const data = await res.json();
      if (data.success && data.matches) {
        setMatches(data.matches);
      }

      // 2. Fetch Local Community Broadcasted Matches
      const commRes = await fetch(`${API_BASE}/scoring/broadcasts/community`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      const commData = await commRes.json();
      if (commData.success && commData.communityMatches) {
        setCommunityMatches(commData.communityMatches);
      }

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error('Error fetching live cricket scores:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchLiveScores();
    }
  }, [visible]);

  const handleShareMatch = async (matchTitle, scoreStr, shareUrl) => {
    try {
      await Share.share({
        message: `🏏 SportsAdda Live Scoreboard:\n${matchTitle}\nScore: ${scoreStr}\nWatch Live Updates: ${shareUrl || 'https://sportsadda.app'}`
      });
    } catch (error) {
      Alert.alert('Share', matchTitle);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.bg, borderColor: theme.accent }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 8 }}>🏏</Text>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>Live Cricket & Community Broadcasts</Text>
                <Text style={[styles.subtitle, { color: theme.subText }]}>
                  {lastUpdated ? `Updated: ${lastUpdated}` : 'Real-time SportsAdda Feed'}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.closeBtnText, { color: theme.subText }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Feed Mode Switcher Tabs */}
          <View style={[styles.tabBar, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.tabBtn, feedMode === 'LOCAL' && { backgroundColor: theme.accent }]}
              onPress={() => setFeedMode('LOCAL')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: theme.subText },
                  feedMode === 'LOCAL' && { color: '#000', fontWeight: '900' }
                ]}
              >
                📢 Local Pakistan Matches
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, feedMode === 'INTERNATIONAL' && { backgroundColor: theme.accent }]}
              onPress={() => setFeedMode('INTERNATIONAL')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: theme.subText },
                  feedMode === 'INTERNATIONAL' && { color: '#000', fontWeight: '900' }
                ]}
              >
                🌐 International & PSL
              </Text>
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          {loading ? (
            <ActivityIndicator size="large" color={theme.accent} style={{ marginVertical: 40 }} />
          ) : (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 20 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    fetchLiveScores();
                  }}
                  colors={[theme.accent]}
                />
              }
            >
              {feedMode === 'LOCAL' ? (
                /* Local Community Matches Broadcasted by Amateur Teams */
                <View>
                  {communityMatches.map((m) => (
                    <View
                      key={m.id}
                      style={[styles.matchCard, styles.localMatchCard, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}
                    >
                      <View style={styles.matchCardHeader}>
                        <View style={styles.liveBadge}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveBadgeText}>LIVE BROADCAST 🔴</Text>
                        </View>
                        <Text style={[styles.venueText, { color: theme.subText }]}>{m.venue}</Text>
                      </View>

                      <View style={styles.localScoreRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.teamNameText, { color: theme.text }]}>{m.teamA}</Text>
                          <Text style={[styles.scoreTextBig, { color: theme.accent }]}>
                            {m.scoreA} <Text style={{ fontSize: 12, color: theme.subText }}>({m.oversA} ov)</Text>
                          </Text>
                        </View>

                        <Text style={[styles.vsText, { color: theme.subText }]}>VS</Text>

                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={[styles.teamNameText, { color: theme.text }]}>{m.teamB}</Text>
                          <Text style={[styles.scoreTextBig, { color: theme.text }]}>
                            {m.scoreB} <Text style={{ fontSize: 12, color: theme.subText }}>({m.oversB || m.time} ov)</Text>
                          </Text>
                        </View>
                      </View>

                      {/* Share Scorecard Button */}
                      <TouchableOpacity
                        style={[styles.shareBtn, { backgroundColor: theme.accent }]}
                        onPress={() => handleShareMatch(`${m.teamA} vs ${m.teamB}`, `${m.scoreA} vs ${m.scoreB}`, m.shareUrl)}
                      >
                        <Text style={styles.shareBtnText}>📢 Share Live Scorecard Link</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                /* International & PSL Matches */
                <View>
                  {matches.map((m) => (
                    <View
                      key={m.id}
                      style={[
                        styles.matchCard,
                        { backgroundColor: theme.cardBg, borderColor: theme.border },
                        m.isPak && { borderColor: theme.accent, backgroundColor: theme.badgeBg }
                      ]}
                    >
                      <View style={styles.matchCardHeader}>
                        <View style={styles.badgeRow}>
                          {m.isLive ? (
                            <View style={styles.liveBadge}>
                              <View style={styles.liveDot} />
                              <Text style={styles.liveBadgeText}>LIVE</Text>
                            </View>
                          ) : (
                            <View style={styles.scheduledBadge}>
                              <Text style={styles.scheduledBadgeText}>FIXTURE</Text>
                            </View>
                          )}

                          {m.isPak && (
                            <View style={[styles.pakTag, { backgroundColor: theme.badgeBg }]}>
                              <Text style={[styles.pakTagText, { color: theme.accent }]}>🇵🇰 PAKISTAN MATCH</Text>
                            </View>
                          )}
                        </View>

                        <TouchableOpacity
                          onPress={() => handleShareMatch(m.title, 'Live Score', m.link)}
                          style={[styles.miniShareBtn, { backgroundColor: theme.border }]}
                        >
                          <Text style={{ fontSize: 11 }}>🔗 Share</Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={[styles.matchTitle, { color: theme.text }]}>{m.title}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {/* Refresh Footer */}
          <TouchableOpacity style={[styles.refreshBtn, { backgroundColor: theme.accent }]} onPress={fetchLiveScores}>
            <Text style={styles.refreshBtnText}>🔄 Refresh Live Broadcasts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    borderWidth: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 17,
    fontWeight: '800'
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700'
  },
  matchCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1
  },
  localMatchCard: {
    padding: 16
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginRight: 6
  },
  liveBadgeText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '800'
  },
  scheduledBadge: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  scheduledBadgeText: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '800'
  },
  pakTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  pakTagText: {
    fontSize: 10,
    fontWeight: '800'
  },
  venueText: {
    fontSize: 10,
    fontWeight: '600'
  },
  matchTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22
  },
  localScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10
  },
  teamNameText: {
    fontSize: 14,
    fontWeight: '800'
  },
  scoreTextBig: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2
  },
  vsText: {
    fontSize: 12,
    fontWeight: '900',
    marginHorizontal: 10
  },
  shareBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  shareBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 12
  },
  miniShareBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  refreshBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },
  refreshBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14
  }
});
