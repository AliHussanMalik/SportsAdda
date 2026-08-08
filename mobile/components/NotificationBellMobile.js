import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { API_BASE } from '../config';
import { useAuth } from '../context/AuthContext';

export default function NotificationBellMobile() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user || !user.user_id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notifications?user_id=${user.user_id}`, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (e) {
      console.error('Failed to fetch mobile notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !user.user_id) return;
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id })
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'UNREAD' ? !n.is_read : true
  );

  return (
    <View>
      {/* Bell Touch Button */}
      <TouchableOpacity style={styles.bellBtn} onPress={() => setModalVisible(true)}>
        <Text style={{ fontSize: 18 }}>🔔</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notifications Drawer Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.modalTitle}>🔔 Notifications</Text>
                {unreadCount > 0 && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>{unreadCount} New</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 18, color: '#9ca3af', fontWeight: '800' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Pills & Mark All Read */}
            <View style={styles.filterRow}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {['ALL', 'UNREAD'].map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterChip, filter === f && styles.filterChipActive]}
                    onPress={() => setFilter(f)}
                  >
                    <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllAsRead}>
                  <Text style={styles.markReadText}>✓ Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Notification Items */}
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {loading ? (
                <ActivityIndicator color="#10b981" style={{ marginTop: 20 }} />
              ) : filteredNotifications.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#9ca3af', marginVertical: 30, fontSize: 13 }}>
                  No notifications found.
                </Text>
              ) : (
                filteredNotifications.map((n) => (
                  <TouchableOpacity
                    key={n.id}
                    style={[styles.itemCard, !n.is_read && styles.itemCardUnread]}
                    onPress={() => !n.is_read && handleMarkAsRead(n.id)}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.itemTitle}>{n.title}</Text>
                      {!n.is_read && <View style={styles.dot} />}
                    </View>
                    <Text style={styles.itemMsg}>{n.message}</Text>
                    <Text style={styles.itemTime}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bellBtn: { position: 'relative', padding: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' },
  unreadBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  unreadBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#111827', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', borderWidth: 1, borderColor: '#374151' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  newBadge: { backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  newBadgeText: { color: '#000', fontWeight: '900', fontSize: 10 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  filterChipActive: { backgroundColor: '#10b981' },
  filterChipText: { fontSize: 11, fontWeight: '800', color: '#9ca3af' },
  filterChipTextActive: { color: '#000' },
  markReadText: { color: '#10b981', fontSize: 12, fontWeight: '800' },
  itemCard: { padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: 10, borderWidth: 1, borderColor: '#1f2937' },
  itemCardUnread: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.4)' },
  itemTitle: { fontSize: 14, fontWeight: '800', color: '#fff' },
  itemMsg: { fontSize: 12, color: '#9ca3af', marginTop: 4, lineHeight: 16 },
  itemTime: { fontSize: 10, color: '#6b7280', marginTop: 6, textAlign: 'right' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' }
});
