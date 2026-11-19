import React, { useState, useEffect } from 'react';
import badmintonImg from '../../assets/indoors/badminton.png';
import futsalImg from '../../assets/indoors/futsal.png';
import basketballImg from '../../assets/indoors/basketball.png';
import cricketImg from '../../assets/indoors/cricket.png';

export default function StitchHomeScreen({ onNavigate, onSelectVenue }) {
  const [activeTab, setActiveTab] = useState('home');
  const [dbVenues, setDbVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL', 'BADMINTON', 'FUTSAL', 'BASKETBALL', 'CRICKET', 'SHOOTING', 'ARCHERY', 'HORSE_RIDING', 'PADEL', 'SNOOKER', 'SWIMMING'
  const [showMoreModal, setShowMoreModal] = useState(false);

  useEffect(() => {
    async function loadArenas() {
      try {
        const res = await fetch('/api/bookings/arenas');
        const data = await res.json();
        if (data.success && Array.isArray(data.arenas) && data.arenas.length > 0) {
          setDbVenues(data.arenas);
        }
      } catch (err) {
        console.warn('Using default venue view fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    loadArenas();
  }, []);

  // Comprehensive Pakistani Indoor & Specialized Sports Facilities Directory
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
      facilities: ['Air Pistol 10m', '25m Firearm Range', 'Laser Target', 'Safety Instructor'],
      image: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'pk-shooting-2',
      name: 'Gun & Country Club Islamabad',
      price: 'PKR 5,000/hr',
      rating: '4.9',
      location: 'Shakarparian Road, Islamabad',
      category: 'Shooting Range',
      sport_type: 'SHOOTING',
      type: 'Olympic Tactical',
      facilities: ['Olympic Trap', '25m Pistol Bay', 'Gun Armory', 'VIP Lounge'],
      image: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80'
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
      facilities: ['Recurve Bows 🏹', 'Compound Bow Lane', '18m Target', 'Safety Gear Kit'],
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80'
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
      facilities: ['Covered Riding Ring 🐎', 'Show Jumping', 'Expert Trainer', 'Horse Rental'],
      image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'pk-padel-1',
      name: 'Smash Padel Club Lahore',
      price: 'PKR 3,800/hr',
      rating: '4.8',
      location: 'Sector Z, DHA Phase 3',
      category: 'Padel Tennis',
      sport_type: 'PADEL',
      type: 'Glass Court',
      facilities: ['Panoramic Glass Court 🎾', 'Mondo Turf', 'LED Floodlights', 'Pro Shop'],
      image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'pk-cricket-1',
      name: 'Velocity Indoor Cricket Nets',
      price: 'PKR 2,500/hr',
      rating: '4.8',
      location: 'DHA Phase 5 Commercial',
      category: 'Indoor Cricket',
      sport_type: 'CRICKET',
      type: 'Pitch Net',
      facilities: ['Automated Bowling Machine 🏏', 'Tape Ball Pitch', 'AC Lounge'],
      image: cricketImg
    },
    {
      id: 'pk-futsal-1',
      name: 'Smurfs 5-a-Side Futsal Arena',
      price: 'PKR 2,800/hr',
      rating: '4.7',
      location: 'DHA Phase 6 Main Blvd',
      category: 'Futsal',
      sport_type: 'FUTSAL',
      type: 'AstroTurf',
      facilities: ['FIFA Grade Turf ⚽', 'Floodlights', 'Changing Rooms'],
      image: futsalImg
    },
    {
      id: 'pk-badminton-1',
      name: 'DHA Badminton Complex',
      price: 'PKR 1,800/hr',
      rating: '4.6',
      location: 'Sector R, Phase 2, DHA',
      category: 'Badminton',
      sport_type: 'BADMINTON',
      type: 'Hardwood',
      facilities: ['Teak Hardwood 🏸', 'Yonex Mats', 'AC Air Flow'],
      image: badmintonImg
    },
    {
      id: 'pk-basketball-1',
      name: 'Elite Hoops Basketball Dome',
      price: 'PKR 3,200/hr',
      rating: '4.9',
      location: 'Fortress Stadium Cantt',
      category: 'Basketball',
      sport_type: 'BASKETBALL',
      type: 'Maple Hardwood',
      facilities: ['Maple Court 🏀', 'Glass Backboards', 'Shot Clocks'],
      image: basketballImg
    }
  ];

  // Map DB venues or Pakistani specialized venues
  const allAvailableVenues = dbVenues.length > 0
    ? dbVenues.map((a, idx) => {
        const sport = a.courts?.[0]?.sport_type?.toUpperCase() || 'CRICKET';
        let img = a.image_url;
        if (!img) {
          if (sport === 'BADMINTON') img = badmintonImg;
          else if (sport === 'FUTSAL') img = futsalImg;
          else if (sport === 'BASKETBALL') img = basketballImg;
          else if (sport === 'SHOOTING') img = 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80';
          else if (sport === 'ARCHERY') img = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80';
          else if (sport === 'HORSE_RIDING') img = 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80';
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
          facilities: a.facilities || [],
          image: img
        };
      }).concat(pakistaniSpecializedVenues.filter(p => !dbVenues.some(d => d.name === p.name)))
    : pakistaniSpecializedVenues;

  // Filter venues by selected category
  const filteredVenues = selectedCategory === 'ALL'
    ? allAvailableVenues
    : allAvailableVenues.filter(v => v.sport_type === selectedCategory || v.category?.toUpperCase()?.includes(selectedCategory));

  const trendingVenues = filteredVenues.slice(0, 3);
  const recommendedVenues = filteredVenues.slice(1, 5);

  const specializedGamesCatalog = [
    { id: 'SHOOTING', label: 'Tactical Shooting Range', emoji: '🔫', icon: 'gps_fixed', desc: 'Air pistol 10m & 25m Firearm ranges in Army Garrison & Gun Clubs', city: 'Lahore & Islamabad' },
    { id: 'ARCHERY', label: 'Indoor Archery Arena', emoji: '🏹', icon: 'adjust', desc: 'Recurve & Compound bow target lanes with certified trainers', city: 'Gulberg & Islamabad' },
    { id: 'HORSE_RIDING', label: 'Equestrian & Horse Riding', emoji: '🐎', icon: 'pets', desc: 'Covered riding rings, show jumping & horse rental stables', city: 'Cantt & Rawalpindi' },
    { id: 'PADEL', label: 'Glass Padel Tennis', emoji: '🎾', icon: 'sports_tennis', desc: 'Panoramic glass courts with Mondo turf floodlights', city: 'DHA Phase 3' },
    { id: 'CRICKET', label: 'Indoor Box Cricket', emoji: '🏏', icon: 'sports_cricket', desc: 'Automated bowling machine nets & tape ball arenas', city: 'DHA & Johar Town' },
    { id: 'FUTSAL', label: '5-a-Side Futsal Turf', emoji: '⚽', icon: 'sports_soccer', desc: 'FIFA grade indoor AstroTurf cages & stadiums', city: 'DHA Phase 5 & 6' },
    { id: 'BADMINTON', label: 'Badminton Courts', emoji: '🏸', icon: 'sports_tennis', desc: 'Teak hardwood & synthetic tournament mats', city: 'DHA & Cantt' },
    { id: 'BASKETBALL', label: 'Basketball Domes', emoji: '🏀', icon: 'sports_basketball', desc: 'Hardwood maple courts with glass backboards', city: 'Fortress Cantt' },
    { id: 'SNOOKER', label: 'Snooker & Cue Lounge', emoji: '🎱', icon: 'sports', desc: 'Tournament snooker tables & VIP cue lounges', city: 'DHA & Gulberg' },
    { id: 'SWIMMING', label: 'Heated Aquatic Dome', emoji: '🏊', icon: 'pool', desc: 'Temperature controlled 25m & 50m indoor swimming pools', city: 'Garrison Complex' }
  ];

  const handleSelectCategory = (catId) => {
    setSelectedCategory(prev => prev === catId ? 'ALL' : catId);
  };

  return (
    <div className="bg-surface-container-low font-body-md text-on-surface min-h-screen flex flex-col relative select-none">
      {/* Top Fixed Header Bar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-16 px-margin-mobile flex items-center justify-between">
          <div className="flex items-center gap-stack-sm">
            <img
              alt="Apex Athletics Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4nRhePK8GMSYlWyCAX170-YglvcmVzD20rpQhS2675ELT4ma4zt6iY5LO4pS_oeQR7TgqZF_dTbYIF3S6XNld7vFpp8QljErc2bgadiQDRUeSGCjg3TSTYnk7orpU-KQejqWY6Al5srdH6qqwu5HncNzf20t0NsX7iMQdm9cGt-JczKCznZkYzazXOViIBcE6J-iyC1sTCwlTEJ7yYhoZ4wXYe7JbhMsnFbtuh3JEa2ScjdRzR_Yh"
            />
            <span className="font-headline-sm text-headline-sm text-primary font-bold">Apex Sports</span>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('profile')}
            className="w-8 h-8 rounded-full overflow-hidden border border-primary/30 active:scale-95 transition-transform"
          >
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Babar_Azam_%28cropped%29.jpg"
            />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 bg-surface-container-low">
        <div className="flex flex-col w-full pb-section-gap">
          
          {/* Hero / Welcome Section */}
          <div className="px-margin-mobile pt-stack-lg pb-stack-md flex justify-between items-end">
            <div>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Find Your Game</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-base">
                Discover Pakistan indoor arenas, shooting ranges & equestrian rings
              </p>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('explore')}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors shadow-sm"
              title="Search all sports"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>

          {/* Quick Categories Buttons Grid */}
          <div className="px-margin-mobile mb-section-gap">
            <div className="grid grid-cols-4 gap-stack-sm">
              {/* Badminton */}
              <button 
                onClick={() => handleSelectCategory('BADMINTON')}
                className="flex flex-col items-center gap-base group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm group-active:scale-95 ${
                  selectedCategory === 'BADMINTON'
                    ? 'bg-[#0052ff] text-white shadow-lg shadow-[#0052ff]/30 ring-2 ring-[#0052ff] ring-offset-2'
                    : 'bg-surface-container-high text-primary group-hover:bg-[#0052ff] group-hover:text-white'
                }`}>
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_tennis</span>
                </div>
                <span className={`font-label-sm text-label-sm transition-colors ${selectedCategory === 'BADMINTON' ? 'text-[#0052ff] font-bold' : 'text-on-surface-variant group-hover:text-primary'}`}>
                  Badminton
                </span>
              </button>

              {/* Futsal */}
              <button 
                onClick={() => handleSelectCategory('FUTSAL')}
                className="flex flex-col items-center gap-base group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm group-active:scale-95 ${
                  selectedCategory === 'FUTSAL'
                    ? 'bg-[#0052ff] text-white shadow-lg shadow-[#0052ff]/30 ring-2 ring-[#0052ff] ring-offset-2'
                    : 'bg-surface-container-high text-primary group-hover:bg-[#0052ff] group-hover:text-white'
                }`}>
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
                </div>
                <span className={`font-label-sm text-label-sm transition-colors ${selectedCategory === 'FUTSAL' ? 'text-[#0052ff] font-bold' : 'text-on-surface-variant group-hover:text-primary'}`}>
                  Futsal
                </span>
              </button>

              {/* Basketball */}
              <button 
                onClick={() => handleSelectCategory('BASKETBALL')}
                className="flex flex-col items-center gap-base group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm group-active:scale-95 ${
                  selectedCategory === 'BASKETBALL'
                    ? 'bg-[#0052ff] text-white shadow-lg shadow-[#0052ff]/30 ring-2 ring-[#0052ff] ring-offset-2'
                    : 'bg-surface-container-high text-primary group-hover:bg-[#0052ff] group-hover:text-white'
                }`}>
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_basketball</span>
                </div>
                <span className={`font-label-sm text-label-sm transition-colors ${selectedCategory === 'BASKETBALL' ? 'text-[#0052ff] font-bold' : 'text-on-surface-variant group-hover:text-primary'}`}>
                  Basketball
                </span>
              </button>

              {/* More Sports Button */}
              <button 
                onClick={() => setShowMoreModal(true)}
                className="flex flex-col items-center gap-base group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm group-active:scale-95 ${
                  !['ALL', 'BADMINTON', 'FUTSAL', 'BASKETBALL'].includes(selectedCategory)
                    ? 'bg-[#0052ff] text-white shadow-lg shadow-[#0052ff]/30 ring-2 ring-[#0052ff] ring-offset-2'
                    : 'bg-surface-container-high text-on-surface group-hover:bg-[#0052ff] group-hover:text-white'
                }`}>
                  <span className="material-symbols-outlined text-[28px]">more_horiz</span>
                </div>
                <span className={`font-label-sm text-label-sm transition-colors ${!['ALL', 'BADMINTON', 'FUTSAL', 'BASKETBALL'].includes(selectedCategory) ? 'text-[#0052ff] font-bold' : 'text-on-surface-variant group-hover:text-primary'}`}>
                  {!['ALL', 'BADMINTON', 'FUTSAL', 'BASKETBALL'].includes(selectedCategory) ? selectedCategory : 'More'}
                </span>
              </button>
            </div>
          </div>

          {/* Active Filter Bar Badge (if filter active) */}
          {selectedCategory !== 'ALL' && (
            <div className="px-margin-mobile mb-stack-md flex items-center justify-between bg-primary/10 border border-primary/20 p-2.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-sm">🎯</span>
                <span className="text-xs font-bold text-primary">
                  Filtered by: {specializedGamesCatalog.find(g => g.id === selectedCategory)?.label || selectedCategory}
                </span>
              </div>
              <button 
                onClick={() => setSelectedCategory('ALL')}
                className="text-[11px] font-bold px-2 py-0.5 bg-primary text-white rounded-lg active:scale-95"
              >
                Show All
              </button>
            </div>
          )}

          {/* Trending Venues Horizontal Slider */}
          <div className="mb-section-gap">
            <div className="px-margin-mobile flex justify-between items-end mb-stack-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                {selectedCategory !== 'ALL' ? `${selectedCategory} Venues` : 'Trending Venues in Pakistan'}
              </h2>
              <button 
                onClick={() => onNavigate && onNavigate('explore')}
                className="font-label-md text-label-md text-primary flex items-center group cursor-pointer bg-transparent border-none"
              >
                See all
                <span className="material-symbols-outlined text-[16px] ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>

            {trendingVenues.length === 0 ? (
              <div className="px-margin-mobile py-6 text-center text-xs text-on-surface-variant bg-surface-container rounded-2xl mx-margin-mobile">
                No venues found for this category. Click <strong>Explore Directory</strong> to discover upcoming arenas.
              </div>
            ) : (
              <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pl-margin-mobile pr-margin-mobile gap-stack-md pb-stack-sm">
                {trendingVenues.map((v) => (
                  <div 
                    key={v.id}
                    onClick={() => {
                      onSelectVenue && onSelectVenue(v);
                      onNavigate && onNavigate('venue_detail');
                    }}
                    className="snap-start shrink-0 w-[260px] bg-surface rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] overflow-hidden relative group cursor-pointer transform transition-transform active:scale-[0.98]"
                  >
                    <div className="relative h-[146px] w-full">
                      <img className="w-full h-full object-cover" alt={v.name} src={v.image} />
                      <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[14px] text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-label-sm text-label-sm text-on-surface">{v.rating}</span>
                      </div>
                    </div>
                    <div className="p-stack-md">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-headline-sm text-[16px] leading-[24px] text-on-surface truncate pr-2">{v.name}</h3>
                        <span className="font-label-md text-label-md text-primary shrink-0 mt-1">{v.price}</span>
                      </div>
                      <div className="flex items-center text-on-surface-variant gap-1 mb-3">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="font-body-md text-[13px] truncate">{v.location}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-surface-container rounded-md font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">{v.category}</span>
                        <span className="px-2 py-1 bg-surface-container rounded-md font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">{v.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="snap-start shrink-0 w-2"></div>
              </div>
            )}
          </div>

          {/* Recommended for You */}
          <div className="px-margin-mobile">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-stack-md">
              Recommended Facilities
            </h2>
            <div className="flex flex-col gap-stack-md">
              {recommendedVenues.map((v) => (
                <div 
                  key={v.id} 
                  onClick={() => {
                    onSelectVenue && onSelectVenue(v);
                    onNavigate && onNavigate('venue_detail');
                  }}
                  className="bg-surface p-3 rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.04)] flex gap-stack-md items-center cursor-pointer active:bg-surface-container-low transition-colors"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                    <img className="w-full h-full object-cover" alt={v.name} src={v.image} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-headline-sm text-[15px] leading-tight text-on-surface truncate">{v.name}</h3>
                      <div className="flex items-center gap-0.5 ml-2 shrink-0 bg-surface-container px-1.5 py-0.5 rounded text-on-surface">
                        <span className="material-symbols-outlined text-[12px] text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-label-sm text-[10px]">{v.rating}</span>
                      </div>
                    </div>
                    <p className="font-body-md text-[13px] text-on-surface-variant truncate mt-1">{v.category} • {v.location}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-md text-primary bg-primary/10 font-bold">Verified Arena</span>
                      <span className="font-label-md text-on-surface">{v.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* "More Sports" Bottom Sheet Modal */}
      {showMoreModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-fadeIn">
          <div className="bg-slate-900 text-white rounded-t-[32px] p-5 max-h-[85vh] overflow-y-auto border-t border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#0052ff]">Sports Categories</span>
                <h3 className="text-lg font-extrabold text-white">All Pakistani Indoor Games</h3>
              </div>
              <button 
                onClick={() => setShowMoreModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 my-3">
              Select a game to filter arenas, shooting ranges, archery lines, equestrian stables, and pro shops across Pakistan:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-6">
              {specializedGamesCatalog.map((game) => (
                <div
                  key={game.id}
                  onClick={() => {
                    setSelectedCategory(game.id);
                    setShowMoreModal(false);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedCategory === game.id
                      ? 'bg-[#0052ff]/20 border-[#0052ff] ring-1 ring-[#0052ff]'
                      : 'bg-slate-800/80 border-slate-700/60 hover:border-[#0052ff]/50 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-slate-900/80 shrink-0">{game.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-white truncate">{game.label}</h4>
                      <span className="text-[9px] text-[#00c6ff] font-bold">{game.city}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{game.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setShowMoreModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Reset / Show All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)]" data-active-classes="text-primary">
        <div className="flex justify-around items-center h-16 px-gutter-mobile">
          <button onClick={() => { setActiveTab('home'); onNavigate && onNavigate('home'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${activeTab === 'home' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-md text-label-md font-bold">Home</span>
          </button>
          <button onClick={() => { setActiveTab('explore'); onNavigate && onNavigate('explore'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${activeTab === 'explore' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
            <span className="material-symbols-outlined">explore</span>
            <span className="font-label-md text-label-md">Explore</span>
          </button>
          <button onClick={() => { setActiveTab('matches'); onNavigate && onNavigate('matches_byog'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${activeTab === 'matches' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
            <span className="material-symbols-outlined">stadium</span>
            <span className="font-label-md text-label-md">Live & BYOG</span>
          </button>
          <button onClick={() => { setActiveTab('bookings'); onNavigate && onNavigate('bookings'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${activeTab === 'bookings' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="font-label-md text-label-md">Bookings</span>
          </button>
          <button onClick={() => { setActiveTab('profile'); onNavigate && onNavigate('profile'); }} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-md text-label-md">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
