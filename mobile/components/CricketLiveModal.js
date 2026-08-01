import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';

export default function CricketLiveModal({ visible, onClose }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchLiveScores = async () => {
    try {
      const res = await fetch('http://static.espncricinfo.com/rss/livescores.xml');
      const xmlText = await res.text();
      const parsedMatches = parseCricinfoRss(xmlText);
      setMatches(parsedMatches);
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

  const parseCricinfoRss = (xmlString) => {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xmlString)) !== null) {
      const itemContent = match[1];
      const titleMatch = /<title>(.*?)<\/title>/.exec(itemContent);
      const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent);

      if (titleMatch && titleMatch[1]) {
        const rawTitle = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        const link = linkMatch ? linkMatch[1].trim() : '';

        // Check if match features Pakistan or PSL
        const isPak = /Pakistan|PSL|Karachi|Lahore|Islamabad|Peshawar|Quetta|Multan|Rawalpindi/i.test(rawTitle);

        items.push({
          id: Math.random().toString(),
          title: rawTitle,
          link,
          isPak,
          isLive: rawTitle.includes('*') || rawTitle.includes('/')
        });
      }
    }

    return items;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 8 }}>🏏</Text>
              <View>
                <Text style={styles.title}>Cricket Live Scorecard</Text>
                <Text style={styles.subtitle}>
                  {lastUpdated ? `Updated: ${lastUpdated}` : 'Real-time ESPNCricinfo Feed'}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Pakistan Flag / Live Status Banner */}
          <View style={styles.pakBanner}>
            <Text style={styles.pakBannerText}>🇵🇰 Pakistan & Global Live Match Updates</Text>
          </View>

          {/* Matches List */}
          {loading ? (
            <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 40 }} />
          ) : (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 20 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLiveScores(); }} colors={['#10b981']} />}
            >
              {matches.length === 0 ? (
                <Text style={styles.emptyText}>No live matches right now. Pull down to refresh!</Text>
              ) : (
                matches.map((m) => (
                  <View key={m.id} style={[styles.matchCard, m.isPak && styles.pakCard]}>
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
                          <View style={styles.pakTag}>
                            <Text style={styles.pakTagText}>🇵🇰 PAKISTAN MATCH</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Text style={styles.matchTitle}>{m.title}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          )}

          {/* Refresh Button Footer */}
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchLiveScores}>
            <Text style={styles.refreshBtnText}>🔄 Refresh Live Scores</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#0d1322',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800'
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 2
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeBtnText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: 'bold'
  },
  pakBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  pakBannerText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center'
  },
  matchCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  pakCard: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)'
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
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  pakTagText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800'
  },
  matchTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14
  },
  refreshBtn: {
    backgroundColor: '#10b981',
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
