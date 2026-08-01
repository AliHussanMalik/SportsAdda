import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, Trophy, UserPlus, Trash2 } from 'lucide-react';

export default function TeamModuleView() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

  const [newTeamName, setNewTeamName] = useState('');
  const [selectedCaptainId, setSelectedCaptainId] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedRole, setSelectedRole] = useState('PLAYER');

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams');
      const data = await res.json();
      if (data.success) setTeams(data.teams);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllPlayers = async () => {
    try {
      const res = await fetch('/api/auth/profiles');
      const data = await res.json();
      if (data.success) setAllPlayers(data.profiles);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTeamDetails = async (teamId) => {
    try {
      const res = await fetch(`/api/teams/${teamId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedTeam(data.team);
        setTeamDetails(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchAllPlayers();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_name: newTeamName, captain_id: selectedCaptainId || null })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewTeamName('');
        fetchTeams();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPlayerToRoster = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !selectedPlayerId) return;
    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}/roster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: selectedPlayerId, role_in_team: selectedRole })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddPlayerModal(false);
        fetchTeamDetails(selectedTeam.id);
        fetchTeams();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemovePlayer = async (playerId) => {
    if (!selectedTeam) return;
    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}/roster/${playerId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchTeamDetails(selectedTeam.id);
        fetchTeams();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users style={{ color: '#06b6d4' }} /> Team & Roster Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Create sports teams, configure rosters, assign squad roles, and view performance history.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Create New Team
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedTeam ? '1fr 380px' : '1fr', gap: '24px' }}>
        {/* Teams Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {teams.map((t) => (
            <div
              key={t.id}
              className="glass-panel"
              style={{
                padding: '20px',
                cursor: 'pointer',
                border: selectedTeam?.id === t.id ? '2px solid #06b6d4' : '1px solid var(--border-color)',
                boxShadow: selectedTeam?.id === t.id ? '0 0 20px rgba(6, 182, 212, 0.3)' : 'none'
              }}
              onClick={() => fetchTeamDetails(t.id)}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                <img
                  src={t.logo_url}
                  alt={t.team_name}
                  style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#1f2937' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>{t.team_name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Captain: <span style={{ color: '#06b6d4', fontWeight: 600 }}>{t.captain_name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <span>Squad Roster</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{t.roster_count || 0} Players</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Team Roster Panel */}
        {selectedTeam && teamDetails && (
          <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} style={{ color: '#06b6d4' }} /> {selectedTeam.team_name}
              </h3>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setShowAddPlayerModal(true)}>
                <UserPlus size={14} /> Add Player
              </button>
            </div>

            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Squad Roster ({teamDetails.roster.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teamDetails.roster.map((p) => (
                <div
                  key={p.player_id}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{p.display_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      #{p.jersey_number} • {p.preferred_role}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${p.role_in_team === 'CAPTAIN' ? 'badge-captain' : p.role_in_team === 'COACH' ? 'badge-coach' : 'badge-free'}`}>
                      {p.role_in_team}
                    </span>
                    <button
                      onClick={() => handleRemovePlayer(p.player_id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Remove from roster"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Team */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Create New Sports Team</h3>
            <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Team Name</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Thunder Strikers FC"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assign Captain</label>
                <select
                  value={selectedCaptainId}
                  onChange={(e) => setSelectedCaptainId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                >
                  <option value="">Select Captain Profile</option>
                  {allPlayers.map((p) => (
                    <option key={p.user_id} value={p.user_id}>{p.display_name} (#{p.jersey_number})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Player to Roster */}
      {showAddPlayerModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Add Player to {selectedTeam?.team_name}</h3>
            <form onSubmit={handleAddPlayerToRoster} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select Player</label>
                <select
                  required
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                >
                  <option value="">Select Player Profile</option>
                  {allPlayers.map((p) => (
                    <option key={p.user_id} value={p.user_id}>{p.display_name} ({p.primary_sport})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Squad Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                >
                  <option value="PLAYER">PLAYER</option>
                  <option value="CAPTAIN">CAPTAIN</option>
                  <option value="VICE_CAPTAIN">VICE_CAPTAIN</option>
                  <option value="COACH">COACH</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddPlayerModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add to Squad</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
