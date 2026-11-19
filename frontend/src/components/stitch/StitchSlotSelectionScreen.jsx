import React, { useState } from 'react';

export default function StitchSlotSelectionScreen({ onNavigate, onConfirmBooking }) {
  const [selectedDate, setSelectedDate] = useState(12);
  const [selectedSlot, setSelectedSlot] = useState('04:00 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dates = [
    { day: 'Sun', date: 11 },
    { day: 'Mon', date: 12 },
    { day: 'Tue', date: 13 },
    { day: 'Wed', date: 14 },
    { day: 'Thu', date: 15 },
    { day: 'Fri', date: 16 }
  ];

  const slots = [
    { time: '03:00 PM', peak: false },
    { time: '04:00 PM', peak: true },
    { time: '05:00 PM', peak: true },
    { time: '06:00 PM', peak: true },
    { time: '07:00 PM', peak: false },
    { time: '08:00 PM', peak: false }
  ];

  const handleBooking = async () => {
    setIsSubmitting(true);
    const bookingPayload = {
      date: `2026-10-${selectedDate}`,
      time: selectedSlot,
      price: '$45.00'
    };

    try {
      // Post to backend database
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          court_id: '11111111-1111-1111-1111-111111111111',
          user_id: '11111111-1111-1111-1111-111111111111',
          date: `2026-10-${selectedDate}`,
          start_time: selectedSlot,
          end_time: '05:00 PM',
          total_price: 45.00,
          payment_method: 'CASH'
        })
      });
    } catch (e) {
      console.warn('Backend booking save warning:', e);
    } finally {
      setIsSubmitting(false);
      if (onConfirmBooking) {
        onConfirmBooking(bookingPayload);
      }
    }
  };

  return (
    <div className="w-[340px] h-[680px] bg-surface-container-low dark:bg-[#0b0f19] rounded-[40px] shadow-2xl border-[6px] border-slate-900 dark:border-slate-800 flex flex-col overflow-hidden relative font-body-md text-on-surface select-none">
      {/* Header */}
      <div className="bg-surface/90 dark:bg-[#131b2e]/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-outline/10 shrink-0 z-20">
        <button
          onClick={() => onNavigate && onNavigate('venue_detail')}
          className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-primary hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </button>
        <span className="font-headline-sm text-[15px] font-bold text-on-surface">Checkout</span>
        <div className="w-8 h-8" />
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Selected Court Banner */}
        <div className="bg-surface dark:bg-[#131b2e] p-3 rounded-2xl border border-outline/15 flex gap-3 items-center">
          <img
            src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=200"
            alt="Indoor Court A"
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div>
            <h3 className="font-headline-sm text-[14px] font-bold text-on-surface">Indoor Court A</h3>
            <p className="font-body-md text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[12px] text-primary">location_on</span>
              Downtown Sports Complex
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-sm text-[13px] font-bold text-on-surface">Select Date</h3>
            <span className="font-label-sm text-[11px] text-primary font-semibold">OCTOBER 2026</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {dates.map((d) => (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`flex-1 min-w-[50px] py-2.5 rounded-2xl flex flex-col items-center gap-0.5 border transition-all ${
                  selectedDate === d.date
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/30'
                    : 'bg-surface dark:bg-[#131b2e] border-outline/15 text-on-surface hover:border-primary/50'
                }`}
              >
                <span className="font-label-sm text-[10px] uppercase font-medium">{d.day}</span>
                <span className="font-headline-sm text-[15px] font-extrabold">{d.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Available Slots */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-sm text-[13px] font-bold text-on-surface">Available Slots</h3>
            <span className="font-label-sm text-[10px] text-on-surface-variant">6 Slots open</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {slots.map((s) => (
              <button
                key={s.time}
                onClick={() => setSelectedSlot(s.time)}
                className={`py-3 px-3 rounded-2xl border text-center font-label-md text-[12px] font-bold transition-all ${
                  selectedSlot === s.time
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary/40'
                    : 'bg-surface dark:bg-[#131b2e] border-outline/15 text-on-surface hover:border-primary'
                }`}
              >
                {s.time}
                {s.peak && (
                  <span className="block font-label-sm text-[9px] font-semibold opacity-80 mt-0.5">
                    ⚡ Peak Slot
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Bottom Summary & CTA */}
      <div className="bg-surface/95 dark:bg-[#131b2e]/95 backdrop-blur-xl border-t border-outline/10 p-4 space-y-3 shrink-0 z-20">
        <div className="flex justify-between items-center text-[12px]">
          <span className="font-body-md text-on-surface-variant">Selected Slot:</span>
          <span className="font-headline-sm font-bold text-primary">Mon {selectedDate}, {selectedSlot}</span>
        </div>
        
        <div className="flex justify-between items-baseline pt-1 border-t border-outline/10">
          <div>
            <span className="font-label-sm text-[10px] text-on-surface-variant block uppercase">Total Rate</span>
            <span className="font-headline-lg text-[20px] font-extrabold text-on-surface">$45.00</span>
          </div>
          <button
            disabled={isSubmitting}
            onClick={handleBooking}
            className="py-3.5 px-6 bg-primary hover:bg-[#003ec7] text-white rounded-2xl font-label-md text-[13px] font-extrabold tracking-wide uppercase shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'SAVING...' : 'CONFIRM BOOKING'}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
