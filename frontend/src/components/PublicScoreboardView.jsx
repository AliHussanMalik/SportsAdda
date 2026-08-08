import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Tv, Radio, Flame, Shield, Award, Activity, Zap } from 'lucide-react';

export default function PublicScoreboardView({ activeMatchId }) {
  const [liveData, setLiveData] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      setConnected(true);
      if (activeMatchId) socket.emit('join_match', activeMatchId);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('score_update', (data) => {
      setLiveData(data);
    });

    return () => {
      if (activeMatchId) socket.emit('leave_match', activeMatchId);
      socket.disconnect();
    };
  }, [activeMatchId]);

  // Initial fetch
  useEffect(() => {
    if (activeMatchId) {
      fetch(`/api/scoring/${activeMatchId}/events`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setLiveData(data);
        })
        .catch((e) => console.error(e));
    }
  }, [activeMatchId]);

  if (!liveData) {
    return (
      <div className="glass-panel" style={{ padding: '64px 36px', textAlign: 'center', margin: '40px auto', maxWidth: '640px', borderRadius: '24px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          boxShadow: '0 0 24px rgba(16, 185, 129, 0.25)'
        }}>
          <Tv size={36} style={{ color: '#10b981' }} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '10px', letterSpacing: '-0.02em' }}>
          Live Stadium Spectator Screen
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
          {activeMatchId ? 'Establishing real-time WebSocket stadium feed connection...' : 'No active match selected. Select a live match in the Scorer Console to activate stadium spectator mode.'}
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          <Radio size={14} style={{ color: '#10b981' }} />
          <span>WebSocket Broadcast Standby</span>
        </div>
      </div>
    );
  }

  const { match, events, scores } = liveData;

  return (
    <div style={{ padding: '16px 0 32px 0' }}>
      {/* Stadium Broadcast Score Board Header */}
      <div
        className="glass-panel glow-box"
        style={{
          padding: '36px 40px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(11, 15, 25, 0.98))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.06em' }}>
            <span className="pulse-live"></span> STADIUM BROADCAST FEED
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              {match.sport_type || 'FUTSAL'} MATCH
            </span>
            <div style={{ fontSize: '0.75rem', color: connected ? '#10b981' : '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={13} /> {connected ? 'LIVE WEBSOCKET ACTIVE' : 'DISCONNECTED'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '32px' }}>
          {/* Team A */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {match.team_a_logo ? (
              <img src={match.team_a_logo} alt={match.team_a_name} style={{ width: '88px', height: '88px', borderRadius: '24px', objectFit: 'cover', border: '2px solid rgba(16, 185, 129, 0.4)', marginBottom: '14px', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)' }} />
            ) : (
              <div style={{ width: '88px', height: '88px', borderRadius: '24px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '14px', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}>
                {match.team_a_name ? match.team_a_name.substring(0, 2).toUpperCase() : 'TA'}
              </div>
            )}
            <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }}>{match.team_a_name}</h2>
            <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#10b981', fontFamily: 'Outfit', lineHeight: 1, textShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }}>
              {scores.team_a_score}
            </div>
          </div>

          {/* Center VS Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '8px 18px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-color)', fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-muted)' }}>
              VS
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              {match.status || 'IN_PROGRESS'}
            </div>
          </div>

          {/* Team B */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {match.team_b_logo ? (
              <img src={match.team_b_logo} alt={match.team_b_name} style={{ width: '88px', height: '88px', borderRadius: '24px', objectFit: 'cover', border: '2px solid rgba(6, 182, 212, 0.4)', marginBottom: '14px', boxShadow: '0 8px 24px rgba(6, 182, 212, 0.2)' }} />
            ) : (
              <div style={{ width: '88px', height: '88px', borderRadius: '24px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '14px', boxShadow: '0 8px 24px rgba(6, 182, 212, 0.3)' }}>
                {match.team_b_name ? match.team_b_name.substring(0, 2).toUpperCase() : 'TB'}
              </div>
            )}
            <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }}>{match.team_b_name}</h2>
            <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#06b6d4', fontFamily: 'Outfit', lineHeight: 1, textShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }}>
              {scores.team_b_score}
            </div>
          </div>
        </div>
      </div>

      {/* Events Ticker */}
      <div className="glass-panel" style={{ padding: '28px', marginTop: '24px', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flame style={{ color: '#f59e0b' }} size={20} /> Real-Time Match Timeline & Event Log
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem', textAlign: 'center', padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              ⚡ Match underway. Waiting for first event or score update...
            </div>
          ) : (
            [...events].reverse().map((ev) => (
              <div
                key={ev.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: ev.event_type === 'GOAL' || ev.event_type === 'SIX' ? 'rgba(16, 185, 129, 0.2)' : ev.event_type === 'WICKET' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    {ev.event_type === 'GOAL' ? '⚽' : ev.event_type === 'WICKET' ? '🔴' : ev.event_type === 'SIX' ? '🏏' : '⚡'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>{ev.event_type}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{ev.player_name || 'Team Event'}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.88rem', color: '#10b981', fontWeight: 800, background: 'rgba(16, 185, 129, 0.1)', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  ⏱️ {ev.event_time_seconds || 0}s
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

