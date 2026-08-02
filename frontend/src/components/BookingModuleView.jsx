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

  const facilityOptions = [
    { id: 'Artificial Turf', label: 'Artificial Turf 🌿' },
    { id: 'AC Lounge', label: 'AC Lounge ❄️' },
    { id: 'Night Floodlights', label: 'Night Floodlights 💡' },
    { id: 'Changing Rooms', label: 'Changing Rooms 🚿' },
    { id: 'Live Stream Camera', label: 'Live Stream Camera 🎥' },
    { id: 'Refreshments Canteen', label: 'Refreshments Canteen 🥤' },
    { id: 'Parking', label: 'Parking 🅿️' }
  ];

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

  useEffect(() => {
    fetchOwnerStores();
  }, [selectedUserId]);

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
        alert(`✅ ${newItemName} added to store inventory!`);
        setNewItemName('');
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
        /* INDOOR OWNER MANAGEMENT DASHBOARD */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Register Indoor Venue & Facilities Form */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏟️ Register Indoor Arena & Facility Checklist
            </h3>
            <form onSubmit={handleRegisterArena} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Arena Name</label>
                <input
                  type="text"
                  placeholder="e.g. Velocity Indoor Sports Complex"
                  value={newArenaName}
                  onChange={(e) => setNewArenaName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>City</label>
                  <select
                    value={newArenaCity}
                    onChange={(e) => setNewArenaCity(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hourly Rate (PKR)</label>
                  <input
                    type="number"
                    value={newArenaRate}
                    onChange={(e) => setNewArenaRate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Address</label>
                <input
                  type="text"
                  placeholder="e.g. Phase 5 DHA, Lahore"
                  value={newArenaAddress}
                  onChange={(e) => setNewArenaAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                  required
                />
              </div>

              {/* Facilities Checklist */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Provided Facilities & Amenities</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                  {facilityOptions.map((f) => (
                    <label key={f.id} style={{ fontSize: '0.8rem', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="checkbox"
                        checked={selectedFacilities.includes(f.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedFacilities([...selectedFacilities, f.id]);
                          else setSelectedFacilities(selectedFacilities.filter(id => id !== f.id));
                        }}
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary">🚀 Register Arena & Facilities</button>
            </form>
          </div>

          {/* Multi-Store Ownership & Inventory Manager */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Create Store Form */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏪 Multi-Store Ownership (Register New Pro-Shop)
              </h3>
              <form onSubmit={handleCreateStore} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Store Name (e.g. SportsAdda DHA Pro Shop)"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                  required
                />
                <input
                  type="text"
                  placeholder="Store Location Address"
                  value={newStoreAddress}
                  onChange={(e) => setNewStoreAddress(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                  required
                />
                <button type="submit" className="btn btn-secondary">➕ Register Store Branch</button>
              </form>
            </div>

            {/* Manage Store Inventory */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
                📦 Manage Store Inventory Items
              </h3>
              <form onSubmit={handleAddStock} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                >
                  <option value="">-- Select Store Branch --</option>
                  {ownerStores.map((s) => (
                    <option key={s.id} value={s.id}>{s.store_name} ({s.store_address})</option>
                  ))}
                </select>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Item Name (e.g. Tapeball Bat)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price (PKR)"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={!selectedStoreId}>📦 Add Stock Item</button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* PLAYER COURT BOOKING VIEW */
        <>
          {/* Arenas & Courts Selector */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Select Indoor Pitch / Court</h4>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {arenas.map((a) => (
                <div key={a.id} className="glass-panel" style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', flex: '1 1 300px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{a.name} ({a.city || 'Lahore'})</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{a.address}</div>
                  
                  {/* Facilities Badges */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {(a.facilities || []).map((fac, idx) => (
                      <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}>
                        {fac}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {a.courts.map((court) => (
                      <button
                        key={court.id}
                        onClick={() => setSelectedCourt(court)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: selectedCourt?.id === court.id ? '2px solid #10b981' : '1px solid var(--border-color)',
                          background: selectedCourt?.id === court.id ? 'rgba(16, 185, 129, 0.2)' : '#111827',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      >
                        {court.court_name} (${court.hourly_rate}/hr)
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Hourly Slot Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: '#10b981' }} /> Available Hourly Slots for {selectedDate}
          </h3>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Off-Peak
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span> Peak (+25%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#374151' }}></span> Booked
            </span>
          </div>
        </div>

        {loadingSlots ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading slots...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {slots.map((slot) => (
              <div
                key={slot.hour}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: slot.isBooked 
                    ? '1px dashed #374151' 
                    : slot.isPeak 
                      ? '1px solid rgba(245, 158, 11, 0.4)' 
                      : '1px solid var(--border-color)',
                  background: slot.isBooked 
                    ? 'rgba(31, 41, 55, 0.4)' 
                    : slot.isPeak 
                      ? 'rgba(245, 158, 11, 0.08)' 
                      : 'rgba(255, 255, 255, 0.03)',
                  opacity: slot.isBooked ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: slot.isBooked ? '#9ca3af' : '#fff' }}>
                    {slot.timeLabel}
                  </span>
                  {slot.isPeak && !slot.isBooked && (
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '0.65rem' }}>
                      <Zap size={10} /> PEAK
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: slot.isBooked ? '#6b7280' : '#10b981' }}>
                    ${slot.rate}
                  </span>
                  <button
                    disabled={slot.isBooked}
                    onClick={() => handleBookSlot(slot)}
                    className={`btn ${slot.isBooked ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    {slot.isBooked ? 'Reserved' : 'Book Pitch'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
