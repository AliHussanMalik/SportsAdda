import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

import { API_BASE } from '../config';

// Placeholder images for sports (replace with local assets if available)
const badmintonImg = 'https://images.unsplash.com/photo-1526406915895-71e9fdfb5b13?auto=format&fit=crop&w=600&q=80';
const futsalImg = 'https://images.unsplash.com/photo-1589395591255-0f1a5c4fdf73?auto=format&fit=crop&w=600&q=80';
const basketballImg = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80';
const cricketImg = 'https://images.unsplash.com/photo-1517960413843-0aee8a1907c5?auto=format&fit=crop&w=600&q=80';

export default function HomeScreen({ onNavigate }) {
  // Fallback indoor venues (used if API does not return these sports)
  const pakistaniSpecializedVenues = [
    {
      id: 'pk-shooting-1',
      name: 'Lahore Garrison Shooting Gallery',
      price: 'PKR 4,500/hr',
      rating: '4.9',
      location: 'DHA Phase 8, Sector C',
      category: 'Shooting Range',
      sport_type: 'SHOOTING',
      type: 'Tactical Indoor',
      image: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'pk-archery-1',
      name: 'Lahore Archery Club',
      price: 'PKR 2,200/hr',
      rating: '4.7',
      location: 'Main Boulevard, Gulberg III',
      category: 'Archery Arena',
      sport_type: 'ARCHERY',
      type: 'Indoor Target',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'pk-riding-1',
      name: 'Garrison Equestrian & Riding Stables',
      price: 'PKR 3,500/hr',
      rating: '4.9',
      location: 'Sarfraz Rafiqui Road, Cantt Lahore',
      category: 'Horse Riding',
      sport_type: 'HORSE_RIDING',
      type: 'Covered Ring',
      image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80',
    },
  ];
  const categories = [
    { key: 'Badminton', icon: '🎾' },
    { key: 'Futsal', icon: '⚽' },
    { key: 'Basketball', icon: '🏀' },
    { key: 'Archery', icon: '🎯' },
    { key: 'Shooting', icon: '🔫' },
    { key: 'Horse Riding', icon: '🐎' },
    { key: 'More', icon: '⋯' },
  ];
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('Badminton');
  const [dbVenues, setDbVenues] = useState([]);

  // Build a unified list of venues: API data + fallback indoor venues
  const allAvailableVenues = dbVenues.length > 0
    ? dbVenues
        .map((a, idx) => {
          const sport = a.courts?.[0]?.sport_type?.toUpperCase() || 'CRICKET';
          let img = a.image_url;
          if (!img) {
            if (sport === 'BADMINTON') img = badmintonImg;
            else if (sport === 'FUTSAL') img = futsalImg;
            else if (sport === 'BASKETBALL') img = basketballImg;
            else if (sport === 'SHOOTING')
              img = 'file:///C:/Users/Ali%20Hussan/.gemini/antigravity-ide/brain/d9c9e035-b1da-43a0-95db-eaf1949a0340/shooting_range_indoor_1788120514691.jpg';
            else if (sport === 'ARCHERY')
              img = 'file:///C:/Users/Ali%20Hussan/.gemini/antigravity-ide/brain/d9c9e035-b1da-43a0-95db-eaf1949a0340/archery_range_indoor_1788120545777.jpg';
            else if (sport === 'HORSE_RIDING')
              img = 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80';
            else img = idx % 2 === 0 ? cricketImg : futsalImg;
          }
          return {
            id: a.id,
            name: a.name,
            price: `PKR ${a.hourly_rate || 2500}/hr`,
            rating: a.avg_rating || '4.8',
            location: a.address || a.city || 'Lahore',
            category: sport,
            sport_type: sport,
            type: 'Indoor',
            image: img,
          };
        })
        .concat(pakistaniSpecializedVenues.filter(p => !dbVenues.some(d => d.name === p.name)))
    : pakistaniSpecializedVenues;

  const filteredDbVenues = selectedCategory === 'More' ? allAvailableVenues : allAvailableVenues.filter(v => v.sport_type === selectedCategory.toUpperCase());

  React.useEffect(() => {
    async function loadArenas() {
      try {
        const res = await fetch(`${API_BASE}/bookings/arenas`);
        const data = await res.json();
        if (data.success && Array.isArray(data.arenas) && data.arenas.length > 0) {
          setDbVenues(data.arenas);
        }
      } catch (err) {
        console.warn('Mobile API arenas fetch error:', err);
      }
    }
    loadArenas();
  }, []);

  const defaultTrending = [
    {
      id: 1,
      name: 'Apex Stadium',
      price: '$25/hr',
      rating: '4.8',
      location: 'Downtown District',
      category: 'Badminton',
      type: 'Indoor',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 2,
      name: 'The Pitch Arena',
      price: '$40/hr',
      rating: '4.6',
      location: 'Westside Industrial',
      category: 'Futsal',
      type: 'Indoor',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=600'
    }
  ];

  const defaultRecommended = [
    {
      id: 101,
      name: 'Elite Hoops Center',
      rating: '4.9',
      category: 'Basketball • Indoor',
      status: 'Available Today',
      price: '$30',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600'
    },
  ];
  const trendingVenues = filteredDbVenues.length > 0
    ? filteredDbVenues.slice(0, 2).map((a, idx) => ({
        id: a.id,
        name: a.name,
        price: `PKR ${a.hourly_rate || 2500}/hr`,
        rating: a.avg_rating || '4.8',
        location: a.address || a.city || 'Lahore',
        category: a.courts?.[0]?.sport_type || 'Cricket',
        type: 'Indoor',
        image: a.image_url || (idx % 2 === 0 ? 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600' : 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=600')
      }))
    : defaultTrending;

  const recommendedVenues = filteredDbVenues.length > 2
    ? filteredDbVenues.slice(2, 4).map((a, idx) => ({
        id: a.id,
        name: a.name,
        rating: a.avg_rating || '4.7',
        category: `${a.courts?.[0]?.sport_type || 'Indoor'} • Arena`,
        status: 'Available Today',
        price: `PKR ${a.hourly_rate || 2500}`,
        image: a.image_url || (idx % 2 === 0 ? 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600' : 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=600')
      }))
    : defaultRecommended;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Hero Welcome Section */}
      <View style={styles.heroSection}>
        <View>
          <Text style={[styles.headline, { color: theme.text }]}>Find Your Game</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>Book venues instantly</Text>
        </View>
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: theme.surfaceLow }]}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesRow}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryCard, selectedCategory === cat.key && { backgroundColor: theme.primary }]}
            onPress={() => setSelectedCategory(cat.key)}>
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[styles.categoryLabel, { color: selectedCategory === cat.key ? '#ffffff' : theme.subText }]}>{cat.key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trending Venues Horizontal Slider */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Trending Venues</Text>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('venue_detail')}>
            <Text style={[styles.seeAll, { color: theme.primary }]}>See all →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
          {trendingVenues.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[styles.trendingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => onNavigate && onNavigate('venue_detail')}
              activeOpacity={0.9}
            >
              <View style={styles.cardImageWrapper}>
                <Image source={{ uri: v.image }} style={styles.cardImage} />
                <View style={styles.ratingBadge}>
                  <Text style={{ fontSize: 11, color: '#f59e0b' }}>★</Text>
                  <Text style={styles.ratingText}>{v.rating}</Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.venueName, { color: theme.text }]}>{v.name}</Text>
                  <Text style={[styles.priceTag, { color: theme.primary }]}>{v.price}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Text style={{ fontSize: 12 }}>📍</Text>
                  <Text style={[styles.locationText, { color: theme.subText }]}>{v.location}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                  <View style={[styles.tagPill, { backgroundColor: theme.surfaceLow }]}>
                    <Text style={[styles.tagText, { color: theme.subText }]}>{v.category}</Text>
                  </View>
                  <View style={[styles.tagPill, { backgroundColor: theme.surfaceLow }]}>
                    <Text style={[styles.tagText, { color: theme.subText }]}>{v.type}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recommended For You Section */}
      <View style={[styles.sectionContainer, { marginTop: 24, paddingHorizontal: 20 }]}>
        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 14 }]}>Recommended for You</Text>

        <View style={{ gap: 12 }}>
          {recommendedVenues.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[styles.recommendedCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => onNavigate && onNavigate('venue_detail')}
              activeOpacity={0.9}
            >
              <Image source={{ uri: v.image }} style={styles.recImage} />
              <View style={{ flex: 1, paddingVertical: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.recName, { color: theme.text }]}>{v.name}</Text>
                  <View style={[styles.miniRating, { backgroundColor: theme.surfaceLow }]}>
                    <Text style={{ fontSize: 10, color: '#f59e0b' }}>★</Text>
                    <Text style={[styles.miniRatingText, { color: theme.text }]}>{v.rating}</Text>
                  </View>
                </View>

                <Text style={[styles.recCategory, { color: theme.subText }]}>{v.category}</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <View style={[styles.statusBadge, { backgroundColor: theme.badgeBg }]}>
                    <Text style={[styles.statusText, { color: theme.primary }]}>{v.status}</Text>
                  </View>
                  <Text style={[styles.recPrice, { color: theme.text }]}>
                    {v.price}<Text style={{ fontSize: 11, color: theme.subText, fontWeight: '400' }}>/hr</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  heroSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2
  },
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 24
  },
  categoryCard: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 4
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700'
  },
  sectionContainer: {
    marginBottom: 8
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '700'
  },
  trendingCard: {
    width: 250,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden'
  },
  cardImageWrapper: {
    height: 140,
    width: '100%',
    position: 'relative'
  },
  cardImage: {
    width: '100%',
    height: '100%'
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#131b2e'
  },
  cardInfo: {
    padding: 14
  },
  venueName: {
    fontSize: 15,
    fontWeight: '800'
  },
  priceTag: {
    fontSize: 13,
    fontWeight: '800'
  },
  locationText: {
    fontSize: 12
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  recommendedCard: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center'
  },
  recImage: {
    width: 76,
    height: 76,
    borderRadius: 14
  },
  recName: {
    fontSize: 15,
    fontWeight: '800'
  },
  miniRating: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2
  },
  miniRatingText: {
    fontSize: 10,
    fontWeight: '800'
  },
  recCategory: {
    fontSize: 12,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  recPrice: {
    fontSize: 14,
    fontWeight: '800'
  }
});
