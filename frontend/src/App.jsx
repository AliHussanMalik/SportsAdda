import React, { useState } from 'react';
import { UserCheck, Users, Calendar, Gamepad2, Tv, Trophy, Zap, Activity } from 'lucide-react';
import AuthModuleView from './components/AuthModuleView';
import TeamModuleView from './components/TeamModuleView';
import BookingModuleView from './components/BookingModuleView';
import ScoringConsoleView from './components/ScoringConsoleView';
import PublicScoreboardView from './components/PublicScoreboardView';
import AwardsAnalyticsView from './components/AwardsAnalyticsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('scoring');
  const [activeMatchId, setActiveMatchId] = useState(null);

  const tabs = [
    { id: 'profiles', label: 'Auth & Profiles', icon: UserCheck },
    { id: 'teams', label: 'Teams & Rosters', icon: Users },
    { id: 'bookings', label: 'Indoor Pitch Booking', icon: Calendar },
    { id: 'scoring', label: 'Scorer Console', icon: Gamepad2 },
    { id: 'viewer', label: 'Live Spectator Screen', icon: Tv },
    { id: 'awards', label: 'Post-Match Awards', icon: Trophy }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Glassmorphic Navigation Bar */}
      <header
        className="glass-panel"
        style={{
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '12px 32px'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              ⚽
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                Sports<span style={{ color: '#10b981' }}>Adda</span>
              </h1>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Indoor Sports Ecosystem
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: 'flex', gap: '8px', background: 'rgba(0, 0, 0, 0.3)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* System DB & WS Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            <span>PostgreSQL: sports_adda</span>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
        {activeTab === 'profiles' && <AuthModuleView />}
        {activeTab === 'teams' && <TeamModuleView />}
        {activeTab === 'bookings' && <BookingModuleView />}
        {activeTab === 'scoring' && (
          <ScoringConsoleView activeMatchId={activeMatchId} setActiveMatchId={setActiveMatchId} />
        )}
        {activeTab === 'viewer' && <PublicScoreboardView activeMatchId={activeMatchId} />}
        {activeTab === 'awards' && <AwardsAnalyticsView activeMatchId={activeMatchId} />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '40px' }}>
        SportsAdda Foundation Core Architecture • Built with Node.js, Express, PostgreSQL, Socket.io & React
      </footer>
    </div>
  );
}
