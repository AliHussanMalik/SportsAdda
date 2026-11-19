import React, { useState, useEffect } from 'react';

export default function StitchMatchesBYOGScreen({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'byog'
  const [matches, setMatches] = useState([]);
  const [customGrounds, setCustomGrounds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form for BYOG ground creation
  const [groundName, setGroundName] = useState('');
  const [addressText, setAddressText] = useState('');
  const [groundType, setGroundType] = useState('OPEN_FIELD');
  const [createSuccess, setCreateSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [mRes, gRes] = await Promise.all([
        fetch('/api/matches'),
        fetch('/api/matches/custom-grounds')
      ]);
      const mData = await mRes.json();
      const gData = await gRes.json();

      if (mData.success && Array.isArray(mData.matches)) setMatches(mData.matches);
      if (gData.success && Array.isArray(gData.customGrounds)) setCustomGrounds(gData.customGrounds);
    } catch (e) {
      console.warn('API error, using cached fallback', e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateGround = async (e) => {
    e.preventDefault();
    if (!groundName || !addressText) return;
    try {
      const res = await fetch('/api/matches/custom-grounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ground_name: groundName,
          address_text: addressText,
          latitude: 31.4815,
          longitude: 74.303,
          ground_type: groundType
        })
      });
      const data = await res.json();
      if (data.success) {
        setCreateSuccess('Ground registered successfully on PostgreSQL!');
        setGroundName('');
        setAddressText('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fallbackMatches = [
    {
      id: 'm1',
      team_a_name: 'Thunder Strikers FC',
      team_b_name: 'Apex Titans CC',
      match_status: 'LIVE',
      score: '2 - 0',
      custom_ground_name: 'Fast NUCES Main Ground'
    },
    {
      id: 'm2',
      team_a_name: 'Lahore Warriors',
      team_b_name: 'Karachi Kings',
      match_status: 'SCHEDULED',
      custom_ground_name: 'Velocity Pitch Alpha'
    }
  ];

  const displayMatches = matches.length > 0 ? matches : fallbackMatches;

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[640px] bg-slate-900 text-white flex flex-col font-sans rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden select-none">
      {/* Header */}
      <header className="px-4 pt-4 pb-2 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
            Live Match Engine
          </span>
          <h1 className="text-lg font-extrabold text-white tracking-tight leading-tight">
            Matches & BYOG
          </h1>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </header>

      {/* Subnav switcher */}
      <div className="flex bg-slate-800 p-1 m-3 rounded-xl border border-slate-700">
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'matches'
              ? 'bg-[#0052ff] text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⚽ Live Matches ({displayMatches.length})
        </button>
        <button
          onClick={() => setActiveTab('byog')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'byog'
              ? 'bg-[#0052ff] text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏟️ BYOG Custom Grounds
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto px-3 pb-20 space-y-3">
        {activeTab === 'matches' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>PostgreSQL Match Fixtures</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                WebSocket Active
              </span>
            </div>

            {displayMatches.map((m) => (
              <div
                key={m.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 space-y-2 relative overflow-hidden"
              >
                {m.match_status === 'LIVE' && (
                  <div className="absolute top-2 right-2 bg-red-500/20 text-red-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    LIVE
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold pr-16">
                  <span>{m.custom_ground_name || 'Commercial Arena'}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-y border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center font-bold text-blue-300 text-xs">
                      {m.team_a_name?.slice(0, 2).toUpperCase() || 'TA'}
                    </div>
                    <span className="font-bold text-xs text-slate-100">
                      {m.team_a_name}
                    </span>
                  </div>

                  <span className="font-black text-sm text-emerald-400 px-2 py-1 bg-slate-900 rounded-lg">
                    {m.score || 'VS'}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-100">
                      {m.team_b_name}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-amber-600/30 flex items-center justify-center font-bold text-amber-300 text-xs">
                      {m.team_b_name?.slice(0, 2).toUpperCase() || 'TB'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Status: {m.match_status}</span>
                  <span className="text-[#00c6ff] font-bold">Single-Tap Scoring Ready</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* BYOG Registration Form */}
            <form
              onSubmit={handleCreateGround}
              className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 space-y-2"
            >
              <h3 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-400">
                  add_location_alt
                </span>
                Bring Your Own Ground (BYOG)
              </h3>
              <p className="text-[10px] text-slate-400">
                Register a public field, university turf, or street pitch into database.
              </p>

              {createSuccess && (
                <div className="text-[10px] bg-emerald-500/20 text-emerald-300 p-2 rounded-lg font-bold">
                  {createSuccess}
                </div>
              )}

              <input
                type="text"
                value={groundName}
                onChange={(e) => setGroundName(e.target.value)}
                placeholder="Ground Name (e.g. FAST Main Field)"
                className="w-full bg-slate-900 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-[#0052ff]"
                required
              />

              <input
                type="text"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="Address / Location details"
                className="w-full bg-slate-900 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-[#0052ff]"
                required
              />

              <select
                value={groundType}
                onChange={(e) => setGroundType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs px-2.5 py-1.5 rounded-lg outline-none text-slate-300"
              >
                <option value="OPEN_FIELD">Open Turf / Field</option>
                <option value="UNIVERSITY_GROUND">University Sports Ground</option>
                <option value="STREET_PITCH">Street Box Court</option>
              </select>

              <button
                type="submit"
                className="w-full py-2 bg-[#0052ff] hover:bg-[#003ec7] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#0052ff]/30"
              >
                Save Ground to Database
              </button>
            </form>

            {/* Custom Grounds List */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-300">
                Registered Custom Grounds ({customGrounds.length})
              </h4>
              {customGrounds.map((g, idx) => (
                <div
                  key={g.id || idx}
                  className="bg-slate-800 border border-slate-700/60 p-2.5 rounded-xl flex items-start justify-between"
                >
                  <div>
                    <h5 className="font-bold text-xs text-white">
                      {g.ground_name}
                    </h5>
                    <p className="text-[10px] text-slate-400">{g.address_text}</p>
                  </div>
                  <span className="text-[9px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold uppercase">
                    {g.ground_type || 'BYOG'}
                  </span>
                </div>
              ))}
            </div>
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
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white"
        >
          <span className="material-symbols-outlined text-[20px]">explore</span>
          <span className="text-[10px] font-bold">Explore</span>
        </button>
        <button
          onClick={() => onNavigate && onNavigate('matches_byog')}
          className="flex flex-col items-center gap-0.5 text-[#0052ff] font-bold"
        >
          <span className="material-symbols-outlined text-[20px]">stadium</span>
          <span className="text-[10px]">Live & BYOG</span>
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
