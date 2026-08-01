import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { API_BASE } from '../config';

export default function BookingsScreen() {
  const [arenas, setArenas] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArenas = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${API_BASE}/bookings/arenas`, {
        signal: controller.signal,
        headers: { 'Bypass-Tunnel-Reminder': 'true' }
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.success && data.arenas.length > 0) {
        setArenas(data.arenas);
        if (data.arenas[0].courts.length > 0) {
          setSelectedCourt(data.arenas[0].courts[0]);
        }
      } else {
        setError('No arenas found');
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.error('BookingsScreen fetch error:', e);
      setError(e.name === 'AbortError' ? 'Connection timed out. Check backend server.' : 'Network request failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    if (!selectedCourt) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/slots?court_id=${selectedCourt.id}`);
      const data = await res.json();
      if (data.success) setSlots(data.slots);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchArenas();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [selectedCourt]);

  const handleBookSlot = async (slot) => {
    if (slot.isBooked || !selectedCourt) return;
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          court_id: selectedCourt.id,
          booked_by_user_id: '00000000-0000-0000-0000-000000000000',
          start_time: slot.startTime,
          end_time: slot.endTime,
          payment_status: 'CONFIRMED'
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Booking Confirmed! ⚽', `QR Check-In Payload:\n${data.booking.id}`);
        fetchSlots();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>📅 Indoor Court Booking</Text>
      <Text style={styles.subtitle}>Dynamic hourly slots & QR check-in payload</Text>

      {/* Courts Carousel */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {arenas.flatMap((a) => a.courts).map((court) => (
          <TouchableOpacity
            key={court.id}
            style={[styles.courtChip, selectedCourt?.id === court.id && styles.selectedCourtChip]}
            onPress={() => setSelectedCourt(court)}
          >
            <Text style={{ fontSize: 18, marginRight: 6 }}>
              {court.sport_type === 'CRICKET' ? '🏏' : court.sport_type === 'PADEL' ? '🎾' : '⚽'}
            </Text>
            <View>
              <Text style={styles.courtName}>{court.court_name}</Text>
              <Text style={styles.courtRate}>${court.hourly_rate}/hr</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Slots Grid */}
      <Text style={styles.sectionHeader}>Available Hourly Slots</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 20 }} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchArenas}>
            <Text style={styles.retryText}>🔄 Retry Connection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.slotsGrid}>
          {slots.map((s) => (
            <TouchableOpacity
              key={s.hour}
              disabled={s.isBooked}
              style={[
                styles.slotCard,
                s.isBooked && styles.bookedSlot,
                s.isPeak && !s.isBooked && styles.peakSlot
              ]}
              onPress={() => handleBookSlot(s)}
            >
              <Text style={[styles.slotTime, s.isBooked && { color: '#6b7280' }]}>{s.timeLabel}</Text>
              <View style={styles.slotFooter}>
                <Text style={[styles.slotPrice, s.isBooked && { color: '#6b7280' }]}>${s.rate}</Text>
                {s.isPeak && !s.isBooked && <Text style={styles.peakLabel}>⚡ PEAK</Text>}
                {s.isBooked && <Text style={{ fontSize: 10, color: '#6b7280', fontWeight: 'bold' }}>RESERVED</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginBottom: 16 },
  courtChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  selectedCourtChip: { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)' },
  courtName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  courtRate: { color: '#10b981', fontSize: 11, fontWeight: '600' },
  sectionHeader: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  bookedSlot: { backgroundColor: 'rgba(31,41,55,0.4)', borderColor: '#1f2937' },
  peakSlot: { borderColor: 'rgba(245,158,11,0.5)', backgroundColor: 'rgba(245,158,11,0.08)' },
  slotTime: { color: '#fff', fontSize: 14, fontWeight: '800' },
  slotFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  slotPrice: { color: '#10b981', fontWeight: '800', fontSize: 13 },
  peakLabel: { color: '#f59e0b', fontSize: 9, fontWeight: '900' },
  errorContainer: { alignItems: 'center', marginTop: 30, padding: 16 },
  errorText: { color: '#ef4444', fontSize: 14, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  retryBtn: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 13 }
});
