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

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar style={{ color: '#10b981' }} /> Indoor Court Booking & Slot Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Book Futsal pitches, Indoor Cricket boxes, and Padel courts with dynamic peak/off-peak pricing and QR check-in codes.
          </p>
        </div>
        
        {/* Date Selector & User Picker */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '10px', background: '#111827', border: '1px solid var(--border-color)', color: '#fff' }}
          />
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '10px', background: '#111827', border: '1px solid var(--border-color)', color: '#fff' }}
          >
            {allPlayers.map((p) => (
              <option key={p.user_id} value={p.user_id}>Booker: {p.display_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Arenas & Courts Selector */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Select Indoor Pitch / Court</h4>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          {arenas.flatMap((a) => a.courts).map((court) => (
            <button
              key={court.id}
              onClick={() => setSelectedCourt(court)}
              className="glass-panel"
              style={{
                padding: '14px 20px',
                borderRadius: '14px',
                border: selectedCourt?.id === court.id ? '2px solid #10b981' : '1px solid var(--border-color)',
                background: selectedCourt?.id === court.id ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '1.4rem' }}>
                {court.sport_type === 'CRICKET' ? '🏏' : court.sport_type === 'PADEL' ? '🎾' : '⚽'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{court.court_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {court.sport_type} • ${court.hourly_rate}/hr
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

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
