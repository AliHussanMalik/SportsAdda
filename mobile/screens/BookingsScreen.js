import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Linking
} from 'react-native';
import { API_BASE } from '../config';
import { useTheme } from '../context/ThemeContext';

// Major Pakistan Cities with Coordinates for Distance Calculation
const PAKISTAN_CITIES = [
  { name: 'Lahore (DHA/Gulberg)', lat: 31.4720, lng: 74.4080 },
  { name: 'Karachi (Clifton/DHA)', lat: 24.8607, lng: 67.0011 },
  { name: 'Islamabad (F-7/G-11)', lat: 33.6844, lng: 73.0479 },
  { name: 'Rawalpindi (Bahria Town)', lat: 33.5651, lng: 73.0169 },
  { name: 'Faisalabad', lat: 31.4504, lng: 73.1350 },
  { name: 'Multan', lat: 30.1575, lng: 71.5249 },
  { name: 'Peshawar', lat: 34.0151, lng: 71.5249 }
];

export default function BookingsScreen() {
  const { theme } = useTheme();

  const [arenas, setArenas] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View Mode: 'BOOKING' or 'EXPLORE_ALL'
  const [viewMode, setViewMode] = useState('BOOKING');

  // Location & Search State
  const [selectedCity, setSelectedCity] = useState(PAKISTAN_CITIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [osmResults, setOsmResults] = useState([]);
  const [searchingOsm, setSearchingOsm] = useState(false);

  // Haversine Distance Formula (calculates distance in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return '1.5';
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Launch Directions in Google Maps
  const openGoogleMapsDirections = (lat, lng, name) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open Google Maps app.');
    });
  };

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
        setError('No registered indoor venues found');
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

  const searchOsmPakistan = async (query, city = selectedCity.name) => {
    setSearchingOsm(true);
    try {
      const searchTerm = query ? `${query} sports center Pakistan` : `indoor sports arena ${city} Pakistan`;
      const q = encodeURIComponent(searchTerm);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=6`, {
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
    searchOsmPakistan('', selectedCity.name);
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

  const allCourts = arenas.flatMap((a) =>
    a.courts.map((c) => ({
      ...c,
      arenaName: a.name,
      arenaAddress: a.address,
      latitude: a.latitude || selectedCity.lat,
      longitude: a.longitude || selectedCity.lng,
      isRegistered: true
    }))
  );

  const filteredCourts = allCourts.filter((c) => {
    const matchesQuery =
      c.court_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.arenaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.arenaAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'ALL' || c.sport_type === selectedSport;
    return matchesQuery && matchesSport;
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ padding: 16 }}>
      {/* Title & Mode Switcher */}
      <Text style={[styles.title, { color: theme.text }]}>🏟️ Pakistan Venues & Turfs</Text>
      <Text style={[styles.subtitle, { color: theme.subText }]}>Book registered indoor courts or explore all grounds on Google Maps</Text>

      {/* Mode Switcher Tabs */}
      <View style={[styles.modeToggleRow, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.modeTab, viewMode === 'BOOKING' && { backgroundColor: theme.accent }]}
          onPress={() => setViewMode('BOOKING')}
        >
          <Text style={[styles.modeTabText, { color: theme.subText }, viewMode === 'BOOKING' && { color: '#000', fontWeight: '800' }]}>
            📅 Instant Booking Courts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, viewMode === 'EXPLORE_ALL' && { backgroundColor: theme.accent }]}
          onPress={() => setViewMode('EXPLORE_ALL')}
        >
          <Text style={[styles.modeTabText, { color: theme.subText }, viewMode === 'EXPLORE_ALL' && { color: '#000', fontWeight: '800' }]}>
            MAP Grounds & Directions
          </Text>
        </TouchableOpacity>
      </View>

      {/* City Selector */}
      <Text style={[styles.sectionHeader, { color: theme.text }]}>Select Region in Pakistan:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {PAKISTAN_CITIES.map((c) => (
          <TouchableOpacity
            key={c.name}
            style={[
              styles.cityChip,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
              selectedCity.name === c.name && { backgroundColor: theme.badgeBg, borderColor: theme.accent }
            ]}
            onPress={() => {
              setSelectedCity(c);
              searchOsmPakistan(searchQuery, c.name);
            }}
          >
            <Text style={[styles.cityChipText, { color: theme.subText }, selectedCity.name === c.name && { color: theme.accent, fontWeight: '800' }]}>
              📍 {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search Input Bar */}
      <View style={[styles.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.inputText }]}
          placeholder="Search by turf name, area (DHA, Gulberg) or ground type"
          placeholderTextColor={theme.subText}
          value={searchQuery}
          onChangeText={(txt) => {
            setSearchQuery(txt);
            searchOsmPakistan(txt, selectedCity.name);
          }}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={{ color: theme.subText, fontSize: 16, paddingHorizontal: 6 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Mode 1: Instant Booking View (Original intact) */}
      {viewMode === 'BOOKING' ? (
        <View>
          {/* Registered Courts Selector */}
          <Text style={[styles.sectionHeader, { color: theme.text }]}>Registered SportsAdda Courts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {filteredCourts.map((court) => (
              <TouchableOpacity
                key={court.id}
                style={[
                  styles.courtChip,
                  { backgroundColor: theme.cardBg, borderColor: theme.border },
                  selectedCourt?.id === court.id && { borderColor: theme.accent, backgroundColor: theme.badgeBg }
                ]}
                onPress={() => setSelectedCourt(court)}
              >
                <Text style={{ fontSize: 18, marginRight: 6 }}>
                  {court.sport_type === 'CRICKET' ? '🏏' : court.sport_type === 'PADEL' ? '🎾' : '⚽'}
                </Text>
                <View>
                  <Text style={[styles.courtName, { color: theme.text }]}>{court.court_name}</Text>
                  <Text style={[styles.courtRate, { color: theme.accent }]}>Rs. {court.hourly_rate * 70}/hr</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Slots Grid */}
          <Text style={[styles.sectionHeader, { color: theme.text }]}>
            Hourly Slots for {selectedCourt ? selectedCourt.court_name : 'Selected Court'}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 20 }} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.accent }]} onPress={fetchArenas}>
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
                    { backgroundColor: theme.cardBg, borderColor: theme.border },
                    s.isBooked && styles.bookedSlot,
                    s.isPeak && !s.isBooked && styles.peakSlot
                  ]}
                  onPress={() => handleBookSlot(s)}
                >
                  <Text style={[styles.slotTime, { color: theme.text }, s.isBooked && { color: theme.subText }]}>
                    {s.timeLabel}
                  </Text>
                  <View style={styles.slotFooter}>
                    <Text style={[styles.slotPrice, { color: theme.accent }, s.isBooked && { color: theme.subText }]}>
                      Rs. {s.rate ? Math.round(s.rate * 70) : 3500}
                    </Text>
                    {s.isPeak && !s.isBooked && <Text style={styles.peakLabel}>⚡ PEAK</Text>}
                    {s.isBooked && <Text style={{ fontSize: 10, color: theme.subText, fontWeight: 'bold' }}>RESERVED</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ) : (
        /* Mode 2: ALL Courts & Grounds */
        <View>
          <Text style={[styles.sectionHeader, { color: theme.text }]}>All Venues & Turfs Near {selectedCity.name}</Text>
          {searchingOsm && <ActivityIndicator color={theme.accent} style={{ marginBottom: 12 }} />}

          {/* Registered SportsAdda Venues Card */}
          {allCourts.map((c) => {
            const dist = calculateDistance(selectedCity.lat, selectedCity.lng, c.latitude, c.longitude);
            return (
              <View key={c.id} style={[styles.allVenueCard, styles.partnerCard, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
                <View style={styles.venueHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.partnerBadge, { backgroundColor: theme.badgeBg }]}>
                        <Text style={[styles.partnerBadgeText, { color: theme.accent }]}>✅ PARTNER (INSTANT BOOK)</Text>
                      </View>
                      <Text style={styles.distText}>📏 {dist} km away</Text>
                    </View>
                    <Text style={[styles.venueName, { color: theme.text }]}>{c.court_name}</Text>
                    <Text style={[styles.venueAddress, { color: theme.subText }]}>{c.arenaName} • {c.arenaAddress}</Text>
                  </View>
                </View>

                <View style={styles.venueActionRow}>
                  <Text style={[styles.venueRateText, { color: theme.accent }]}>Rs. {c.hourly_rate * 70}/hr</Text>
                  <TouchableOpacity
                    style={[styles.directionsBtn, { backgroundColor: theme.accent }]}
                    onPress={() => openGoogleMapsDirections(c.latitude, c.longitude, c.court_name)}
                  >
                    <Text style={styles.directionsBtnText}>🧭 Google Maps Route</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* OpenMap Grounds / Non-Registered Public Turfs */}
          {osmResults.map((item) => {
            const itemLat = parseFloat(item.lat);
            const itemLng = parseFloat(item.lon);
            const dist = calculateDistance(selectedCity.lat, selectedCity.lng, itemLat, itemLng);
            const titleName = item.name || item.display_name.split(',')[0];

            return (
              <View key={item.place_id} style={[styles.allVenueCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <View style={styles.venueHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.badgeRow}>
                      <View style={styles.openGroundBadge}>
                        <Text style={styles.openGroundBadgeText}>🌐 MAP VENUE / OPEN GROUND</Text>
                      </View>
                      <Text style={styles.distText}>📏 {dist} km away</Text>
                    </View>
                    <Text style={[styles.venueName, { color: theme.text }]}>{titleName}</Text>
                    <Text style={[styles.venueAddress, { color: theme.subText }]} numberOfLines={2}>{item.display_name}</Text>
                  </View>
                </View>

                <View style={styles.venueActionRow}>
                  <Text style={{ color: theme.subText, fontSize: 11, fontWeight: '600' }}>Open Public Arena</Text>
                  <TouchableOpacity
                    style={[styles.directionsBtn, { backgroundColor: '#06b6d4' }]}
                    onPress={() => openGoogleMapsDirections(itemLat, itemLng, titleName)}
                  >
                    <Text style={[styles.directionsBtnText, { color: '#000' }]}>🧭 Google Maps Route</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 12, marginBottom: 14 },
  modeToggleRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700'
  },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1
  },
  cityChipText: {
    fontSize: 11,
    fontWeight: '700'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1
  },
  searchInput: {
    flex: 1,
    fontSize: 13
  },
  courtChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1
  },
  courtName: { fontSize: 13, fontWeight: '700' },
  courtRate: { fontSize: 11, fontWeight: '600' },
  sectionHeader: { fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 4 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotCard: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1
  },
  bookedSlot: { opacity: 0.5 },
  peakSlot: { borderColor: 'rgba(245,158,11,0.5)', backgroundColor: 'rgba(245,158,11,0.08)' },
  slotTime: { fontSize: 14, fontWeight: '800' },
  slotFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  slotPrice: { fontWeight: '800', fontSize: 13 },
  peakLabel: { color: '#f59e0b', fontSize: 9, fontWeight: '900' },
  errorContainer: { alignItems: 'center', marginTop: 30, padding: 16 },
  errorText: { color: '#ef4444', fontSize: 14, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  allVenueCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1
  },
  partnerCard: {},
  venueHeader: { marginBottom: 10 },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  partnerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  partnerBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  openGroundBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  openGroundBadgeText: {
    color: '#22d3ee',
    fontSize: 10,
    fontWeight: '800'
  },
  distText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '700'
  },
  venueName: {
    fontSize: 16,
    fontWeight: '800'
  },
  venueAddress: {
    fontSize: 11,
    marginTop: 2
  },
  venueActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
    marginTop: 4
  },
  venueRateText: {
    fontWeight: '800',
    fontSize: 14
  },
  directionsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  directionsBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 12
  }
});
