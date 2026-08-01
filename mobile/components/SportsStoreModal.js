import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const STORE_PRODUCTS = [
  { id: '1', name: 'CA Plus 15000 Player Bat 🏏', category: 'CRICKET', price: 24500, desc: 'Professional Grade English Willow Tape-Ball & Leather Bat' },
  { id: '2', name: 'Kookaburra Match Leather Ball 🏏', category: 'CRICKET', price: 1800, desc: 'Official 156g Red Leather Match Ball' },
  { id: '3', name: 'High-Velocity Tapeball 6-Pack ⚡', category: 'CRICKET', price: 950, desc: 'Tournament Grade Heavy Tape Balls' },
  { id: '4', name: 'Nike Indoor Turf Futsal Shoes ⚽', category: 'FUTSAL', price: 8500, desc: 'Non-marking Grip Shoes for Futsal Courts' },
  { id: '5', name: 'Select Super Futsal Ball ⚽', category: 'FUTSAL', price: 3200, desc: 'Low-Bounce Official Size 4 Futsal Ball' },
  { id: '6', name: 'Head Evo Padel Racket 🎾', category: 'PADEL', price: 14000, desc: 'Lightweight Carbon Frame for Maximum Control' },
  { id: '7', name: 'Dunlop Padel Balls 3-Pack 🎾', category: 'PADEL', price: 2100, desc: 'High-Durability Pressurized Padel Balls' },
  { id: '8', name: 'Gatorade Sports Drink 6-Pack 🥤', category: 'REFRESHMENTS', price: 1200, desc: 'Electrolyte Energy Drinks for Turf Matches' }
];

const SPONSORED_ADS = [
  { id: 'ad1', title: '🏟️ Velocity Sports Complex DHA Lahore', desc: 'Book 2 Hours Night Slot & Get FREE Match Balls + 20% OFF Gatorade Packs!', code: 'VELOCITY20' },
  { id: 'ad2', title: '🎾 DHA Padel Club Gulberg', desc: 'Weekend Tournament Registration Open! Winner Takes Rs. 50,000 Cash Prize!', code: 'PADELKING' }
];

export default function SportsStoreModal({ visible, onClose }) {
  const { theme } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    Alert.alert('🛒 Added to Delivery Cart', `${product.name} added!`);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Cart Empty', 'Please add sports items to your cart first.');
      return;
    }
    Alert.alert(
      '📦 Order Confirmed for Delivery!',
      `Total: Rs. ${totalAmount.toLocaleString()}\nDelivery Address: ${deliveryAddress || 'Selected Turf / Home Address'}\nEstimated Express Delivery Time: 45 Minutes!`,
      [
        {
          text: 'OK',
          onPress: () => {
            setCart([]);
            onClose();
          }
        }
      ]
    );
  };

  const filteredProducts = STORE_PRODUCTS.filter(
    (p) => selectedCategory === 'ALL' || p.category === selectedCategory
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.bg, borderColor: theme.accent }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>🛒 Sports Store & Turf Delivery</Text>
              <Text style={[styles.subtitle, { color: theme.subText }]}>
                Order bats, balls, shoes & drinks delivered to your home or turf
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.closeBtnText, { color: theme.subText }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Sponsored Sports Center Ads Carousel */}
            <Text style={[styles.sectionLabel, { color: theme.accent }]}>📢 Sponsored Sports Center Offers:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {SPONSORED_ADS.map((ad) => (
                <View key={ad.id} style={[styles.adCard, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
                  <View style={styles.adHeader}>
                    <Text style={[styles.adTitle, { color: theme.text }]}>{ad.title}</Text>
                    <View style={[styles.adTag, { backgroundColor: theme.badgeBg }]}>
                      <Text style={[styles.adTagText, { color: theme.accent }]}>SPONSORED AD</Text>
                    </View>
                  </View>
                  <Text style={[styles.adDesc, { color: theme.subText }]}>{ad.desc}</Text>
                  <TouchableOpacity
                    style={[styles.claimBtn, { backgroundColor: theme.accent }]}
                    onPress={() => Alert.alert('Promo Claimed! 🎁', `Use promo code [${ad.code}] at venue checkout for discount.`)}
                  >
                    <Text style={styles.claimBtnText}>🎁 Claim Coupon [{ad.code}]</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Category Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {['ALL', 'CRICKET', 'FUTSAL', 'PADEL', 'REFRESHMENTS'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    { backgroundColor: theme.cardBg, borderColor: theme.border },
                    selectedCategory === cat && { backgroundColor: theme.accent, borderColor: theme.accent }
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.catChipText, { color: selectedCategory === cat ? '#000' : theme.subText }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Product Catalog */}
            {filteredProducts.map((p) => (
              <View key={p.id} style={[styles.productCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.productName, { color: theme.text }]}>{p.name}</Text>
                  <Text style={[styles.productDesc, { color: theme.subText }]}>{p.desc}</Text>
                  <Text style={[styles.productPrice, { color: theme.accent }]}>Rs. {p.price.toLocaleString()}</Text>
                </View>

                <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.accent }]} onPress={() => addToCart(p)}>
                  <Text style={styles.addBtnText}>+ Add to Cart</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Cart & Delivery Section */}
            {cart.length > 0 && (
              <View style={[styles.cartBox, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}>
                <Text style={[styles.cartTitle, { color: theme.text }]}>🛒 Delivery Checkout Cart ({cart.length} Items)</Text>

                {cart.map((item) => (
                  <View key={item.id} style={styles.cartRow}>
                    <Text style={[styles.cartItemName, { color: theme.text }]}>
                      {item.name} x{item.qty}
                    </Text>
                    <Text style={[styles.cartItemPrice, { color: theme.accent }]}>
                      Rs. {(item.price * item.qty).toLocaleString()}
                    </Text>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: theme.text }]}>Total Delivery Amount:</Text>
                  <Text style={[styles.totalVal, { color: theme.accent }]}>Rs. {totalAmount.toLocaleString()}</Text>
                </View>

                <TextInput
                  style={[styles.addressInput, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]}
                  placeholder="Enter Turf Ground or Home Delivery Address (e.g. DHA Lahore / F-7 Islamabad)"
                  placeholderTextColor={theme.subText}
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                />

                <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: theme.accent }]} onPress={handleCheckout}>
                  <Text style={styles.checkoutBtnText}>🚀 Confirm Online Delivery Order</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
    borderWidth: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  title: { fontSize: 18, fontWeight: '900' },
  subtitle: { fontSize: 11, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 16, fontWeight: 'bold' },
  sectionLabel: { fontSize: 13, fontWeight: '800', marginBottom: 8 },
  adCard: {
    width: 280,
    borderRadius: 14,
    padding: 14,
    marginRight: 10,
    borderWidth: 1
  },
  adHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  adTitle: { fontSize: 13, fontWeight: '800', flex: 1, marginRight: 6 },
  adTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  adTagText: { fontSize: 9, fontWeight: '800' },
  adDesc: { fontSize: 11, marginBottom: 10 },
  claimBtn: { paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  claimBtnText: { color: '#000', fontWeight: '800', fontSize: 11 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1 },
  catChipText: { fontSize: 11, fontWeight: '800' },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1
  },
  productName: { fontSize: 14, fontWeight: '800' },
  productDesc: { fontSize: 11, marginVertical: 3 },
  productPrice: { fontSize: 13, fontWeight: '900' },
  addBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#000', fontWeight: '800', fontSize: 12 },
  cartBox: { marginTop: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
  cartTitle: { fontSize: 15, fontWeight: '900', marginBottom: 10 },
  cartRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cartItemName: { fontSize: 12, fontWeight: '700' },
  cartItemPrice: { fontSize: 12, fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  totalLabel: { fontSize: 14, fontWeight: '800' },
  totalVal: { fontSize: 16, fontWeight: '900' },
  addressInput: { borderRadius: 10, padding: 10, fontSize: 12, borderWidth: 1, marginVertical: 12 },
  checkoutBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  checkoutBtnText: { color: '#000', fontWeight: '900', fontSize: 13 }
});
