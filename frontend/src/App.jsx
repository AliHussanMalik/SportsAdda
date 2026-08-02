import React, { useState } from 'react';
import {
  UserCheck,
  Users,
  Calendar,
  Gamepad2,
  Tv,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Database,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import AuthModuleView from './components/AuthModuleView';
import TeamModuleView from './components/TeamModuleView';
import BookingModuleView from './components/BookingModuleView';
import ScoringConsoleView from './components/ScoringConsoleView';
import PublicScoreboardView from './components/PublicScoreboardView';
import AwardsAnalyticsView from './components/AwardsAnalyticsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('scoring');
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navSections = [
    {
      title: 'Core Management',
      items: [
        { id: 'profiles', label: 'Auth & Profiles', icon: UserCheck, desc: 'Player roles & subscription management' },
        { id: 'teams', label: 'Teams & Rosters', icon: Users, desc: 'Squad composition & roster transfers' },
        { id: 'bookings', label: 'Pitch Bookings', icon: Calendar, desc: 'Arena court reservation system' }
      ]
    },
    {
      title: 'Match Engine & Live',
      items: [
        { id: 'scoring', label: 'Scorer Console', icon: Gamepad2, desc: 'Real-time single-tap scoring pad' },
        { id: 'viewer', label: 'Spectator Screen', icon: Tv, desc: 'Live stadium & WebSocket view' },
        { id: 'awards', label: 'Post-Match Awards', icon: Trophy, desc: 'Automated analytics & highlights' }
      ]
    }
  ];

  const activeNavItem = navSections
    .flatMap((sec) => sec.items)
    .find((item) => item.id === activeTab);

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="app-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <div style={{
              minWidth: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}>
              <Trophy size={20} style={{ color: '#fff' }} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  Sports<span style={{ color: '#10b981' }}>Adda</span>
                </h1>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>
                  Indoor Ecosystem
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {navSections.map((sec) => (
            <div key={sec.title} style={{ marginBottom: '16px' }}>
              {!sidebarCollapsed && (
                <div className="sidebar-nav-section">{sec.title}</div>
              )}
              <div className="sidebar-nav-list">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon size={18} style={{ color: isActive ? '#10b981' : undefined, minWidth: '18px' }} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Indicator */}
        {!sidebarCollapsed && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#10b981' }}>
              <Database size={14} />
              <span>PostgreSQL Connected</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              DB: sports_adda • Port: 5000
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className={`app-main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Header Bar */}
        <header className="app-top-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeNavItem?.label}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {activeNavItem?.desc}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <span className="pulse-live" style={{ width: '6px', height: '6px' }}></span>
              <span>System Status: Online</span>
            </div>
          </div>
        </header>

        {/* View Component Container */}
        <main style={{ flex: 1, padding: '24px 32px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
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
        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '16px 32px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          SportsAdda Foundation Core Architecture • Built with Node.js, Express, PostgreSQL, Socket.io & React
        </footer>
      </div>
    </div>
  );
}

