import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Crown, Award, UserPlus, Sparkles, Activity } from 'lucide-react';

export default function AuthModuleView() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    primary_sport: 'FUTSAL',
    preferred_role: 'Forward',
    jersey_number: 10,
    subscription_tier: 'PRO',
    is_captain: false,
    is_coach: false,
    is_keeper: false,
    keeper_type: 'NONE'
  });

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

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleToggleTier = async (userId, currentTier) => {
    const nextTier = currentTier === 'PRO' ? 'FREE' : 'PRO';
    try {
      const res = await fetch(`/api/auth/profiles/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_tier: nextTier })
      });
      if (res.ok) fetchProfiles();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({
          display_name: '',
          primary_sport: 'FUTSAL',
          preferred_role: 'Forward',
          jersey_number: 10,
          subscription_tier: 'PRO',
          is_captain: false,
          is_coach: false,
          is_keeper: false,
          keeper_type: 'NONE'
        });
        fetchProfiles();
      } else {
        alert(data.error || 'Failed to save player profile');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to backend API');
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck style={{ color: '#10b981' }} /> Auth & Specialized Player Profiles
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage player profiles, specialized role permissions (Captain, Coach, Keeper), and subscription tiers.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={18} /> Create Player Profile
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlgin: 'center', color: 'var(--text-muted)' }}>Loading profiles...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {profiles.map((p) => (
            <div key={p.user_id} className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#fff'
                  }}>
                    #{p.jersey_number || '0'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{p.display_name}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span>{p.primary_sport}</span> • <span>{p.preferred_role}</span>
                    </div>
                  </div>
                </div>

                <span 
                  className={`badge ${p.subscription_tier === 'PRO' ? 'badge-pro' : 'badge-free'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleToggleTier(p.user_id, p.subscription_tier)}
                  title="Click to toggle PRO / FREE tier"
                >
                  <Sparkles size={12} /> {p.subscription_tier}
                </span>
              </div>

              {/* Badges row */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {p.is_captain && (
                  <span className="badge badge-captain" title="Toss rights & Playing XI manager">
                    <Crown size={12} /> Captain
                  </span>
                )}
                {p.is_coach && (
                  <span className="badge badge-coach" title="Tactical formation & notes">
                    <Shield size={12} /> Coach
                  </span>
                )}
                {p.is_keeper && (
                  <span className="badge badge-keeper" title="Dedicated Keeper Stats">
                    <Award size={12} /> {p.keeper_type}
                  </span>
                )}
              </div>

              {/* Keeper Stats Box if Keeper */}
              {p.is_keeper && (
                <div style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginTop: '10px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={14} /> Specialized Keeper Metrics
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{p.total_saves || 0}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Saves</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{p.clean_sheets || 0}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Clean Sheets</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{p.stumpings || p.penalties_saved || 0}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.keeper_type === 'WICKETKEEPER' ? 'Stumpings' : 'Penalties Saved'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal to Create Profile */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
              Add New Player Profile
            </h3>
            <form onSubmit={handleCreateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Display Name</label>
                <input
                  type="text"
                  required
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Primary Sport</label>
                  <select
                    value={formData.primary_sport}
                    onChange={(e) => setFormData({ ...formData, primary_sport: e.target.value })}
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
                    value={formData.jersey_number}
                    onChange={(e) => setFormData({ ...formData, jersey_number: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Role Badges</label>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_captain}
                      onChange={(e) => setFormData({ ...formData, is_captain: e.target.checked })}
                    /> 👑 Captain
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_coach}
                      onChange={(e) => setFormData({ ...formData, is_coach: e.target.checked })}
                    /> 📋 Coach
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_keeper}
                      onChange={(e) => setFormData({
                        ...formData,
                        is_keeper: e.target.checked,
                        keeper_type: e.target.checked ? (formData.primary_sport === 'CRICKET' ? 'WICKETKEEPER' : 'GOALKEEPER') : 'NONE'
                      })}
                    /> 🧤 Keeper
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
