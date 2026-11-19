import React, { useState } from 'react';

export default function StitchMyBookingsScreen({ onNavigate, onViewPass, passedBooking }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [dbBookings, setDbBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetch('/api/bookings/customer/cricket-bookings?user_id=11111111-1111-1111-1111-111111111111');
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          setDbBookings(data.bookings);
        }
      } catch (e) {
        console.warn('Error fetching live bookings:', e);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [passedBooking]);

  const defaultBookings = [
    {
      id: 'BK-TENNIS-01',
      title: 'Pioneer Tennis Courts',
      sub: 'Court 4, North Wing',
      status: 'CONFIRMED',
      statusColor: 'bg-primary text-white',
      dateTime: 'Oct 24, 2026 • 18:30 - 20:00',
      icon: 'sports_tennis'
    },
    {
      id: 'BK-AQUA-02',
      title: 'AquaFit Center',
      sub: 'Lane 2, Indoor Pool',
      status: 'UPCOMING',
      statusColor: 'bg-[#00c6ff]/20 text-primary dark:text-[#00c6ff]',
      dateTime: 'Oct 28, 2026 • 09:00 - 10:00',
      icon: 'pool'
    }
  ];

  let combinedBookings = [...defaultBookings];

  if (passedBooking) {
    combinedBookings.unshift({
      id: passedBooking.id || 'BK-NEW-01',
      title: passedBooking.venue || 'Downtown Sports Complex',
      sub: passedBooking.court || 'Indoor Court A',
      status: 'CONFIRMED',
      statusColor: 'bg-primary text-white',
      dateTime: `${passedBooking.date || 'Oct 12, 2026'} • ${passedBooking.time || '04:00 PM'}`,
      icon: 'sports_cricket'
    });
  }

  if (dbBookings.length > 0) {
    const apiMapped = dbBookings.map((b) => ({
      id: b.booking_id || b.id,
      title: b.pitch_name || b.arena_name || 'Indoor Sports Arena',
      sub: `Slot Date: ${b.slot_date ? new Date(b.slot_date).toLocaleDateString() : 'Active'}`,
      status: (b.booking_status || 'CONFIRMED').toUpperCase(),
      statusColor: b.booking_status === 'APPROVED' || b.booking_status === 'CONFIRMED'
        ? 'bg-primary text-white'
        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
      dateTime: `${b.start_time || '04:00 PM'} - ${b.end_time || '05:00 PM'}`,
      icon: 'sports_cricket'
    }));
    combinedBookings = [...apiMapped, ...combinedBookings];
  }

  return (
    <div className="w-[340px] h-[680px] bg-surface-container-low dark:bg-[#0b0f19] rounded-[40px] shadow-2xl border-[6px] border-slate-900 dark:border-slate-800 flex flex-col overflow-hidden relative font-body-md text-on-surface select-none">
      {/* Top Phone Notch / Header */}
      <div className="bg-surface/90 dark:bg-[#131b2e]/90 backdrop-blur-xl px-5 pt-4 pb-3 flex items-center justify-between border-b border-outline/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
          <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">Bookings</h2>
        </div>
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border border-primary/30"
        />
      </div>

      {/* Tabs Switcher */}
      <div className="p-4 pb-2 shrink-0">
        <div className="p-1 bg-surface-container dark:bg-slate-900 rounded-2xl flex">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 rounded-xl font-label-md text-[13px] font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 rounded-xl font-label-md text-[13px] font-bold transition-all ${
              activeTab === 'past'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {activeTab === 'upcoming' ? (
          combinedBookings.map((item) => (
            <div
              key={item.id}
              className="bg-surface dark:bg-[#131b2e] p-4 rounded-2xl border border-outline/15 shadow-sm space-y-3 hover:border-primary/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[15px] font-bold text-on-surface leading-tight">
                      {item.title}
                    </h3>
                    <p className="font-body-md text-[12px] text-on-surface-variant">{item.sub}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-[9px] font-bold uppercase tracking-wider ${item.statusColor}`}>
                  {item.status}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-[11px] bg-surface-container-low dark:bg-slate-900/60 p-2 rounded-xl">
                <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                <span>{item.dateTime}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onViewPass && onViewPass(item)}
                  className="flex-1 py-2 bg-primary hover:bg-[#003ec7] text-white rounded-xl font-label-md text-[12px] font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                  View Pass
                </button>
                <button className="px-4 py-2 bg-surface-container dark:bg-slate-800 text-on-surface rounded-xl font-label-md text-[12px] font-semibold hover:bg-surface-container-high transition-colors">
                  Manage
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-on-surface-variant font-body-md text-[13px]">
            No past bookings found
          </div>
        )}
      </div>

      {/* Bottom Phone Sticky Bar */}
      <div className="bg-surface/90 dark:bg-[#131b2e]/90 backdrop-blur-xl border-t border-outline/10 px-4 py-2 flex justify-around items-center shrink-0">
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span className="font-label-sm text-[10px]">Home</span>
        </button>
        <button
          onClick={() => onNavigate && onNavigate('venue_detail')}
          className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">explore</span>
          <span className="font-label-sm text-[10px]">Explore</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-primary">
          <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          <span className="font-label-sm text-[10px] font-bold">Bookings</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="font-label-sm text-[10px]">Profile</span>
        </button>
      </div>
    </div>
  );
}
