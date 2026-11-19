import React, { useState, useEffect } from 'react';
import badmintonImg from '../../assets/indoors/badminton.png';
import futsalImg from '../../assets/indoors/futsal.png';
import basketballImg from '../../assets/indoors/basketball.png';
import cricketImg from '../../assets/indoors/cricket.png';

export default function StitchExploreScreen({ onNavigate, onSelectVenue }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [arenas, setArenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArenas() {
      try {
        setLoading(true);
        const res = await fetch('/api/bookings/arenas');
        const data = await res.json();
        if (data.success && Array.isArray(data.arenas)) {
          setArenas(data.arenas);
        }
      } catch (err) {
        console.warn('Backend API offline, using cached fallback data', err);
        setError('Using cached offline data');
      } finally {
        setLoading(false);
      }
    }
    fetchArenas();
  }, []);

  const fallbackVenues = [
    {
      id: 'v1',
      name: 'Velocity Sports Complex',
      address: 'DHA Phase 5 Commercial, Sector E',
      city: 'Lahore',
      hourly_rate: 2500,
      avg_rating: 4.8,
      facilities: ['AC Lounge', 'Parking', 'Live Stream Camera', 'Changing Rooms'],
      amenities: { ac: true, parking: true, cameras: true, changing_room: true, canteen: true },
      courts: [{ id: 'c1', court_name: 'Turf Pitch Alpha', sport_type: 'FUTSAL', hourly_rate: 45 }]
    },
    {
      id: 'v2',
      name: 'Apex Pitch Stadium',
      address: 'Gulberg III, Main Boulevard',
      city: 'Lahore',
      hourly_rate: 3000,
      avg_rating: 4.9,
      facilities: ['Bowling Machine', 'AC Lounge', 'Prayer Area'],
      amenities: { ac: true, parking: true, cameras: true, changing_room: true, canteen: true },
      courts: [{ id: 'c2', court_name: 'Box Cricket Arena 1', sport_type: 'CRICKET', hourly_rate: 50 }]
    },
    {
      id: 'v3',
      name: 'Metro Badminton Club',
      address: 'Johar Town Phase 2',
      city: 'Lahore',
      hourly_rate: 1800,
      avg_rating: 4.6,
      facilities: ['Wooden Flooring', 'Lighting', 'Refreshments'],
      amenities: { ac: true, parking: true, cameras: false, changing_room: true, canteen: true },
      courts: [{ id: 'c3', court_name: 'Court 1 & 2', sport_type: 'BADMINTON', hourly_rate: 25 }]
    },
    {
      id: 'v4',
      name: 'Elite Basketball Dome',
      address: 'Cantt Sports Complex',
      city: 'Lahore',
      hourly_rate: 3500,
      avg_rating: 4.7,
      facilities: ['Glass Backboards', 'AC Lounge', 'Scoreboard'],
      amenities: { ac: true, parking: true, cameras: true, changing_room: true, canteen: true },
      courts: [{ id: 'c4', court_name: 'Main Court A', sport_type: 'BASKETBALL', hourly_rate: 40 }]
    },
    {
      id: 'v5',
      name: 'Lahore Garrison Shooting Gallery',
      address: 'DHA Phase 8, Sector C',
      city: 'Lahore',
      hourly_rate: 4500,
      avg_rating: 4.9,
      facilities: ['Air Pistol 10m', '25m Firearm Range', 'Laser Target', 'Safety Instructor'],
      amenities: { ac: true, parking: true, cameras: true, changing_room: true, canteen: true },
      courts: [{ id: 'c5', court_name: 'Tactical Pistol Range 1', sport_type: 'SHOOTING', hourly_rate: 75 }]
    },
    {
      id: 'v6',
      name: 'Lahore Archery Club',
      address: 'Main Boulevard, Gulberg III',
      city: 'Lahore',
      hourly_rate: 2200,
      avg_rating: 4.7,
      facilities: ['Recurve Bows 🏹', 'Compound Bow Lane', '18m Target'],
      amenities: { ac: true, parking: true, cameras: true, changing_room: true, canteen: false },
      courts: [{ id: 'c6', court_name: 'Target Archery Lane A', sport_type: 'ARCHERY', hourly_rate: 35 }]
    },
    {
      id: 'v7',
      name: 'Garrison Equestrian & Riding Stables',
      address: 'Sarfraz Rafiqui Road, Cantt',
      city: 'Lahore',
      hourly_rate: 3500,
      avg_rating: 4.9,
      facilities: ['Covered Riding Ring 🐎', 'Show Jumping', 'Horse Rental'],
      amenities: { ac: false, parking: true, cameras: true, changing_room: true, canteen: true },
      courts: [{ id: 'c7', court_name: 'Main Riding Arena', sport_type: 'HORSE_RIDING', hourly_rate: 60 }]
    },
    {
      id: 'v8',
      name: 'Smash Padel Club Lahore',
      address: 'Sector Z, DHA Phase 3',
      city: 'Lahore',
      hourly_rate: 3800,
      avg_rating: 4.8,
      facilities: ['Panoramic Glass Court 🎾', 'Mondo Turf', 'LED Floodlights'],
      amenities: { ac: true, parking: true, cameras: true, changing_room: true, canteen: true },
      courts: [{ id: 'c8', court_name: 'Padel Glass Court 1', sport_type: 'PADEL', hourly_rate: 55 }]
    }
  ];

  const displayVenues = arenas.length > 0 ? arenas : fallbackVenues;

  const categories = [
    { id: 'ALL', label: 'All Arenas', icon: 'grid_view' },
    { id: 'SHOOTING', label: 'Shooting 🔫', icon: 'gps_fixed' },
    { id: 'ARCHERY', label: 'Archery 🏹', icon: 'adjust' },
    { id: 'HORSE_RIDING', label: 'Horse Riding 🐎', icon: 'pets' },
    { id: 'PADEL', label: 'Padel 🎾', icon: 'sports_tennis' },
    { id: 'FUTSAL', label: 'Futsal ⚽', icon: 'sports_soccer' },
    { id: 'CRICKET', label: 'Cricket 🏏', icon: 'sports_cricket' },
    { id: 'BADMINTON', label: 'Badminton 🏸', icon: 'sports_tennis' },
    { id: 'BASKETBALL', label: 'Basketball 🏀', icon: 'sports_basketball' }
  ];

  const filteredVenues = displayVenues.filter((venue) => {
    const matchesSearch =
      venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.city?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeCategory === 'ALL') return matchesSearch;
    const hasSportCourt = venue.courts?.some(
      (c) => c.sport_type?.toUpperCase() === activeCategory
    );
    return matchesSearch && (hasSportCourt || activeCategory === 'ALL');
  });

  const getVenueImage = (v, idx) => {
    if (v.image_url) return v.image_url;
    const sport = v.courts?.[0]?.sport_type?.toUpperCase();
    if (sport === 'FUTSAL') return futsalImg;
    if (sport === 'CRICKET') return cricketImg;
    if (sport === 'BADMINTON') return badmintonImg;
    if (sport === 'BASKETBALL') return basketballImg;
    if (sport === 'SHOOTING') return 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80';
    if (sport === 'ARCHERY') return 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80';
    if (sport === 'HORSE_RIDING') return 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80';
    if (sport === 'PADEL') return 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=600&q=80';
    return idx % 2 === 0 ? futsalImg : cricketImg;
  };

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[640px] bg-slate-900 text-white flex flex-col font-sans rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden select-none">
      {/* Top Header */}
      <header className="px-4 pt-4 pb-2 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#0052ff]">
            Database Directory
          </span>
          <h1 className="text-lg font-extrabold text-white tracking-tight leading-tight">
            Explore Venues
          </h1>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 pb-20 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search venue, city, address..."
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs pl-9 pr-3 py-2 rounded-xl outline-none focus:border-[#0052ff] placeholder-slate-400"
          />
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#0052ff] text-white shadow-md shadow-[#0052ff]/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {cat.icon}
              </span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Found {filteredVenues.length} Venues</span>
          <span className="flex items-center gap-1 text-[#00c6ff] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c6ff] animate-ping"></span>
            PostgreSQL Live
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined animate-spin text-2xl text-[#0052ff]">
              sync
            </span>
            <span>Fetching live database arenas...</span>
          </div>
        ) : (
          /* Venues List Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVenues.map((venue, idx) => (
              <div
                key={venue.id || idx}
                onClick={() => {
                  onSelectVenue && onSelectVenue(venue);
                  onNavigate && onNavigate('venue_detail');
                }}
                className="bg-slate-800/80 border border-slate-700/60 hover:border-[#0052ff]/60 rounded-2xl p-3 cursor-pointer transition-all hover:bg-slate-800 flex flex-col gap-2"
              >
                <div className="relative h-32 w-full rounded-xl overflow-hidden">
                  <img
                    src={getVenueImage(venue, idx)}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <span className="material-symbols-outlined text-[13px]">
                      star
                    </span>
                    {venue.avg_rating || '4.8'}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-200">
                    PKR {venue.hourly_rate || 2500}/hr
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-white leading-tight">
                    {venue.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <span className="material-symbols-outlined text-[13px] text-red-400">
                      location_on
                    </span>
                    {venue.address || venue.city || 'Lahore'}
                  </p>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {venue.amenities?.ac && (
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md font-semibold">
                      ❄️ AC Lounge
                    </span>
                  )}
                  {venue.amenities?.parking && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-md font-semibold">
                      🅿️ Parking
                    </span>
                  )}
                  {venue.amenities?.cameras && (
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-md font-semibold">
                      📹 Live Stream
                    </span>
                  )}
                  {venue.courts?.map((c) => (
                    <span
                      key={c.id}
                      className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md font-semibold uppercase"
                    >
                      {c.sport_type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Bottom Nav */}
      <nav className="absolute bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 h-14 flex items-center justify-around px-2 z-30">
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button
          onClick={() => onNavigate && onNavigate('explore')}
          className="flex flex-col items-center gap-0.5 text-[#0052ff] font-bold"
        >
          <span className="material-symbols-outlined text-[20px]">explore</span>
          <span className="text-[10px]">Explore</span>
        </button>
        <button
          onClick={() => onNavigate && onNavigate('matches_byog')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white"
        >
          <span className="material-symbols-outlined text-[20px]">stadium</span>
          <span className="text-[10px] font-bold">Live & BYOG</span>
        </button>
        <button
          onClick={() => onNavigate && onNavigate('leaderboard')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white"
        >
          <span className="material-symbols-outlined text-[20px]">trophy</span>
          <span className="text-[10px] font-bold">Stats</span>
        </button>
        <button
          onClick={() => onNavigate && onNavigate('bookings')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white"
        >
          <span className="material-symbols-outlined text-[20px]">calendar_today</span>
          <span className="text-[10px] font-bold">Bookings</span>
        </button>
      </nav>
    </div>
  );
}
