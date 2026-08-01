import React, { useState, useEffect } from 'react';
import { Gamepad2, RotateCcw, Award, Play, CheckCircle2, ChevronRight, Activity, Flame } from 'lucide-react';

export default function ScoringConsoleView({ activeMatchId, setActiveMatchId }) {
  const [matches, setMatches] = useState([]);
  const [matchDetails, setMatchDetails] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [scores, setScores] = useState({ team_a_score: 0, team_b_score: 0, team_a_wickets: 0, team_b_wickets: 0 });

  const [showTossModal, setShowTossModal] = useState(false);
  const [tossWinnerId, setTossWinnerId] = useState('');
  const [tossDecision, setTossDecision] = useState('KICKOFF');

  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches);
        if (!activeMatchId && data.matches.length > 0) {
          setActiveMatchId(data.matches[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMatchLiveData = async (mId) => {
    if (!mId) return;
    try {
      const res = await fetch(`/api/scoring/${mId}/events`);
      const data = await res.json();
      if (data.success) {
        setMatchDetails(data.match);
        setLiveEvents(data.events || []);
        setScores(data.scores || { team_a_score: 0, team_b_score: 0 });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (activeMatchId) fetchMatchLiveData(activeMatchId);
  }, [activeMatchId]);

  const handleRecordEvent = async (eventType, extraDetails = {}) => {
    if (!activeMatchId) return;
    try {
      const res = await fetch(`/api/scoring/${activeMatchId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          player_id: selectedPlayerId || null,
          event_time_seconds: Math.floor(Date.now() / 1000) % 3600,
          details: { team_id: selectedTeamId || matchDetails?.team_a_id, ...extraDetails }
        })
      });
      const data = await res.json();
      if (data.success) {
        setLiveEvents(data.events);
        setScores(data.scores);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUndo = async () => {
    if (!activeMatchId) return;
    try {
      const res = await fetch(`/api/scoring/${activeMatchId}/undo`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setLiveEvents(data.events);
        setScores(data.scores);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveToss = async (e) => {
    e.preventDefault();
    if (!activeMatchId || !tossWinnerId) return;
    try {
      const res = await fetch(`/api/matches/${activeMatchId}/toss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toss_winner_id: tossWinnerId, toss_decision: tossDecision })
      });
      const data = await res.json();
      if (data.success) {
        setShowTossModal(false);
        fetchMatchLiveData(activeMatchId);
        fetchMatches();
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
            <Gamepad2 style={{ color: '#10b981' }} /> Single-Scorer Real-Time Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            High-speed single-tap match scoring with instant Undo/Rollback and live WebSocket broadcast.
          </p>
        </div>

        {/* Match Fixture Switcher */}
        <select
          value={activeMatchId || ''}
          onChange={(e) => setActiveMatchId(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '12px', background: '#111827', border: '1px solid var(--border-color)', color: '#fff', fontWeight: 700 }}
        >
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.team_a_name} vs {m.team_b_name} ({m.match_status})
            </option>
          ))}
        </select>
      </div>

      {matchDetails && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Main Scoring Console & Live Score Board */}
          <div>
            {/* Score Display Panel */}
            <div className="glass-panel glow-box" style={{ padding: '28px', textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pulse-live"></span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', letterSpacing: '0.05em' }}>LIVE MATCH</span>
              </div>

              {matchDetails.match_status === 'SCHEDULED' && (
                <button
                  className="btn btn-primary"
                  style={{ position: 'absolute', top: '16px', right: '20px', padding: '6px 14px', fontSize: '0.8rem' }}
                  onClick={() => {
                    setTossWinnerId(matchDetails.team_a_id);
                    setShowTossModal(true);
                  }}
                >
                  <Play size={14} /> Start Match & Record Toss
                </button>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
                {/* Team A */}
                <div style={{ textAlign: 'center' }}>
                  <img src={matchDetails.team_a_logo} alt={matchDetails.team_a_name} style={{ width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 8px auto' }} />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{matchDetails.team_a_name}</h3>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981', fontFamily: 'Outfit' }}>
                    {scores.team_a_score} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>({scores.team_a_wickets} w)</span>
                  </div>
                </div>

                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>VS</div>

                {/* Team B */}
                <div style={{ textAlign: 'center' }}>
                  <img src={matchDetails.team_b_logo} alt={matchDetails.team_b_name} style={{ width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 8px auto' }} />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{matchDetails.team_b_name}</h3>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#06b6d4', fontFamily: 'Outfit' }}>
                    {scores.team_b_score} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>({scores.team_b_wickets} w)</span>
                  </div>
                </div>
              </div>

              {matchDetails.toss_winner_name && (
                <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>
                  🪙 Toss won by {matchDetails.toss_winner_name} (Elected to {matchDetails.toss_decision})
                </div>
              )}
            </div>

            {/* Quick Scoring Action Grid */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Single-Scorer Action Pad
                </h4>
                {/* Instant Undo Button */}
                <button className="btn btn-undo" onClick={handleUndo} title="Instant Undo / Rollback last action">
                  <RotateCcw size={16} /> Instant Undo (Rollback)
                </button>
              </div>

              {/* Team Selector & Sport Toggle */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button
                  className="btn"
                  style={{
                    flex: 1,
                    background: selectedTeamId === matchDetails.team_a_id || !selectedTeamId ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: selectedTeamId === matchDetails.team_a_id ? '2px solid #10b981' : '1px solid var(--border-color)',
                    color: '#fff'
                  }}
                  onClick={() => setSelectedTeamId(matchDetails.team_a_id)}
                >
                  Score for {matchDetails.team_a_name}
                </button>
                <button
                  className="btn"
                  style={{
                    flex: 1,
                    background: selectedTeamId === matchDetails.team_b_id ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: selectedTeamId === matchDetails.team_b_id ? '2px solid #06b6d4' : '1px solid var(--border-color)',
                    color: '#fff'
                  }}
                  onClick={() => setSelectedTeamId(matchDetails.team_b_id)}
                >
                  Score for {matchDetails.team_b_name}
                </button>
              </div>

              {/* Action Buttons Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <button className="btn btn-primary" style={{ padding: '16px', fontSize: '1.1rem' }} onClick={() => handleRecordEvent('GOAL')}>
                  ⚽ GOAL (+1)
                </button>
                <button className="btn btn-secondary" style={{ padding: '16px', fontSize: '1.1rem', background: 'rgba(6,182,212,0.15)', color: '#22d3ee' }} onClick={() => handleRecordEvent('RUN', { runs: 1 })}>
                  🏏 1 RUN
                </button>
                <button className="btn btn-secondary" style={{ padding: '16px', fontSize: '1.1rem', background: 'rgba(6,182,212,0.2)', color: '#22d3ee' }} onClick={() => handleRecordEvent('RUN', { runs: 2 })}>
                  🏏 2 RUNS
                </button>
                <button className="btn btn-secondary" style={{ padding: '16px', fontSize: '1.1rem', background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }} onClick={() => handleRecordEvent('RUN', { runs: 4 })}>
                  4️⃣ FOUR
                </button>
                <button className="btn btn-secondary" style={{ padding: '16px', fontSize: '1.1rem', background: 'rgba(245,158,11,0.3)', color: '#f59e0b' }} onClick={() => handleRecordEvent('RUN', { runs: 6 })}>
                  6️⃣ SIX!
                </button>
                <button className="btn btn-danger" style={{ padding: '16px', fontSize: '1.1rem' }} onClick={() => handleRecordEvent('WICKET')}>
                  🔴 WICKET
                </button>
                <button className="btn btn-secondary" style={{ padding: '16px', fontSize: '1.1rem', background: 'rgba(16,185,129,0.15)', color: '#10b981' }} onClick={() => handleRecordEvent('SAVE')}>
                  🧤 SAVE
                </button>
                <button className="btn btn-secondary" style={{ padding: '16px', fontSize: '1.1rem', background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }} onClick={() => handleRecordEvent('STUMPING')}>
                  ⚾ STUMPING
                </button>
              </div>
            </div>
          </div>

          {/* Event Stream Log */}
          <div className="glass-panel" style={{ padding: '20px', height: 'fit-content' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} style={{ color: '#10b981' }} /> Live Event Stream
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
              {liveEvents.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>No events recorded yet.</div>
              ) : (
                [...liveEvents].reverse().map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderLeft: ev.event_type === 'GOAL' ? '4px solid #10b981' : ev.event_type === 'WICKET' ? '4px solid #ef4444' : '4px solid #06b6d4',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>{ev.event_type}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {ev.player_name || 'Player'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                      {ev.event_time_seconds}s
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pre-Match Toss Modal */}
      {showTossModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Pre-Match Toss Setup</h3>
            <form onSubmit={handleSaveToss} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toss Winner</label>
                <select
                  value={tossWinnerId}
                  onChange={(e) => setTossWinnerId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                >
                  <option value={matchDetails?.team_a_id}>{matchDetails?.team_a_name}</option>
                  <option value={matchDetails?.team_b_id}>{matchDetails?.team_b_name}</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toss Decision</label>
                <select
                  value={tossDecision}
                  onChange={(e) => setTossDecision(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                >
                  <option value="KICKOFF">KICKOFF (Futsal)</option>
                  <option value="BAT">BAT FIRST (Cricket)</option>
                  <option value="BOWL">BOWL FIRST (Cricket)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTossModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Start Live Scoring</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
