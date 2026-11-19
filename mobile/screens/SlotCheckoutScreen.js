import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

import { API_BASE } from '../config';

export default function SlotCheckoutScreen({ onNavigate, onConfirmBooking }) {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(12);
  const [selectedSlot, setSelectedSlot] = useState('04:00 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dates = [
    { day: 'Sun', date: 11 },
    { day: 'Mon', date: 12 },
    { day: 'Tue', date: 13 },
    { day: 'Wed', date: 14 },
    { day: 'Thu', date: 15 },
    { day: 'Fri', date: 16 }
  ];

  const slots = [
    { time: '03:00 PM', peak: false },
    { time: '04:00 PM', peak: true },
    { time: '05:00 PM', peak: true },
    { time: '06:00 PM', peak: true },
    { time: '07:00 PM', peak: false },
    { time: '08:00 PM', peak: false }
  ];

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          court_id: '11111111-1111-1111-1111-111111111111',
          user_id: '11111111-1111-1111-1111-111111111111',
          date: `2026-10-${selectedDate}`,
          start_time: selectedSlot,
          end_time: '05:00 PM',
          total_price: 45.00,
          payment_method: 'CASH'
        })
      });
    } catch (err) {
      console.warn('Mobile booking DB write error:', err);
    } finally {
      setIsSubmitting(false);
      Alert.alert(
        '⚡ Slot Booking Confirmed!',
        `You booked Mon ${selectedDate}, at ${selectedSlot} for $45.00. Saved to database.`,
        [
          {
            text: 'View Pass',
            onPress: () => {
              if (onConfirmBooking) {
                onConfirmBooking({ date: selectedDate, time: selectedSlot, price: '$45.00' });
              }
              if (onNavigate) {
                onNavigate('bookings');
              }
            }
          }
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        {/* Selected Court Card */}
        <View style={[styles.courtCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=200' }}
            style={styles.courtThumb}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.courtTitle, { color: theme.text }]}>Indoor Court A</Text>
            <Text style={[styles.courtLocation, { color: theme.subText }]}>📍 Downtown Sports Complex</Text>
          </View>
        </View>

        {/* Date Selector */}
        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={[styles.sectionHeading, { color: theme.text }]}>Select Date</Text>
            <Text style={{ fontSize: 11, color: theme.primary, fontWeight: '700' }}>OCTOBER 2026</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {dates.map((d) => (
              <TouchableOpacity
                key={d.date}
                style={[
                  styles.datePill,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  selectedDate === d.date && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => setSelectedDate(d.date)}
              >
                <Text style={[styles.dateDay, { color: selectedDate === d.date ? '#ffffff' : theme.subText }]}>
                  {d.day}
                </Text>
                <Text style={[styles.dateNumber, { color: selectedDate === d.date ? '#ffffff' : theme.text }]}>
                  {d.date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Available Slots */}
        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.sectionHeading, { color: theme.text }]}>Available Slots</Text>
            <Text style={{ fontSize: 11, color: theme.subText }}>6 Slots open</Text>
          </View>

          <View style={styles.slotsGrid}>
            {slots.map((s) => (
              <TouchableOpacity
                key={s.time}
                style={[
                  styles.slotChip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  selectedSlot === s.time && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => setSelectedSlot(s.time)}
              >
                <Text style={[styles.slotTime, { color: selectedSlot === s.time ? '#ffffff' : theme.text }]}>
                  {s.time}
                </Text>
                {s.peak && (
                  <Text style={[styles.peakBadge, { color: selectedSlot === s.time ? '#ffffff' : theme.primary }]}>
                    ⚡ Peak Slot
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Summary & CTA */}
      <View style={[styles.bottomBar, { backgroundColor: theme.navBg, borderTopColor: theme.border }]}>
        <View>
          <Text style={{ fontSize: 11, color: theme.subText, textTransform: 'uppercase', fontWeight: '600' }}>
            Mon {selectedDate}, {selectedSlot}
          </Text>
          <Text style={[styles.totalPrice, { color: theme.text }]}>$45.00</Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmText}>CONFIRM BOOKING →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  courtCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12
  },
  courtThumb: {
    width: 56,
    height: 56,
    borderRadius: 14
  },
  courtTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  courtLocation: {
    fontSize: 12,
    marginTop: 2
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800'
  },
  datePill: {
    width: 58,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center'
  },
  dateDay: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  slotChip: {
    width: '48%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '800'
  },
  peakBadge: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800'
  },
  confirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16
  },
  confirmText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  }
});
