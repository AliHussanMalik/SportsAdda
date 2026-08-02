import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Crown, Award, LogIn, LogOut, KeyRound, Sparkles, Activity, Lock, User } from 'lucide-react';

export default function AuthModuleView() {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('sportsadda_token') || null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab mode for unauthenticated users ('login' or 'register')
  const [mode, setMode] = useState('login');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Credentials
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [primarySport, setPrimarySport] = useState('FUTSAL');
  const [jerseyNumber, setJerseyNumber] = useState(10);

  // Edit My Profile state
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editJersey, setEditJersey] = useState(10);

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/auth/profiles');
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async (token) => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem('sportsadda_token');
        setAccessToken(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfiles();
    if (accessToken) {
      fetchCurrentUser(accessToken);
    }
  }, [accessToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!displayName || !password) {
      setErrorMessage('Please enter your Name and Password');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: displayName, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('sportsadda_token', data.accessToken);
        setAccessToken(data.accessToken);
        setCurrentUser(data.user);
        setDisplayName('');
        setPassword('');
        fetchProfiles();
      } else {
        setErrorMessage(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to backend server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!displayName || displayName.trim().length < 2) {
      setErrorMessage('Display Name must be at least 2 characters');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          password: password,
          primary_sport: primarySport,
          jersey_number: parseInt(jerseyNumber) || 10
        })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('sportsadda_token', data.accessToken);
        setAccessToken(data.accessToken);
        setCurrentUser(data.user);
        setDisplayName('');
        setPassword('');
        fetchProfiles();
      } else {
        setErrorMessage(data.error || 'Registration failed');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to backend server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sportsadda_token');
    setAccessToken(null);
    setCurrentUser(null);
  };

  const handleSaveOwnProfile = async (e) => {
    e.preventDefault();
    if (!currentUser || !accessToken) return;
    try {
      const res = await fetch(`/api/auth/profiles/${currentUser.user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          display_name: editName,
          jersey_number: parseInt(editJersey) || currentUser.jersey_number
        })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.profile);
        setEditMode(false);
        fetchProfiles();
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (err) {
      alert('Error updating profile');
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck style={{ color: '#10b981' }} /> Player Authentication & Profiles
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Simple Name + Password Login, Google Password Manager integration, and profile ownership controls.
          </p>
        </div>
        {currentUser && (
          <button className="btn btn-secondary" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
            <LogOut size={16} /> Log Out ({currentUser.display_name})
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* If NOT logged in: Show Log In / Sign Up Card Form              */}
      {/* ------------------------------------------------------------- */}
      {!currentUser ? (
        <div style={{ maxWidth: '460px', margin: '0 auto 36px auto' }} className="glass-panel" style={{ padding: '28px', borderRadius: '20px', maxWidth: '480px', margin: '0 auto 36px auto' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'login' ? '#10b981' : 'transparent',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <LogIn size={16} /> Log In
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'register' ? '#10b981' : 'transparent',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <UserPlus size={16} /> Sign Up
            </button>
          </div>

          {errorMessage && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', borderLeft: '4px solid #ef4444', color: '#f87171', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Display Name / User Name
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="e.g. Cristiano Ronaldo"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> Password
              </label>
              <input
                type="password"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
              />
            </div>

            {mode === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Primary Sport</label>
                  <select
                    value={primarySport}
                    onChange={(e) => setPrimarySport(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                  >
                    <option value="FUTSAL">Futsal ⚽</option>
                    <option value="CRICKET">Indoor Cricket 🏏</option>
                    <option value="PADEL">Padel 🎾</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Jersey Number</label>
                  <input
                    type="number"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '8px', padding: '12px' }}>
              {submitting ? 'Authenticating...' : mode === 'login' ? '🔑 Sign In to Account' : '🚀 Create Account'}
            </button>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px', fontStyle: 'italic' }}>
              💡 Password will be saved automatically by your browser or Google Password Manager.
            </div>
          </form>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* If LOGGED IN: Show My Profile & Ownership Controls            */
        /* ------------------------------------------------------------- */
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '2px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#fff'
              }}>
                #{currentUser.jersey_number || 10}
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  {currentUser.display_name} <span style={{ fontSize: '0.85rem', color: '#10b981', marginLeft: '6px' }}>(Your Account)</span>
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                  <span>{currentUser.primary_sport}</span> • <span>{currentUser.preferred_role || 'Player'}</span>
                </div>
              </div>
            </div>

            <span className={`badge ${currentUser.subscription_tier === 'PRO' ? 'badge-pro' : 'badge-free'}`}>
              <Sparkles size={12} /> {currentUser.subscription_tier}
            </span>
          </div>

          {editMode ? (
            <form onSubmit={handleSaveOwnProfile} style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Display Name"
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
              />
              <input
                type="number"
                value={editJersey}
                onChange={(e) => setEditJersey(e.target.value)}
                placeholder="Jersey #"
                style={{ width: '80px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff' }}
              />
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
            </form>
          ) : (
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => { setEditName(currentUser.display_name); setEditJersey(currentUser.jersey_number); setEditMode(true); }}>
                ✏️ Edit My Profile
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Public Players Directory (Read-Only View for Other Players)    */}
      {/* ------------------------------------------------------------- */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
        👥 Registered Players Directory ({profiles.length})
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
        (You can view all registered players below. Profile modifications are only allowed for your own account.)
      </p>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading profiles...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {profiles.map((p) => {
            const isSelf = currentUser && currentUser.user_id === p.user_id;
            return (
              <div key={p.user_id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: isSelf ? '2px solid #10b981' : '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: isSelf ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#fff'
                    }}>
                      #{p.jersey_number || '0'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                        {p.display_name} {isSelf && <span style={{ fontSize: '0.75rem', color: '#10b981' }}>(You)</span>}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.primary_sport} • {p.preferred_role || 'Player'}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${p.subscription_tier === 'PRO' ? 'badge-pro' : 'badge-free'}`}>
                    {p.subscription_tier}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {p.is_captain && <span className="badge badge-captain"><Crown size={12} /> Captain</span>}
                  {p.is_coach && <span className="badge badge-coach"><Shield size={12} /> Coach</span>}
                  {p.is_keeper && <span className="badge badge-keeper"><Award size={12} /> {p.keeper_type}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
