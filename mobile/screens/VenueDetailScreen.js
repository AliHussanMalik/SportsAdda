import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function VenueDetailScreen({ onNavigate, onCheckAvailability }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Hero Image Header */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800' }}
            style={styles.heroImage}
          />
          <View style={styles.premiumTag}>
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        </View>

        {/* Venue Information */}
        <View style={styles.detailsBody}>
          <Text style={[styles.title, { color: theme.text }]}>Elite Sports Center</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Text style={{ fontSize: 13, color: theme.primary }}>📍</Text>
            <Text style={[styles.location, { color: theme.subText }]}>123 Athletics Way, Downtown</Text>
          </View>

          {/* Amenities Row */}
          <View style={styles.amenitiesRow}>
            <View style={[styles.amenityChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={{ fontSize: 13 }}>🚿</Text>
              <Text style={[styles.amenityText, { color: theme.text }]}>Showers</Text>
            </View>

            <View style={[styles.amenityChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={{ fontSize: 13 }}>🅿️</Text>
              <Text style={[styles.amenityText, { color: theme.text }]}>Parking</Text>
            </View>

            <View style={[styles.amenityChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={{ fontSize: 13 }}>🎾</Text>
              <Text style={[styles.amenityText, { color: theme.text }]}>Gear Rental</Text>
            </View>
          </View>

          {/* About Section */}
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionHeading, { color: theme.text }]}>About</Text>
            <Text style={[styles.bodyParagraph, { color: theme.subText }]}>
              Experience top-tier athletic facilities designed for both amateur and professional athletes. Our center features FIBA-standard courts, professional-grade lighting, and comprehensive recovery areas to support your peak performance.
            </Text>
          </View>

          {/* Location Map Preview */}
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Location</Text>
              <TouchableOpacity>
                <Text style={{ fontSize: 12, color: theme.primary, fontWeight: '700' }}>Get Directions</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.mapCard, { backgroundColor: theme.surfaceLow, borderColor: theme.border }]}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600' }}
                style={styles.mapBg}
              />
              <View style={[styles.mapPin, { backgroundColor: theme.primary }]}>
                <Text style={{ fontSize: 16 }}>📍</Text>
              </View>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Reviews</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 12, color: '#f59e0b' }}>★</Text>
                <Text style={[styles.ratingScore, { color: theme.text }]}>4.9 <Text style={{ color: theme.subText, fontWeight: '400' }}>(128)</Text></Text>
              </View>
            </View>

            <View style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[styles.reviewerName, { color: theme.text }]}>James F.</Text>
                <Text style={{ fontSize: 11, color: '#f59e0b' }}>★★★★★</Text>
              </View>
              <Text style={[styles.reviewText, { color: theme.subText }]}>
                Incredible courts, very clean facilities. The lighting is perfect for evening games. Will definitely be booking again next week!
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Sticky Bottom Action CTA Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.navBg, borderTopColor: theme.border }]}>
        <View>
          <Text style={[styles.priceNumber, { color: theme.text }]}>$30 <Text style={{ fontSize: 12, color: theme.subText, fontWeight: '400' }}>/ hr</Text></Text>
        </View>

        <TouchableOpacity
          style={[styles.availabilityBtn, { backgroundColor: theme.primary }]}
          onPress={() => onCheckAvailability && onCheckAvailability()}
          activeOpacity={0.8}
        >
          <Text style={styles.availabilityText}>Check Availability</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative'
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  premiumTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#0052ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  premiumText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  detailsBody: {
    padding: 20
  },
  title: {
    fontSize: 22,
    fontWeight: '800'
  },
  location: {
    fontSize: 13
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '700'
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800'
  },
  bodyParagraph: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6
  },
  mapCard: {
    height: 110,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapBg: {
    width: '100%',
    height: '100%',
    opacity: 0.5
  },
  mapPin: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '800'
  },
  reviewCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '800'
  },
  reviewText: {
    fontSize: 12,
    lineHeight: 16
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
  priceNumber: {
    fontSize: 20,
    fontWeight: '800'
  },
  availabilityBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16
  },
  availabilityText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  }
});
