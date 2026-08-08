import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, QrCode, CheckCircle, Zap, ShieldAlert } from 'lucide-react';

export default function BookingModuleView() {
  const [arenas, setArenas] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [bookingSuccessModal, setBookingSuccessModal] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const fetchArenas = async () => {
    try {
      const res = await fetch('/api/bookings/arenas');
      const data = await res.json();
      if (data.success && data.arenas.length > 0) {
        setArenas(data.arenas);
        if (data.arenas[0].courts.length > 0) {
          setSelectedCourt(data.arenas[0].courts[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await fetch('/api/auth/profiles');
      const data = await res.json();
      if (data.success) {
        setAllPlayers(data.profiles);
        if (data.profiles.length > 0) setSelectedUserId(data.profiles[0].user_id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSlots = async () => {
    if (!selectedCourt) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/bookings/slots?court_id=${selectedCourt.id}&date=${selectedDate}`);
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchArenas();
    fetchPlayers();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [selectedCourt, selectedDate]);

  const handleBookSlot = async (slot) => {
    if (slot.isBooked || !selectedCourt || !selectedUserId) return;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          court_id: selectedCourt.id,
          booked_by_user_id: selectedUserId,
          start_time: slot.startTime,
          end_time: slot.endTime,
          payment_status: 'CONFIRMED'
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccessModal(data);
        fetchSlots();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [viewMode, setViewMode] = useState('PLAYER'); // 'PLAYER' or 'OWNER'

  // Owner Arena & Multi-Store Forms State
  const [newArenaName, setNewArenaName] = useState('');
  const [newArenaAddress, setNewArenaAddress] = useState('');
  const [newArenaCity, setNewArenaCity] = useState('Lahore');
  const [newArenaRate, setNewArenaRate] = useState('2500');
  const [selectedFacilities, setSelectedFacilities] = useState(['Artificial Turf', 'AC Lounge', 'Night Floodlights']);

  const [ownerStores, setOwnerStores] = useState([]);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('');

  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('CRICKET_GEAR');
  const [newItemPrice, setNewItemPrice] = useState('3500');
  const [newItemStock, setNewItemStock] = useState('10');

  // Indoor Cricket Dedicated Owner State
  const [cricketPitches, setCricketPitches] = useState([]);
  const [cricketBookings, setCricketBookings] = useState([]);
  const [ownerStats, setOwnerStats] = useState({ totalPitches: 0, totalBookings: 0, totalRevenue: 0, bowlingMachineRentals: 0, checkedInCount: 0 });
  const [selectedPitchForSlot, setSelectedPitchForSlot] = useState('');
  const [pitchGridSlots, setPitchGridSlots] = useState([]);

  // Sub-tab View Toggles
  const [playerSubTab, setPlayerSubTab] = useState('BOOK'); // 'BOOK' or 'HISTORY'
  const [ownerSubTab, setOwnerSubTab] = useState('SETUP');  // 'SETUP' or 'LOGS'

  // Customer Booking History & Filters State
  const [customerHistory, setCustomerHistory] = useState([]);
  const [customerStatusFilter, setCustomerStatusFilter] = useState('ALL');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Owner Audit Logs Filters State
  const [ownerLogStatusFilter, setOwnerLogStatusFilter] = useState('ALL');
  const [ownerLogSearchQuery, setOwnerLogSearchQuery] = useState('');

  // Indoor Cricket Pitch Creation Form State
  const [newPitchName, setNewPitchName] = useState('');
  const [newPitchType, setNewPitchType] = useState('TAPE_BALL');
  const [newPitchLength, setNewPitchLength] = useState('22');
  const [hasBowlingMachine, setHasBowlingMachine] = useState(true);
  const [newPitchRate, setNewPitchRate] = useState('2500');
  const [newPitchPeakRate, setNewPitchPeakRate] = useState('3500');
  const [newPitchMachineFee, setNewPitchMachineFee] = useState('500');

  // Cricket Slot Booking Modal State for Players
  const [includeMachineAddon, setIncludeMachineAddon] = useState(false);
  const [includeEquipmentAddon, setIncludeEquipmentAddon] = useState(false);
  const [bookingTeamName, setBookingTeamName] = useState('Lahore Falcons');

  const facilityOptions = [
    { id: 'Artificial Turf', label: 'Artificial Turf 🌿' },
    { id: 'AC Lounge', label: 'AC Lounge ❄️' },
    { id: 'Night Floodlights', label: 'Night Floodlights 💡' },
    { id: 'Changing Rooms', label: 'Changing Rooms 🚿' },
    { id: 'Live Stream Camera', label: 'Live Stream Camera 🎥' },
    { id: 'Refreshments Canteen', label: 'Refreshments Canteen 🥤' },
    { id: 'Parking', label: 'Parking 🅿️' }
  ];

  const fetchCustomerHistory = async () => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(`/api/bookings/customer/cricket-bookings?user_id=${selectedUserId}&status=${customerStatusFilter}`);
      const data = await res.json();
      if (data.success) {
        setCustomerHistory(data.bookings);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOwnerStores = async () => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(`/api/finance/stores/owner?owner_id=${selectedUserId}`);
      const data = await res.json();
      if (data.success) {
        setOwnerStores(data.stores);
        if (data.stores.length > 0 && !selectedStoreId) setSelectedStoreId(data.stores[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOwnerCricketData = async () => {
    try {
      // Fetch Pitches
      const pitchRes = await fetch(`/api/bookings/owner/cricket-pitches?owner_id=${selectedUserId}`);
      const pitchData = await pitchRes.json();
      if (pitchData.success) {
        setCricketPitches(pitchData.pitches);
        if (pitchData.pitches.length > 0 && !selectedPitchForSlot) {
          setSelectedPitchForSlot(pitchData.pitches[0].id);
        }
      }

      // Fetch Bookings
      const bookRes = await fetch(`/api/bookings/owner/cricket-bookings?owner_id=${selectedUserId}`);
      const bookData = await bookRes.json();
      if (bookData.success) {
        setCricketBookings(bookData.bookings);
      }

      // Fetch Owner Stats
      const statRes = await fetch(`/api/bookings/owner/stats?owner_id=${selectedUserId}`);
      const statData = await statRes.json();
      if (statData.success) {
        setOwnerStats(statData.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveReservation = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings/cricket-bookings/${bookingId}/approve`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        fetchOwnerCricketData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectReservation = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings/cricket-bookings/${bookingId}/reject`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        fetchOwnerCricketData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPitchSlots = async () => {
    if (!selectedPitchForSlot) return;
    try {
      const res = await fetch(`/api/bookings/cricket-pitches/${selectedPitchForSlot}/slots?slot_date=${selectedDate}`);
      const data = await res.json();
      if (data.success) {
        setPitchGridSlots(data.slots);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOwnerStores();
    fetchOwnerCricketData();
    fetchCustomerHistory();

    const selectedUserObj = allPlayers.find(p => p.user_id === selectedUserId);
    if (selectedUserObj && selectedUserObj.role === 'INDOOR_OWNER') {
      setViewMode('OWNER');
    } else if (selectedUserObj && selectedUserObj.role === 'PLAYER') {
      setViewMode('PLAYER');
    }
  }, [selectedUserId, customerStatusFilter, allPlayers]);

  useEffect(() => {
    fetchPitchSlots();
  }, [selectedPitchForSlot, selectedDate]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this indoor cricket match booking? The slot will be released back to OPEN.')) return;
    try {
      const res = await fetch(`/api/bookings/cricket-bookings/${bookingId}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        alert('❌ Booking cancelled successfully and slot released!');
        fetchCustomerHistory();
        fetchOwnerCricketData();
        fetchPitchSlots();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterArena = async (e) => {
    e.preventDefault();
    if (!newArenaName || !newArenaAddress) return;
    try {
      const res = await fetch('/api/bookings/arenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newArenaName,
          address: newArenaAddress,
          city: newArenaCity,
          hourly_rate: parseFloat(newArenaRate) || 2500,
          facilities: selectedFacilities,
          owner_id: selectedUserId,
          courts: [{ court_name: `${newArenaName} Pitch 1`, sport_type: 'CRICKET', hourly_rate: parseFloat(newArenaRate) || 2500 }]
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Indoor Arena & Facilities registered successfully!');
        setNewArenaName('');
        setNewArenaAddress('');
        fetchArenas();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!newStoreName || !newStoreAddress) return;
    try {
      const res = await fetch('/api/finance/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: selectedUserId,
          store_name: newStoreName,
          store_address: newStoreAddress,
          contact_phone: newStorePhone,
          store_type: 'EQUIPMENT_PRO_SHOP'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Equipment Pro-Shop created under your owner profile!');
        setNewStoreName('');
        setNewStoreAddress('');
        setNewStorePhone('');
        fetchOwnerStores();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!selectedStoreId || !newItemName || !newItemPrice) return;
    try {
      const res = await fetch(`/api/finance/stores/${selectedStoreId}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: newItemName,
          category: newItemCategory,
          price: parseFloat(newItemPrice),
          stock_quantity: parseInt(newItemStock) || 0
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`📦 Added ${newItemName} to store inventory!`);
        setNewItemName('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Indoor Cricket Pitch & Slot Handlers
  const handleCreateCricketPitch = async (e) => {
    e.preventDefault();
    if (!arenas.length || !newPitchName) return;
    const targetArenaId = arenas[0].id;
    try {
      const res = await fetch('/api/bookings/cricket-pitches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arena_id: targetArenaId,
          pitch_name: newPitchName,
          pitch_type: newPitchType,
          length_yards: parseInt(newPitchLength) || 22,
          has_bowling_machine: hasBowlingMachine,
          hourly_rate: parseFloat(newPitchRate) || 2500,
          peak_hourly_rate: parseFloat(newPitchPeakRate) || 3500,
          bowling_machine_fee: parseFloat(newPitchMachineFee) || 500
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('🏏 Indoor Cricket Pitch registered successfully!');
        setNewPitchName('');
        fetchOwnerCricketData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGeneratePitchSlots = async () => {
    if (!selectedPitchForSlot) return;
    try {
      const res = await fetch(`/api/bookings/cricket-pitches/${selectedPitchForSlot}/generate-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_date: selectedDate,
          peak_start_hour: 20,
          peak_end_hour: 24
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`⚡ Generated ${data.createdCount} time-slots for ${selectedDate}!`);
        fetchPitchSlots();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookCricketSlot = async (slot) => {
    if (slot.status === 'BOOKED' || !selectedUserId) return;
    try {
      const res = await fetch('/api/bookings/cricket-bookings/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: slot.id,
          booked_by_user_id: selectedUserId,
          team_name: bookingTeamName || 'Lahore Falcons',
          include_bowling_machine: includeMachineAddon,
          include_equipment_kit: includeEquipmentAddon
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccessModal({
          booking: data.booking,
          qrCode: data.qrCodeDataUrl,
          qrPayload: data.qrCodePayload
        });
        fetchPitchSlots();
        fetchOwnerCricketData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/cricket-bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Booking status updated to ${newStatus}`);
        fetchOwnerCricketData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar style={{ color: '#10b981' }} /> Indoor Arenas, Facilities & Court Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Indoor Owner facility registration, multi-store equipment management, and Player court slot bookings.
          </p>
        </div>
        
        {/* Role View Switcher & User Selector */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('PLAYER')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'PLAYER' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: viewMode === 'PLAYER' ? '#10b981' : 'var(--text-muted)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ⚽ Player Booking View
            </button>
            <button
              onClick={() => setViewMode('OWNER')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'OWNER' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: viewMode === 'OWNER' ? '#10b981' : 'var(--text-muted)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🏢 Indoor Owner Dashboard
            </button>
          </div>

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '10px', background: '#111827', border: '1px solid var(--border-color)', color: '#fff' }}
          >
            {allPlayers.map((p) => (
              <option key={p.user_id} value={p.user_id}>User: {p.display_name} ({p.role || 'PLAYER'})</option>
            ))}
          </select>
        </div>
      </div>

      {viewMode === 'OWNER' ? (
        /* INDOOR CRICKET OWNER MANAGEMENT DASHBOARD */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Owner Revenue & Occupancy Stat Cards Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(17, 24, 39, 0.8))' }}>
              <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>🏏 Indoor Pitches</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{ownerStats.totalPitches} Pitches</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tapeball & Bowling Machines</div>
            </div>

            <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(17, 24, 39, 0.8))' }}>
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>🎯 Machine Rentals</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{ownerStats.bowlingMachineRentals} Bookings</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto Bowling Machine Add-ons</div>
            </div>

            <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(17, 24, 39, 0.8))' }}>
              <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>🎟️ Verified Kiosk Check-ins</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{ownerStats.checkedInCount} Teams</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated QR Code Scans</div>
            </div>

            <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.3)', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(17, 24, 39, 0.8))' }}>
              <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>💰 Total Net Revenue</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>PKR {ownerStats.totalRevenue.toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pitch Slots + Add-on Sales</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* 1. Register Indoor Cricket Pitch Form */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏏 Register Indoor Cricket Pitch / Net
              </h3>
              <form onSubmit={handleCreateCricketPitch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pitch / Net Identifier Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Pitch 1 - Speed Machine Lane"
                    value={newPitchName}
                    onChange={(e) => setNewPitchName(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Indoor Pitch Category</label>
                    <select
                      value={newPitchType}
                      onChange={(e) => setNewPitchType(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                    >
                      <option value="TAPE_BALL">🏏 Tapeball Pitch (Net Enclosure)</option>
                      <option value="BOWLING_MACHINE_NET">🎯 Bowling Machine Net Lane</option>
                      <option value="LEATHER_BALL">⚾ Leatherball Turf Pitch</option>
                      <option value="BOX_CRICKET">📦 Box Cricket Arena</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pitch Length (Yards)</label>
                    <input
                      type="number"
                      value={newPitchLength}
                      onChange={(e) => setNewPitchLength(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Day Rate (PKR / Hour)</label>
                    <input
                      type="number"
                      value={newPitchRate}
                      onChange={(e) => setNewPitchRate(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>⚡ Night Peak Rate (PKR / Hour)</label>
                    <input
                      type="number"
                      value={newPitchPeakRate}
                      onChange={(e) => setNewPitchPeakRate(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.5)', background: '#111827', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={hasBowlingMachine}
                      onChange={(e) => setHasBowlingMachine(e.target.checked)}
                    />
                    🎯 Equipped with Automated Bowling Machine
                  </label>

                  {hasBowlingMachine && (
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bowling Machine Hourly Fee (PKR)</label>
                      <input
                        type="number"
                        value={newPitchMachineFee}
                        onChange={(e) => setNewPitchMachineFee(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                      />
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary">🚀 Add Indoor Cricket Pitch</button>
              </form>
            </div>

            {/* 2. Pitch Time-Slot Generator & Grid Controller */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚡ Time-Slot Controller & Peak Surcharge
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Target Cricket Pitch</label>
                  <select
                    value={selectedPitchForSlot}
                    onChange={(e) => setSelectedPitchForSlot(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                  >
                    {cricketPitches.map((p) => (
                      <option key={p.id} value={p.id}>{p.pitch_name} ({p.pitch_type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Schedule Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                  />
                </div>

                <button onClick={handleGeneratePitchSlots} className="btn btn-secondary" style={{ width: '100%', padding: '12px', fontWeight: 800 }}>
                  ⚡ Auto-Generate Hourly Slots (08:00 to 24:00)
                </button>
              </div>

              {/* Slot Schedule List Preview */}
              <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                {pitchGridSlots.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '0.85rem' }}>
                    No slots generated for {selectedDate}. Click button above to populate.
                  </div>
                ) : (
                  pitchGridSlots.map((s) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: s.status === 'BOOKED' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>{s.start_time} - {s.end_time}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {s.is_peak_hour && <span className="badge" style={{ background: '#f59e0b', color: '#000', fontSize: '0.65rem', fontWeight: 800 }}>⚡ PEAK</span>}
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: s.status === 'BOOKED' ? '#f59e0b' : '#10b981' }}>
                          {s.status === 'BOOKED' ? `BOOKED (${s.team_name || 'Team'})` : `PKR ${s.price}`}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 3. Live Match Requests & Kiosk QR Verification Audit Table */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎟️ Match Requests & Automated Kiosk Check-In Audit Logs
              </h3>

              {/* Owner Filters */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search team or pitch..."
                  value={ownerLogSearchQuery}
                  onChange={(e) => setOwnerLogSearchQuery(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', fontSize: '0.85rem' }}
                />

                <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px' }}>
                  {['ALL', 'APPROVED', 'CHECKED_IN', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOwnerLogStatusFilter(st)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: ownerLogStatusFilter === st ? '#10b981' : 'transparent',
                        color: ownerLogStatusFilter === st ? '#000' : 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {cricketBookings.filter(b => (ownerLogStatusFilter === 'ALL' || b.booking_status === ownerLogStatusFilter) && (ownerLogSearchQuery === '' || b.team_name.toLowerCase().includes(ownerLogSearchQuery.toLowerCase()) || b.pitch_name.toLowerCase().includes(ownerLogSearchQuery.toLowerCase()))).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No active match bookings match the current search or status filter.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px' }}>Team Name</th>
                      <th style={{ padding: '10px' }}>Pitch & Type</th>
                      <th style={{ padding: '10px' }}>Match Slot</th>
                      <th style={{ padding: '10px' }}>Add-ons</th>
                      <th style={{ padding: '10px' }}>Total Price</th>
                      <th style={{ padding: '10px' }}>Status</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cricketBookings
                      .filter(b => (ownerLogStatusFilter === 'ALL' || b.booking_status === ownerLogStatusFilter) && (ownerLogSearchQuery === '' || b.team_name.toLowerCase().includes(ownerLogSearchQuery.toLowerCase()) || b.pitch_name.toLowerCase().includes(ownerLogSearchQuery.toLowerCase())))
                      .map((b) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '10px', fontWeight: 700 }}>{b.team_name}</td>
                          <td style={{ padding: '10px' }}>{b.pitch_name} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({b.pitch_type})</span></td>
                          <td style={{ padding: '10px' }}>{b.slot_date} ({b.start_time} - {b.end_time})</td>
                          <td style={{ padding: '10px' }}>
                            {b.include_bowling_machine && <span className="badge" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '0.65rem', marginRight: '4px' }}>🎯 Bowling Machine</span>}
                            {b.include_equipment_kit && <span className="badge" style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6', fontSize: '0.65rem' }}>🏏 Gear Kit</span>}
                          </td>
                          <td style={{ padding: '10px', fontWeight: 800, color: '#10b981' }}>PKR {b.total_price}</td>
                          <td style={{ padding: '10px' }}>
                            <span className="badge" style={{
                              background: b.booking_status === 'CHECKED_IN' ? 'rgba(16,185,129,0.2)' : b.booking_status === 'APPROVED' ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)',
                              color: b.booking_status === 'CHECKED_IN' ? '#10b981' : b.booking_status === 'APPROVED' ? '#3b82f6' : '#ef4444',
                              fontWeight: 800
                            }}>
                              {b.booking_status}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {b.booking_status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApproveReservation(b.id)}
                                  className="btn btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                >
                                  ✅ Accept Request
                                </button>
                                <button
                                  onClick={() => handleRejectReservation(b.id)}
                                  className="btn"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  ❌ Reject
                                </button>
                              </>
                            )}

                            {b.booking_status === 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'CHECKED_IN')}
                                className="btn btn-primary"
                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                              >
                                🎟️ Kiosk Check-In
                              </button>
                            )}
                            {b.booking_status !== 'CANCELLED' && b.booking_status !== 'REJECTED' && (
                              <button
                                onClick={() => handleCancelBooking(b.id)}
                                className="btn"
                                style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                ❌ Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PLAYER COURT BOOKING VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Sub-tab Navigation for Player (Book Slot vs History) */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <button
              onClick={() => setPlayerSubTab('BOOK')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: playerSubTab === 'BOOK' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: playerSubTab === 'BOOK' ? '#10b981' : 'var(--text-muted)',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ⚡ Book Pitch Slot
            </button>

            <button
              onClick={() => setPlayerSubTab('HISTORY')}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: playerSubTab === 'HISTORY' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: playerSubTab === 'HISTORY' ? '#10b981' : 'var(--text-muted)',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📜 My Booking History <span className="badge" style={{ background: '#10b981', color: '#000' }}>{customerHistory.length}</span>
            </button>
          </div>

          {playerSubTab === 'HISTORY' ? (
            /* CUSTOMER BOOKING HISTORY PANEL */
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📜 My Match Booking History & Digital QR Passes
                </h3>

                {/* Status Filter Pills & Search */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Search by team or pitch..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', fontSize: '0.85rem' }}
                  />

                  <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px' }}>
                    {['ALL', 'APPROVED', 'CHECKED_IN', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setCustomerStatusFilter(st)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          background: customerStatusFilter === st ? '#10b981' : 'transparent',
                          color: customerStatusFilter === st ? '#000' : 'var(--text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {customerHistory.filter(b => customerSearchQuery === '' || b.team_name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || b.pitch_name.toLowerCase().includes(customerSearchQuery.toLowerCase())).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No match bookings found for this filter.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {customerHistory.filter(b => customerSearchQuery === '' || b.team_name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || b.pitch_name.toLowerCase().includes(customerSearchQuery.toLowerCase())).map((b) => (
                    <div
                      key={b.id}
                      style={{
                        padding: '18px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        background: 'rgba(17, 24, 39, 0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff' }}>{b.team_name}</span>
                          <span className="badge" style={{
                            background: b.booking_status === 'CHECKED_IN' ? 'rgba(16,185,129,0.2)' : b.booking_status === 'APPROVED' ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)',
                            color: b.booking_status === 'CHECKED_IN' ? '#10b981' : b.booking_status === 'APPROVED' ? '#3b82f6' : '#ef4444',
                            fontWeight: 800
                          }}>
                            {b.booking_status}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 800, marginBottom: '4px' }}>
                          {b.pitch_name} ({b.pitch_type})
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          📍 {b.arena_name} ({b.city})
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#fff', margin: '6px 0', fontWeight: 700 }}>
                          📅 {b.slot_date} | ⏰ {b.start_time} - {b.end_time}
                        </div>

                        {/* Add-ons badges */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {b.include_bowling_machine && <span className="badge" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '0.65rem' }}>🎯 Bowling Machine</span>}
                          {b.include_equipment_kit && <span className="badge" style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6', fontSize: '0.65rem' }}>🏏 Gear Kit</span>}
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Paid Amount</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>PKR {b.total_price}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setBookingSuccessModal({
                              booking: b,
                              qrCode: b.qrCodeDataUrl,
                              qrPayload: b.qr_checkin_code
                            })}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          >
                            🎟️ QR Pass
                          </button>

                          {b.booking_status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="btn"
                              style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', cursor: 'pointer' }}
                            >
                              ❌ Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* PLAYER BOOK PITCH CONFIGURATOR */
            <>

          {/* Player Indoor Cricket Booking Configurator */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏏 Select Indoor Cricket Pitch & Match Setup
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Team Name</label>
                <input
                  type="text"
                  value={bookingTeamName}
                  onChange={(e) => setBookingTeamName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booking Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                />
              </div>
            </div>

            {/* Optional Match Equipment Add-ons */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '10px', display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <label style={{ color: '#fff', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={includeMachineAddon}
                  onChange={(e) => setIncludeMachineAddon(e.target.checked)}
                />
                🎯 Add Automated Bowling Machine (+PKR 500 / hr)
              </label>

              <label style={{ color: '#fff', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={includeEquipmentAddon}
                  onChange={(e) => setIncludeEquipmentAddon(e.target.checked)}
                />
                🏏 Rental Gear Kit (Bats, Gloves, Pads) (+PKR 300)
              </label>
            </div>

            {/* Pitch Selection Cards */}
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Available Indoor Cricket Pitches</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {cricketPitches.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPitchForSlot(p.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: selectedPitchForSlot === p.id ? '2px solid #10b981' : '1px solid var(--border-color)',
                    background: selectedPitchForSlot === p.id ? 'rgba(16, 185, 129, 0.15)' : '#111827',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{p.pitch_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, margin: '4px 0' }}>{p.pitch_type} ({p.length_yards} Yards)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Day: PKR {p.hourly_rate} | Peak: <span style={{ color: '#f59e0b', fontWeight: 700 }}>PKR {p.peak_hourly_rate}</span>
                  </div>
                  {p.has_bowling_machine && (
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '0.65rem', marginTop: '8px', display: 'inline-block' }}>
                      🎯 Bowling Machine
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pitch Slot Schedule Grid for Players */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: '#10b981' }} /> Available Hourly Match Slots ({selectedDate})
            </h3>

            {pitchGridSlots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active time slots generated for this pitch on {selectedDate}.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                {pitchGridSlots.map((slot) => (
                  <div
                    key={slot.id}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border: slot.status === 'BOOKED'
                        ? '1px dashed #374151'
                        : slot.is_peak_hour
                          ? '1px solid rgba(245, 158, 11, 0.4)'
                          : '1px solid var(--border-color)',
                      background: slot.status === 'BOOKED'
                        ? 'rgba(31, 41, 55, 0.4)'
                        : slot.is_peak_hour
                          ? 'rgba(245, 158, 11, 0.08)'
                          : 'rgba(255, 255, 255, 0.03)',
                      opacity: slot.status === 'BOOKED' ? 0.6 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: slot.status === 'BOOKED' ? '#9ca3af' : '#fff' }}>
                        {slot.start_time} - {slot.end_time}
                      </span>
                      {slot.is_peak_hour && slot.status !== 'BOOKED' && (
                        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '0.65rem' }}>
                          <Zap size={10} /> PEAK
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: slot.status === 'BOOKED' ? '#6b7280' : '#10b981' }}>
                        PKR {slot.price}
                      </span>
                      <button
                        disabled={slot.status === 'BOOKED'}
                        onClick={() => handleBookCricketSlot(slot)}
                        className={`btn ${slot.status === 'BOOKED' ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        {slot.status === 'BOOKED' ? 'Reserved' : 'Book Pitch'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Booking Success & QR Code */}
      {bookingSuccessModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', textAlign: 'center' }}>
            <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Booking Confirmed!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Present this QR Code at the indoor court kiosk for automated check-in.
            </p>

            <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '20px' }}>
              <img src={bookingSuccessModal.qrCode} alt="Booking QR Code" style={{ width: '180px', height: '180px' }} />
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '8px', marginBottom: '20px', wordBreak: 'break-all' }}>
              Payload: {bookingSuccessModal.booking.id}
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setBookingSuccessModal(null)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
