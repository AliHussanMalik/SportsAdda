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
  const [arenas, setArenas] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View Mode: 'BOOKING' (Existing registered view) or 'EXPLORE_ALL' (Registered + All Map Grounds with Directions & Distance)
  const [viewMode, setViewMode] = useState('BOOKING');

  // Location & Search State
  const [selectedCity, setSelectedCity] = useState(PAKISTAN_CITIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [osmResults, setOsmResults] = useState([]);
  const [searchingOsm, setSearchingOsm] = useState(false);

  // Haversine Distance Formula (calculates distance in km between 2 lat/lng points)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return '1.5';
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Launch Turn-by-Turn Directions in Google Maps
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
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Title & Mode Switcher */}
      <Text style={styles.title}>🏟️ Pakistan Venues & Turfs</Text>
      <Text style={styles.subtitle}>Book registered indoor courts or explore all grounds on Google Maps</Text>

      {/* Mode Switcher Tabs */}
      <View style={styles.modeToggleRow}>
        <TouchableOpacity
          style={[styles.modeTab, viewMode === 'BOOKING' && styles.activeModeTab]}
          onPress={() => setViewMode('BOOKING')}
        >
          <Text style={[styles.modeTabText, viewMode === 'BOOKING' && styles.activeModeTabText]}>
            📅 Instant Booking Courts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, viewMode === 'EXPLORE_ALL' && styles.activeModeTab]}
          onPress={() => setViewMode('EXPLORE_ALL')}
        >
          <Text style={[styles.modeTabText, viewMode === 'EXPLORE_ALL' && styles.activeModeTabText]}>
            🗺️ Explore All Grounds & Maps
          </Text>
        </TouchableOpacity>
      </View>

      {/* City Selector */}
      <Text style={styles.sectionHeader}>Select Region in Pakistan:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {PAKISTAN_CITIES.map((c) => (
          <TouchableOpacity
            key={c.name}
            style={[styles.cityChip, selectedCity.name === c.name && styles.selectedCityChip]}
            onPress={() => {
              setSelectedCity(c);
              searchOsmPakistan(searchQuery, c.name);
            }}
          >
            <Text style={[styles.cityChipText, selectedCity.name === c.name && styles.selectedCityChipText]}>
              📍 {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search Input Bar */}
      <View style={styles.searchBox}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by turf name, area (DHA, Gulberg) or ground type"
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={(txt) => {
            setSearchQuery(txt);
            searchOsmPakistan(txt, selectedCity.name);
          }}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={{ color: '#9ca3af', fontSize: 16, paddingHorizontal: 6 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Mode 1: Instant Booking View (Original intact) */}
      {viewMode === 'BOOKING' ? (
        <View>
          {/* Registered Courts Selector */}
          <Text style={styles.sectionHeader}>Registered SportsAdda Courts</Text>
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
        </View>
      ) : (
        /* Mode 2: ALL Courts & Grounds (Registered + Map Venues with Distance & Google Maps Directions) */
        <View>
          <Text style={styles.sectionHeader}>All Venues & Turfs Near {selectedCity.name}</Text>
          {searchingOsm && <ActivityIndicator color="#06b6d4" style={{ marginBottom: 12 }} />}

          {/* Registered SportsAdda Venues Card */}
          {allCourts.map((c) => {
            const dist = calculateDistance(selectedCity.lat, selectedCity.lng, c.latitude, c.longitude);
            return (
              <View key={c.id} style={[styles.allVenueCard, styles.partnerCard]}>
                <View style={styles.venueHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.badgeRow}>
                      <View style={styles.partnerBadge}>
                        <Text style={styles.partnerBadgeText}>✅ PARTNER (INSTANT BOOK)</Text>
                      </View>
                      <Text style={styles.distText}>📏 {dist} km away</Text>
                    </View>
                    <Text style={styles.venueName}>{c.court_name}</Text>
                    <Text style={styles.venueAddress}>{c.arenaName} • {c.arenaAddress}</Text>
                  </View>
                </View>

                <View style={styles.venueActionRow}>
                  <Text style={styles.venueRateText}>Rs. {c.hourly_rate * 70}/hr</Text>
                  <TouchableOpacity
                    style={styles.directionsBtn}
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
              <View key={item.place_id} style={styles.allVenueCard}>
                <View style={styles.venueHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.badgeRow}>
                      <View style={styles.openGroundBadge}>
                        <Text style={styles.openGroundBadgeText}>🌐 MAP VENUE / OPEN GROUND</Text>
                      </View>
                      <Text style={styles.distText}>📏 {dist} km away</Text>
                    </View>
                    <Text style={styles.venueName}>{titleName}</Text>
                    <Text style={styles.venueAddress} numberOfLines={2}>{item.display_name}</Text>
                  </View>
                </View>

                <View style={styles.venueActionRow}>
                  <Text style={{ color: '#9ca3af', fontSize: 11, fontWeight: '600' }}>Open Public Arena</Text>
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
  container: { flex: 1, backgroundColor: '#090d16' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 12, color: '#9ca3af', marginBottom: 14 },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  activeModeTab: {
    backgroundColor: '#10b981'
  },
  modeTabText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700'
  },
  activeModeTabText: {
    color: '#000',
    fontWeight: '800'
  },
  cityChip: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  selectedCityChip: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4'
  },
  cityChipText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '700'
  },
  selectedCityChipText: {
    color: '#06b6d4',
    fontWeight: '800'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13
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
  retryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  allVenueCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  partnerCard: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)'
  },
  venueHeader: {
    marginBottom: 10
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  partnerBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  partnerBadgeText: {
    color: '#10b981',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '800'
  },
  venueAddress: {
    color: '#9ca3af',
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
    color: '#10b981',
    fontWeight: '800',
    fontSize: 14
  },
  directionsBtn: {
    backgroundColor: '#10b981',
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
