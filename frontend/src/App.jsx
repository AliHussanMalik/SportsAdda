import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Palette
} from 'lucide-react';
import AuthModuleView from './components/AuthModuleView';
import TeamModuleView from './components/TeamModuleView';
import BookingModuleView from './components/BookingModuleView';
import ScoringConsoleView from './components/ScoringConsoleView';
import PublicScoreboardView from './components/PublicScoreboardView';
import AwardsAnalyticsView from './components/AwardsAnalyticsView';
import NotificationBell from './components/NotificationBell';

export default function App() {
  const [activeTab, setActiveTab] = useState('scoring');
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [themeMode, setThemeMode] = useState(localStorage.getItem('sportsadda_theme_mode') || 'dark');
  const [systemDark, setSystemDark] = useState(
    window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true
  );

  const prideThemes = [
    { id: 'red', name: 'Crimson Red', color: '#ef4444', label: '🔴 Red (Life)' },
    { id: 'orange', name: 'Sunset Orange', color: '#f97316', label: '🟠 Orange (Healing)' },
    { id: 'yellow', name: 'Golden Yellow', color: '#eab308', label: '🟡 Yellow (Sunlight)' },
    { id: 'green', name: 'Emerald Green', color: '#10b981', label: '🟢 Green (Nature)' },
    { id: 'blue', name: 'Sapphire Blue', color: '#3b82f6', label: '🔵 Blue (Serenity)' },
    { id: 'purple', name: 'Royal Purple', color: '#8b5cf6', label: '🟣 Purple (Spirit)' },
    { id: 'dark', name: 'Dark Slate', color: '#111827', label: '🌙 Dark Mode' },
    { id: 'light', name: 'Light Clean', color: '#f3f4f6', label: '☀️ Light Mode' }
  ];

  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setSystemDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const activeTheme = themeMode === 'system' ? (systemDark ? 'dark' : 'light') : themeMode;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('sportsadda_theme_mode', themeMode);
  }, [activeTheme, themeMode]);

  const cycleThemeMode = () => {
    setThemeMode((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'colorful';
      if (prev === 'colorful') return 'system';
      return 'dark';
    });
  };

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
      <aside className={`app-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
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
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: 1 }}>
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
                      onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                      title={`${item.label} — ${item.desc}`}
                      aria-label={item.label}
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
        {/* ThemeForest Premium Live Ticker Ribbon */}
        <div className="themeforest-ticker-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 800 }}>
              <span className="pulse-live" style={{ width: '8px', height: '8px' }}></span> LIVE SCOREBOARD
            </span>
            <div className="ticker-item">
              ⚽ <strong>Thunder Strikers 2 - 0 Apex Titans</strong> <span style={{ color: '#10b981' }}>(FUTSAL • LIVE)</span>
            </div>
            <div className="ticker-item">
              🏏 <strong>Karachi Kings 142/3</strong> <span style={{ color: '#f59e0b' }}>(15.4 Overs)</span>
            </div>
            <div className="ticker-item">
              🏸 <strong>Peshawar Smashers 21 - 18</strong> <span style={{ color: '#06b6d4' }}>(Final)</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
            <span>🏟️ Arenas: <strong>12 Live</strong></span>
            <span>👥 Players: <strong>1,420 Active</strong></span>
          </div>
        </div>

        {/* Top Header Bar */}
        <header className="app-top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-menu-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Toggle Mobile Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeNavItem?.label}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {activeNavItem?.desc}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            <NotificationBell userId={currentUser?.user_id} />

            <button
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="theme-toggle-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 700,
                transition: 'all 0.2s ease'
              }}
              title="Select Palette Theme"
              aria-label="Toggle Theme Menu"
            >
              <Palette size={16} style={{ color: prideThemes.find(t => t.id === themeMode)?.color || '#10b981' }} />
              <span>Theme: {prideThemes.find(t => t.id === themeMode)?.name || 'Custom'}</span>
            </button>

            {/* Pride Palette Picker Dropdown */}
            {showThemePicker && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '220px',
                  padding: '12px',
                  borderRadius: '16px',
                  zIndex: 200,
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '8px', paddingLeft: '4px' }}>
                  🏳️‍🌈 Pride & Display Palette
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {prideThemes.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setThemeMode(item.id);
                        setShowThemePicker(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: themeMode === item.id ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        fontWeight: themeMode === item.id ? 800 : 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color, display: 'inline-block' }}></span>
                        {item.name}
                      </span>
                      {themeMode === item.id && <span style={{ fontSize: '0.7rem', color: '#10b981' }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

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

