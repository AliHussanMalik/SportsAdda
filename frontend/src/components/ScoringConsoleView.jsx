import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  RotateCcw,
  Play,
  Activity,
  Shield,
  Trophy,
  Check,
  ArrowRight,
  UserCheck,
  ListOrdered,
  UserX,
  Lock,
  RefreshCw,
  Target
} from 'lucide-react';

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
  const [sportFilter, setSportFilter] = useState('ALL');

  // --- CRICKET EXTENSIONS STATE ---
  const [battingOrder, setBattingOrder] = useState([]);
  const [activeStriker, setActiveStriker] = useState(null);
  const [activeNonStriker, setActiveNonStriker] = useState(null);
  const [nextQueuedBatsman, setNextQueuedBatsman] = useState(null);
  const [showBattingOrderModal, setShowBattingOrderModal] = useState(false);

  // Pre-Match Setup & Coin Toss Modal
  const [showPreSetupModal, setShowPreSetupModal] = useState(false);
  const [totalOversInput, setTotalOversInput] = useState(10);
  const [playingSquadCountInput, setPlayingSquadCountInput] = useState(11);
  const [teamAPlayingIds, setTeamAPlayingIds] = useState([]);
  const [teamBPlayingIds, setTeamBPlayingIds] = useState([]);
  const [isFlippingCoin, setIsFlippingCoin] = useState(false);

  // Bowler & Squad Players State
  const [squadPlayers, setSquadPlayers] = useState({ team_a_players: [], team_b_players: [] });
  const [activeBowlerId, setActiveBowlerId] = useState('');

  // Wicket Dismissal Modal
  const [showDismissalModal, setShowDismissalModal] = useState(false);
  const [dismissalType, setDismissalType] = useState('BOWLED');
  const [dismissedBatsmanId, setDismissedBatsmanId] = useState('');
  const [selectedBowlerId, setSelectedBowlerId] = useState('');
  const [selectedFielderId, setSelectedFielderId] = useState('');

  // Dual Captain Verification
  const [verification, setVerification] = useState({
    interval_type: 'EACH_OVER',
    captain_a_confirmed: false,
    captain_b_confirmed: false,
    status: 'CONFIRMED'
  });

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
        if (!selectedTeamId && data.match) {
          setSelectedTeamId(data.match.team_a_id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBattingOrder = async (mId, teamId) => {
    if (!mId || !teamId) return;
    try {
      const res = await fetch(`/api/scoring/${mId}/batting-order?team_id=${teamId}`);
      const data = await res.json();
      if (data.success) {
        setBattingOrder(data.battingOrder || []);
        setActiveStriker(data.activeStriker || null);
        setActiveNonStriker(data.activeNonStriker || null);
        setNextQueuedBatsman(data.nextQueuedBatsman || null);
        if (data.activeStriker) setDismissedBatsmanId(data.activeStriker.player_id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSquadPlayers = async (mId) => {
    if (!mId) return;
    try {
      const res = await fetch(`/api/scoring/${mId}/squad-players`);
      const data = await res.json();
      if (data.success) {
        setSquadPlayers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVerificationStatus = async (mId) => {
    if (!mId) return;
    try {
      const res = await fetch(`/api/scoring/${mId}/verification-status`);
      const data = await res.json();
      if (data.success) {
        setVerification(data.verification);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (activeMatchId) {
      fetchMatchLiveData(activeMatchId);
      fetchSquadPlayers(activeMatchId);
      fetchVerificationStatus(activeMatchId);
    }
  }, [activeMatchId]);

  useEffect(() => {
    if (activeMatchId && selectedTeamId) {
      fetchBattingOrder(activeMatchId, selectedTeamId);
    }
  }, [activeMatchId, selectedTeamId]);

  const handleSwapStrike = async () => {
    if (!activeMatchId || !selectedTeamId) return;
    try {
      const res = await fetch(`/api/scoring/${activeMatchId}/swap-strike`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: selectedTeamId })
      });
      const data = await res.json();
      if (data.success) {
        fetchBattingOrder(activeMatchId, selectedTeamId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecordEvent = async (eventType, extraDetails = {}) => {
    if (!activeMatchId) return;
    const targetTeamId = selectedTeamId || matchDetails?.team_a_id;
    try {
      const res = await fetch(`/api/scoring/${activeMatchId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          player_id: activeStriker ? activeStriker.player_id : selectedPlayerId || null,
          event_time_seconds: Math.floor(Date.now() / 1000) % 3600,
          details: { team_id: targetTeamId, bowler_id: activeBowlerId || null, ...extraDetails }
        })
      });
      const data = await res.json();
      if (data.success) {
        setLiveEvents(data.events);
        setScores(data.scores);
        fetchVerificationStatus(activeMatchId);

        // Auto rotate strike on 1 RUN or 3 RUNS
        if (extraDetails.runs === 1 || extraDetails.runs === 3) {
          handleSwapStrike();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleWicketSubmit = async (e) => {
    e.preventDefault();
    if (!activeMatchId || !selectedTeamId) return;
    const targetDismissedId = dismissedBatsmanId || activeStriker?.player_id;
    if (!targetDismissedId) return;

    try {
      const res = await fetch(`/api/scoring/${activeMatchId}/wicket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: selectedTeamId,
          dismissed_player_id: targetDismissedId,
          dismissal_type: dismissalType,
          bowler_id: selectedBowlerId || activeBowlerId || null,
          fielder_id: selectedFielderId || null,
          event_time_seconds: Math.floor(Date.now() / 1000) % 3600
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowDismissalModal(false);
        setLiveEvents(data.events || liveEvents);
        setScores(data.scores || scores);
        fetchBattingOrder(activeMatchId, selectedTeamId);
        fetchVerificationStatus(activeMatchId);
      } else {
        alert(data.error || 'Cannot record wicket');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFlipCoin = () => {
    setIsFlippingCoin(true);
    setTimeout(() => {
      const winner = Math.random() > 0.5 ? matchDetails?.team_a_id : matchDetails?.team_b_id;
      setTossWinnerId(winner);
      setIsFlippingCoin(false);
    }, 1200);
  };

  const handlePreSetupSubmit = async (e) => {
    e.preventDefault();
    if (!activeMatchId) return;
    try {
      const res = await fetch(`/api/scoring/${activeMatchId}/pre-setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_overs: parseInt(totalOversInput) || 10,
          playing_squad_count: parseInt(playingSquadCountInput) || 11,
          toss_winner_id: tossWinnerId || matchDetails?.team_a_id,
          toss_decision: tossDecision,
          team_a_playing_ids: teamAPlayingIds,
          team_b_playing_ids: teamBPlayingIds
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowPreSetupModal(false);
        fetchMatchLiveData(activeMatchId);
        fetchMatches();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveBattingOrder = async () => {
    if (!activeMatchId || !selectedTeamId) return;
    try {
      const res = await fetch(`/api/scoring/${activeMatchId}/batting-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: selectedTeamId,
          order: battingOrder.map((item, idx) => ({
            player_id: item.player_id,
            batting_position: idx + 1,
            is_extra_player: item.is_extra_player || false,
            status: item.status || 'QUEUED'
          }))
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowBattingOrderModal(false);
        fetchBattingOrder(activeMatchId, selectedTeamId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCaptainVerify = async (captainTeamRole) => {
    if (!activeMatchId) return;
    try {
      const res = await fetch(`/api/scoring/${activeMatchId}/verify-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captain_team_role: captainTeamRole })
      });
      const data = await res.json();
      if (data.success) {
        setVerification(data.verification);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateInterval = async (intervalType) => {
    if (!activeMatchId) return;
    try {
      const res = await fetch(`/api/scoring/${activeMatchId}/verification-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval_type: intervalType })
      });
      const data = await res.json();
      if (data.success) {
        setVerification(data.verification);
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
        if (selectedTeamId) fetchBattingOrder(activeMatchId, selectedTeamId);
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

  const isTeamASelected = selectedTeamId === matchDetails?.team_a_id || !selectedTeamId;
  const isTeamBSelected = selectedTeamId === matchDetails?.team_b_id;

  // Fielding team players for Bowler selection
  const fieldingTeamPlayers = isTeamASelected ? squadPlayers.team_b_players : squadPlayers.team_a_players;
  const battingTeamPlayers = isTeamASelected ? squadPlayers.team_a_players : squadPlayers.team_b_players;

  return (
    <div style={{ padding: '12px 0' }}>
      {/* Top Match Fixture Switcher Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gamepad2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
                Single-Scorer Match Engine
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                Instant single-tap event recorder with live WebSocket sync & rollback capabilities
              </p>
            </div>
          </div>
        </div>

        {/* Match Select Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Active Match:</label>
          <select
            value={activeMatchId || ''}
            onChange={(e) => {
              setActiveMatchId(e.target.value);
              setSelectedTeamId('');
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              background: '#0d121e',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.team_a_name} vs {m.team_b_name} ({m.sport_type || 'Match'} • {m.match_status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {matchDetails && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          {/* Left Column: Match Scoreboard & Scoring Action Pad */}
          <div>
            {/* Live Match Scoreboard Banner */}
            <div className="glass-panel glow-box" style={{ padding: '24px', textAlign: 'center', marginBottom: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pulse-live"></span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', letterSpacing: '0.05em' }}>LIVE MATCH CONSOLE</span>
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
                  <Play size={14} /> Record Toss & Start
                </button>
              )}

              {/* Teams & Live Score Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '20px', marginTop: '14px' }}>
                {/* Team A Display */}
                <div
                  onClick={() => setSelectedTeamId(matchDetails.team_a_id)}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    background: isTeamASelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                    border: isTeamASelected ? '2px solid #10b981' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img src={matchDetails.team_a_logo} alt={matchDetails.team_a_name} style={{ width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 8px auto' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{matchDetails.team_a_name}</h3>
                  <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#10b981', fontFamily: 'Outfit', lineHeight: 1, marginTop: '4px' }}>
                    {scores.team_a_score} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>({scores.team_a_wickets} w)</span>
                  </div>
                  {isTeamASelected && (
                    <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Active Scoring Target
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-muted)' }}>VS</div>

                {/* Team B Display */}
                <div
                  onClick={() => setSelectedTeamId(matchDetails.team_b_id)}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    background: isTeamBSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255,255,255,0.02)',
                    border: isTeamBSelected ? '2px solid #06b6d4' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img src={matchDetails.team_b_logo} alt={matchDetails.team_b_name} style={{ width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 8px auto' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{matchDetails.team_b_name}</h3>
                  <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#06b6d4', fontFamily: 'Outfit', lineHeight: 1, marginTop: '4px' }}>
                    {scores.team_b_score} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>({scores.team_b_wickets} w)</span>
                  </div>
                  {isTeamBSelected && (
                    <div style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 800, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Active Scoring Target
                    </div>
                  )}
                </div>
              </div>

              {matchDetails.toss_winner_name && (
                <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>
                  Toss won by {matchDetails.toss_winner_name} (Elected to {matchDetails.toss_decision})
                </div>
              )}
            </div>

            {/* Active Batsmen & Bowler Manager Panel */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ListOrdered size={16} style={{ color: '#10b981' }} /> Active Batsmen & Bowler Manager
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                    onClick={handleSwapStrike}
                    title="Swap striker and non-striker ends"
                  >
                    <RefreshCw size={14} /> Swap Strike
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => setShowBattingOrderModal(true)}
                  >
                    Configure Batting Order & Extra Players
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* Current Striker */}
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Target size={12} /> Active Striker (On Strike)
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>
                    {activeStriker ? activeStriker.player_name : 'Not Assigned'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Position #{activeStriker?.batting_position || 1}
                  </div>
                </div>

                {/* Non-Striker */}
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Non-Striker</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>
                    {activeNonStriker ? activeNonStriker.player_name : 'Not Assigned'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Position #{activeNonStriker?.batting_position || 2}
                  </div>
                </div>

                {/* Active Bowler Selector */}
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 800, textTransform: 'uppercase' }}>Active Bowler</div>
                  <select
                    value={activeBowlerId}
                    onChange={(e) => {
                      setActiveBowlerId(e.target.value);
                      setSelectedBowlerId(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: '#0d121e',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      border: '1px solid rgba(6, 182, 212, 0.4)',
                      marginTop: '6px'
                    }}
                  >
                    <option value="">-- Select Active Bowler --</option>
                    {fieldingTeamPlayers.map((p) => (
                      <option key={p.user_id} value={p.user_id}>
                        {p.display_name} ({p.preferred_role || 'Bowler'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Categorized Single-Scorer Action Pad */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              {/* Action Pad Header & Filter Tabs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Scoring Controls • Scoring for <span style={{ color: isTeamASelected ? '#10b981' : '#06b6d4' }}>{isTeamASelected ? matchDetails.team_a_name : matchDetails.team_b_name}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Sport Filter Tabs */}
                  <div className="action-tab-group">
                    <button
                      className={`action-tab-btn ${sportFilter === 'ALL' ? 'active' : ''}`}
                      onClick={() => setSportFilter('ALL')}
                    >
                      All Actions
                    </button>
                    <button
                      className={`action-tab-btn ${sportFilter === 'FUTSAL' ? 'active' : ''}`}
                      onClick={() => setSportFilter('FUTSAL')}
                    >
                      Futsal / Football
                    </button>
                    <button
                      className={`action-tab-btn ${sportFilter === 'CRICKET' ? 'active' : ''}`}
                      onClick={() => setSportFilter('CRICKET')}
                    >
                      Cricket
                    </button>
                  </div>

                  {/* Isolated Instant Undo Button */}
                  <button className="btn btn-undo" onClick={handleUndo} title="Rollback last recorded event">
                    <RotateCcw size={16} /> Undo
                  </button>
                </div>
              </div>

              {/* Categorized Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. Goals & Runs (Primary Scoring) */}
                {(sportFilter === 'ALL' || sportFilter === 'FUTSAL' || sportFilter === 'CRICKET') && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                      Points & Runs
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                      {(sportFilter === 'ALL' || sportFilter === 'FUTSAL') && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '18px 12px', fontSize: '1.05rem', fontWeight: 800 }}
                          onClick={() => handleRecordEvent('GOAL')}
                        >
                          GOAL (+1)
                        </button>
                      )}

                      {(sportFilter === 'ALL' || sportFilter === 'CRICKET') && (
                        <>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '18px 12px', fontSize: '1.05rem', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)' }}
                            onClick={() => handleRecordEvent('RUN', { runs: 1 })}
                          >
                            1 RUN (Swap Strike)
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '18px 12px', fontSize: '1.05rem', background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.4)' }}
                            onClick={() => handleRecordEvent('RUN', { runs: 2 })}
                          >
                            2 RUNS
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '18px 12px', fontSize: '1.05rem', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}
                            onClick={() => handleRecordEvent('RUN', { runs: 4 })}
                          >
                            FOUR (4)
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '18px 12px', fontSize: '1.05rem', background: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.5)' }}
                            onClick={() => handleRecordEvent('RUN', { runs: 6 })}
                          >
                            SIX (6)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Dismissals & Goalkeeping */}
                {(sportFilter === 'ALL' || sportFilter === 'CRICKET' || sportFilter === 'FUTSAL') && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                      Dismissals & Goalkeeping
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                      {(sportFilter === 'ALL' || sportFilter === 'CRICKET') && (
                        <button
                          className="btn btn-danger"
                          style={{ padding: '16px 12px', fontSize: '1rem', fontWeight: 800 }}
                          onClick={() => {
                            if (activeStriker) setDismissedBatsmanId(activeStriker.player_id);
                            setSelectedBowlerId(activeBowlerId);
                            setShowDismissalModal(true);
                          }}
                        >
                          WICKET (OUT)
                        </button>
                      )}

                      {(sportFilter === 'ALL' || sportFilter === 'CRICKET') && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '16px 12px', fontSize: '1rem', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                          onClick={() => {
                            setDismissalType('STUMPED');
                            if (activeStriker) setDismissedBatsmanId(activeStriker.player_id);
                            setSelectedBowlerId(activeBowlerId);
                            setShowDismissalModal(true);
                          }}
                        >
                          STUMPING
                        </button>
                      )}

                      {(sportFilter === 'ALL' || sportFilter === 'FUTSAL') && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '16px 12px', fontSize: '1rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                          onClick={() => handleRecordEvent('SAVE')}
                        >
                          GOALKEEPER SAVE
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Dual Captain Verification & Live Event Stream Log */}
          <div>
            {/* Dual Captain Verification Card */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} style={{ color: '#f59e0b' }} /> Dual Captain Verification
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Interval:
                <select
                  value={verification.interval_type}
                  onChange={(e) => handleUpdateInterval(e.target.value)}
                  style={{ marginLeft: '6px', padding: '4px 8px', borderRadius: '6px', background: '#0d121e', color: '#fff', border: '1px solid var(--border-color)' }}
                >
                  <option value="EACH_BALL">Each Ball</option>
                  <option value="EACH_OVER">Each Over</option>
                  <option value="EVERY_2_OVERS">Every 2 Overs</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <button
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px',
                    background: verification.captain_a_confirmed ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                    color: verification.captain_a_confirmed ? '#10b981' : '#fff'
                  }}
                  onClick={() => handleCaptainVerify('TEAM_A')}
                >
                  {verification.captain_a_confirmed ? '✓ Captain A Signed Off' : 'Confirm Score (Captain A)'}
                </button>

                <button
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px',
                    background: verification.captain_b_confirmed ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                    color: verification.captain_b_confirmed ? '#10b981' : '#fff'
                  }}
                  onClick={() => handleCaptainVerify('TEAM_B')}
                >
                  {verification.captain_b_confirmed ? '✓ Captain B Signed Off' : 'Confirm Score (Captain B)'}
                </button>
              </div>

              <div style={{ marginTop: '10px', fontSize: '0.75rem', textAlign: 'center', color: verification.status === 'CONFIRMED' ? '#10b981' : '#f59e0b' }}>
                Status: {verification.status}
              </div>
            </div>

            {/* Live Event Stream Log */}
            <div className="glass-panel" style={{ padding: '20px', height: 'fit-content' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} style={{ color: '#10b981' }} /> Live Event Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                {liveEvents.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
                    No match events recorded yet.
                  </div>
                ) : (
                  [...liveEvents].reverse().map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderLeft: ev.event_type === 'GOAL' ? '4px solid #10b981' : ev.event_type === 'WICKET' ? '4px solid #ef4444' : '4px solid #06b6d4',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>{ev.event_type}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {ev.player_name || 'Team Player'}
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
        </div>
      )}

      {/* Wicket Dismissal Details Modal */}
      {showDismissalModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Wicket Dismissal Details</h3>
            <form onSubmit={handleWicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dismissal Type</label>
                <select
                  value={dismissalType}
                  onChange={(e) => setDismissalType(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                >
                  <option value="BOWLED">BOWLED</option>
                  <option value="LBW">LBW</option>
                  <option value="CATCH">CATCH OUT</option>
                  <option value="RUN_OUT">RUN OUT</option>
                  <option value="STUMPED">STUMPED</option>
                  <option value="HIT_WICKET">HIT WICKET</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dismissed Batsman</label>
                <select
                  value={dismissedBatsmanId}
                  onChange={(e) => setDismissedBatsmanId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                >
                  {battingOrder.map((b) => (
                    <option key={b.player_id} value={b.player_id}>
                      Position #{b.batting_position}: {b.player_name} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bowler</label>
                <select
                  value={selectedBowlerId}
                  onChange={(e) => setSelectedBowlerId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                >
                  <option value="">-- Select Bowler --</option>
                  {fieldingTeamPlayers.map((p) => (
                    <option key={p.user_id} value={p.user_id}>
                      {p.display_name} ({p.preferred_role || 'Bowler'})
                    </option>
                  ))}
                </select>
              </div>

              {(dismissalType === 'CATCH' || dismissalType === 'RUN_OUT' || dismissalType === 'STUMPED') && (
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fielder (Catcher / Run-Out)</label>
                  <select
                    value={selectedFielderId}
                    onChange={(e) => setSelectedFielderId(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                  >
                    <option value="">-- Select Fielder --</option>
                    {fieldingTeamPlayers.map((p) => (
                      <option key={p.user_id} value={p.user_id}>
                        {p.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDismissalModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Confirm Wicket & Rotate Striker</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Captain Batting Order Setup Modal */}
      {showBattingOrderModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Squad Batting Order & Extra Players</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Arrange batting sequence positions (1 to N). Mark bench players as Extra Players to exclude them from automatic Wicket rotation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto', marginBottom: '20px' }}>
              {battingOrder.map((item, idx) => (
                <div
                  key={item.player_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 900, color: '#10b981', fontSize: '0.9rem', minWidth: '24px' }}>#{idx + 1}</span>
                    <div>
                      <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>{item.player_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {item.status}</div>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={item.is_extra_player || false}
                      onChange={(e) => {
                        const updated = [...battingOrder];
                        updated[idx].is_extra_player = e.target.checked;
                        setBattingOrder(updated);
                      }}
                    />
                    Mark as Extra Player
                  </label>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowBattingOrderModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveBattingOrder}>Save Batting Order</button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Match Setup & Coin Toss Wizard Modal */}
      {showPreSetupModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '28px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy style={{ color: '#f59e0b' }} /> Pre-Match Setup & Coin Toss Wizard
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Captains configure playing squad vs reserves, total match overs, coin toss decision, and batting/bowling orders.
            </p>

            <form onSubmit={handlePreSetupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Overs & Squad Count Input */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Total Overs</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={totalOversInput}
                    onChange={(e) => setTotalOversInput(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Playing Squad Count</label>
                  <input
                    type="number"
                    min="2"
                    max="15"
                    value={playingSquadCountInput}
                    onChange={(e) => setPlayingSquadCountInput(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Max Wickets Cap</label>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 800, marginTop: '4px', textAlign: 'center' }}>
                    {Math.max(1, (parseInt(playingSquadCountInput) || 11) - 1)} Wickets
                  </div>
                </div>
              </div>

              {/* Coin Toss Section */}
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>🪙 Virtual Coin Toss</span>
                  <button type="button" className="btn btn-secondary" onClick={handleFlipCoin} disabled={isFlippingCoin} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    {isFlippingCoin ? 'Flipping...' : '🔄 Flip Coin'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toss Winner</label>
                    <select
                      value={tossWinnerId}
                      onChange={(e) => setTossWinnerId(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '2px' }}
                    >
                      <option value={matchDetails?.team_a_id}>{matchDetails?.team_a_name}</option>
                      <option value={matchDetails?.team_b_id}>{matchDetails?.team_b_name}</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toss Decision</label>
                    <select
                      value={tossDecision}
                      onChange={(e) => setTossDecision(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#111827', color: '#fff', marginTop: '2px' }}
                    >
                      <option value="BAT">🏏 Bat First</option>
                      <option value="BOWL">⚾ Bowl First</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Roster & Reserve Selections */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>{matchDetails?.team_a_name} Squad</h4>
                  <div style={{ maxHeight: '140px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px' }}>
                    {squadPlayers.team_a_players.map((p) => (
                      <label key={p.user_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#fff', marginBottom: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={teamAPlayingIds.includes(p.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) setTeamAPlayingIds([...teamAPlayingIds, p.user_id]);
                            else setTeamAPlayingIds(teamAPlayingIds.filter(id => id !== p.user_id));
                          }}
                        />
                        {p.display_name} ({p.preferred_role || 'Player'})
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>{matchDetails?.team_b_name} Squad</h4>
                  <div style={{ maxHeight: '140px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px' }}>
                    {squadPlayers.team_b_players.map((p) => (
                      <label key={p.user_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#fff', marginBottom: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={teamBPlayingIds.includes(p.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) setTeamBPlayingIds([...teamBPlayingIds, p.user_id]);
                            else setTeamBPlayingIds(teamBPlayingIds.filter(id => id !== p.user_id));
                          }}
                        />
                        {p.display_name} ({p.preferred_role || 'Player'})
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPreSetupModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">🚀 Save Setup & Start Match</button>
              </div>
            </form>
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
