import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

import { API_BASE } from '../config';

export default function BookingsScreen({ onNavigate }) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedPass, setSelectedPass] = useState(null);
  const [dbBookings, setDbBookings] = useState([]);

  React.useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetch(`${API_BASE}/bookings/customer/cricket-bookings?user_id=11111111-1111-1111-1111-111111111111`);
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          setDbBookings(data.bookings);
        }
      } catch (err) {
        console.warn('Mobile API bookings fetch error:', err);
      }
    }
    loadBookings();
  }, []);

  const defaultBookings = [
    {
      id: 'BK-TENNIS-01',
      title: 'Pioneer Tennis Courts',
      sub: 'Court 4, North Wing',
      status: 'CONFIRMED',
      statusColor: '#0052ff',
      dateTime: 'Oct 24, 2026 • 18:30 - 20:00',
      icon: '🎾',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=APEX-PIONEER-COURT4-OCT24'
    },
    {
      id: 'BK-AQUA-02',
      title: 'AquaFit Center',
      sub: 'Lane 2, Indoor Pool',
      status: 'UPCOMING',
      statusColor: '#00c6ff',
      dateTime: 'Oct 28, 2026 • 09:00 - 10:00',
      icon: '🏊',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=APEX-AQUAFIT-LANE2-OCT28'
    }
  ];

  const bookingsList = dbBookings.length > 0
    ? dbBookings.map((b) => ({
        id: b.booking_id || b.id,
        title: b.pitch_name || b.arena_name || 'Indoor Sports Arena',
        sub: `Slot Date: ${b.slot_date ? new Date(b.slot_date).toLocaleDateString() : 'Active'}`,
        status: (b.booking_status || 'CONFIRMED').toUpperCase(),
        statusColor: '#0052ff',
        dateTime: `${b.start_time || '04:00 PM'} - ${b.end_time || '05:00 PM'}`,
        icon: '🏏',
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=APEX-${b.booking_id || 'PASS'}`
      }))
    : defaultBookings;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Segmented Tab Switcher */}
      <View style={styles.tabContainer}>
        <View style={[styles.tabBar, { backgroundColor: theme.surfaceLow }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'upcoming' && { backgroundColor: theme.primary }
            ]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'upcoming' ? '#ffffff' : theme.subText }]}>
              Upcoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'past' && { backgroundColor: theme.primary }
            ]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'past' ? '#ffffff' : theme.subText }]}>
              Past
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bookings List */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {activeTab === 'upcoming' ? (
          bookingsList.map((item) => (
            <View
              key={item.id}
              style={[styles.bookingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <View style={{ flexDirection: 'row', justify: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 }}>
                  <View style={[styles.iconWrapper, { backgroundColor: theme.badgeBg }]}>
                    <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.cardSub, { color: theme.subText }]}>{item.sub}</Text>
                  </View>
                </View>

                <View style={[styles.statusTag, { backgroundColor: theme.badgeBg }]}>
                  <Text style={[styles.statusText, { color: theme.primary }]}>{item.status}</Text>
                </View>
              </View>

              <View style={[styles.dateRow, { backgroundColor: theme.surfaceLow }]}>
                <Text style={{ fontSize: 13 }}>🕒</Text>
                <Text style={[styles.dateTimeText, { color: theme.subText }]}>{item.dateTime}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity
                  style={[styles.passBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setSelectedPass(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.passBtnText}>🎟️ View Pass</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.manageBtn, { backgroundColor: theme.surfaceLow }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.manageBtnText, { color: theme.text }]}>Manage</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: theme.subText, fontSize: 14 }}>No past bookings found</Text>
          </View>
        )}
      </ScrollView>

      {/* QR Pass Modal */}
      {selectedPass && (
        <Modal transparent animationType="fade" visible={!!selectedPass}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Match Slot Confirmed!</Text>
              <Text style={[styles.modalSub, { color: theme.subText }]}>Apex Athletics • Automated Kiosk Pass</Text>

              <View style={styles.qrContainer}>
                <Image source={{ uri: selectedPass.qrCode }} style={styles.qrImage} />
              </View>

              <Text style={[styles.passIdText, { color: theme.subText, backgroundColor: theme.surfaceLow }]}>
                Pass ID: {selectedPass.id}
              </Text>

              <TouchableOpacity
                style={[styles.closeModalBtn, { backgroundColor: theme.primary }]}
                onPress={() => setSelectedPass(null)}
              >
                <Text style={styles.closeModalText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingTop: 14
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center'
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800'
  },
  bookingCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  cardSub: {
    fontSize: 12,
    marginTop: 1
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 12,
    marginTop: 12
  },
  dateTimeText: {
    fontSize: 11,
    fontWeight: '600'
  },
  passBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center'
  },
  passBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  manageBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center'
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalBox: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center'
  },
  modalSub: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center'
  },
  qrContainer: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16
  },
  qrImage: {
    width: 160,
    height: 160
  },
  passIdText: {
    fontSize: 11,
    fontFamily: 'monospace',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 16
  },
  closeModalBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center'
  },
  closeModalText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  }
});
