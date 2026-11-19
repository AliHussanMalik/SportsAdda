import React, { useState, useEffect } from 'react';

export default function StitchLeaderboardScreen({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('keepers'); // 'keepers' | 'mvp' | 'teams'
  const [awardsData, setAwardsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        // Attempt to fetch sample match awards or profiles
        const res = await fetch('/api/analytics/awards/m1');
        const data = await res.json();
        if (data.success) {
          setAwardsData(data);
        }
      } catch (err) {
        console.warn('Leaderboard API fallback', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const topKeepers = [
    { name: 'Sameer Khan', role: 'Wicketkeeper / Goalkeeper', saves: 18, stumpings: 6, cleanSheets: 4, team: 'Thunder Strikers' },
    { name: 'Hamza Ali', role: 'Goalkeeper', saves: 14, stumpings: 2, cleanSheets: 3, team: 'Apex Titans' },
    { name: 'Zayn Malik', role: 'Wicketkeeper', saves: 11, stumpings: 8, cleanSheets: 2, team: 'Lahore Warriors' }
  ];

  const topPlayers = [
    { name: 'Alex Striker', goals: 8, runs: 145, mvpScore: 98, role: 'Forward / All-Rounder' },
    { name: 'Bilal Khan', goals: 5, runs: 110, mvpScore: 82, role: 'Midfielder / Bowler' },
    { name: 'Tariq Mahmood', goals: 3, runs: 95, mvpScore: 74, role: 'Defender' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[640px] bg-slate-900 text-white flex flex-col font-sans rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden select-none">
      {/* Header */}
      <header className="px-4 pt-4 pb-2 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
            Analytics & Rankings
          </span>
          <h1 className="text-lg font-extrabold text-white tracking-tight leading-tight">
            Leaderboard & Awards
          </h1>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </header>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-800 p-1 m-3 rounded-xl border border-slate-700">
        <button
          onClick={() => setActiveTab('keepers')}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            activeTab === 'keepers' ? 'bg-[#0052ff] text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          🧤 Keepers
        </button>
        <button
          onClick={() => setActiveTab('mvp')}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            activeTab === 'mvp' ? 'bg-[#0052ff] text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          🏆 MVP Awards
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
            activeTab === 'teams' ? 'bg-[#0052ff] text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          🛡️ Teams
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto px-3 pb-20 space-y-3">
        {activeTab === 'keepers' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-cyan-900/40 to-slate-800 p-3 rounded-2xl border border-cyan-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">sports_handball</span>
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-white">Specialized Keeper Matrix</h3>
                <p className="text-[10px] text-cyan-200/80">
                  Tracking saves, stumpings, catches & clean sheets across PostgreSQL.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {topKeepers.map((k, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : 'bg-amber-700 text-white'
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white">{k.name}</h4>
                      <p className="text-[10px] text-slate-400">{k.team} • {k.role}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-cyan-400 block">
                      {k.saves} Saves / Catches
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {k.stumpings} Stumpings • {k.cleanSheets} CS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mvp' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-amber-900/40 to-slate-800 p-3 rounded-2xl border border-amber-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">workspace_premium</span>
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-white">Post-Match MVP Engine</h3>
                <p className="text-[10px] text-amber-200/80">
                  Automated performance aggregation algorithm based on match events.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {topPlayers.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0052ff]/30 text-[#0052ff] font-black text-xs flex items-center justify-center">
                      ★
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white">{p.name}</h4>
                      <p className="text-[10px] text-slate-400">{p.role}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400 block">
                      {p.mvpScore} MVP Score
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {p.goals} Goals • {p.runs} Runs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-2">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs text-amber-400">#1</span>
                <div>
                  <h4 className="font-extrabold text-xs text-white">Thunder Strikers FC</h4>
                  <p className="text-[10px] text-slate-400">12 Wins • 2 Losses</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400">36 PTS</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs text-slate-300">#2</span>
                <div>
                  <h4 className="font-extrabold text-xs text-white">Apex Titans CC</h4>
                  <p className="text-[10px] text-slate-400">10 Wins • 4 Losses</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400">30 PTS</span>
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
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-white"
        >
          <span className="material-symbols-outlined text-[20px]">stadium</span>
          <span className="text-[10px] font-bold">Live & BYOG</span>
        </button>
        <button
          onClick={() => onNavigate && onNavigate('leaderboard')}
          className="flex flex-col items-center gap-0.5 text-[#0052ff] font-bold"
        >
          <span className="material-symbols-outlined text-[20px]">trophy</span>
          <span className="text-[10px]">Stats</span>
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
