import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { API_BASE } from '../config';

export default function BookingsScreen() {
  const [arenas, setArenas] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state for Pakistan Indoor Venues
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [osmResults, setOsmResults] = useState([]);
  const [searchingOsm, setSearchingOsm] = useState(false);

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
        setError('No indoor venues found');
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

  const searchOsmPakistan = async (query) => {
    if (!query || query.trim().length < 2) return;
    setSearchingOsm(true);
    try {
      const q = encodeURIComponent(`${query} indoor sports Pakistan`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=4`, {
        headers: { 'User-Agent': 'SportsAddaApp/1.0' }
      });
      const data = await res.json();
      setOsmResults(data);
    } catch (e) {
      console.error('OSM Search error:', e);
    } finally {
      setSearchingOsm(false);
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
        Alert.alert('Booking Confirmed! 🇵🇰', `QR Check-In Payload:\n${data.booking.id}`);
        fetchSlots();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter courts by query and sport
  const allCourts = arenas.flatMap((a) => a.courts.map((c) => ({ ...c, arenaName: a.name, arenaAddress: a.address })));
  const filteredCourts = allCourts.filter((c) => {
    const matchesQuery =
      c.court_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.arenaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.arenaAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'ALL' || c.sport_type === selectedSport;
    return matchesQuery && matchesSport;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>🏟️ Indoor Turfs & Arenas</Text>
      <Text style={styles.subtitle}>Book Box Cricket, Futsal & Padel courts in Pakistan (PKR)</Text>

      {/* Pakistan Search Input */}
      <View style={styles.searchBox}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by city (Lahore, Karachi...) or turf name"
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={(txt) => {
            setSearchQuery(txt);
            if (txt.length > 3) searchOsmPakistan(txt);
          }}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={{ color: '#9ca3af', fontSize: 16, paddingHorizontal: 6 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sport Category Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {['ALL', 'CRICKET', 'FUTSAL', 'PADEL'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, selectedSport === s && styles.selectedFilterChip]}
            onPress={() => setSelectedSport(s)}
          >
            <Text style={[styles.filterChipText, selectedSport === s && styles.selectedFilterChipText]}>
              {s === 'ALL' ? '⚡ All Sports' : s === 'CRICKET' ? '🏏 Cricket' : s === 'PADEL' ? '🎾 Padel' : '⚽ Futsal'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* OpenStreetMap Pakistan Nearby Search Results (If Available) */}
      {osmResults.length > 0 && searchQuery.length >= 3 && (
        <View style={styles.osmContainer}>
          <Text style={styles.osmTitle}>📍 OpenStreetMap PK Nearby Venues</Text>
          {osmResults.map((item) => (
            <View key={item.place_id} style={styles.osmCard}>
              <Text style={styles.osmName}>{item.name || item.display_name.split(',')[0]}</Text>
              <Text style={styles.osmAddress} numberOfLines={2}>{item.display_name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Registered Arenas & Courts Carousel */}
      <Text style={styles.sectionHeader}>Available Registered Courts</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {filteredCourts.map((court) => (
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
              <Text style={styles.courtRate}>Rs. {court.hourly_rate * 70}/hr</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Slots Grid */}
      <Text style={styles.sectionHeader}>
        Hourly Slots for {selectedCourt ? selectedCourt.court_name : 'Selected Court'}
      </Text>

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
                <Text style={[styles.slotPrice, s.isBooked && { color: '#6b7280' }]}>
                  Rs. {s.rate ? Math.round(s.rate * 70) : 3500}
                </Text>
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
  subtitle: { fontSize: 12, color: '#9ca3af', marginBottom: 14 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13
  },
  filterChip: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  selectedFilterChip: {
    backgroundColor: '#10b981',
    borderColor: '#10b981'
  },
  filterChipText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700'
  },
  selectedFilterChipText: {
    color: '#000',
    fontWeight: '800'
  },
  osmContainer: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)'
  },
  osmTitle: {
    color: '#22d3ee',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8
  },
  osmCard: {
    backgroundColor: '#111827',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6
  },
  osmName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700'
  },
  osmAddress: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 2
  },
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
  sectionHeader: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 4 },
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
