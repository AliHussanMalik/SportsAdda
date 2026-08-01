import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Tv, Radio, Flame, Shield, Award } from 'lucide-react';

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
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Connecting to WebSocket Live Broadcast...
      </div>
    );
  }

  const { match, events, scores } = liveData;

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Broadcast Banner Header */}
      <div
        className="glass-panel glow-box"
        style={{
          padding: '32px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(17, 24, 39, 0.95))',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
            <Radio className="pulse-live" size={16} /> LIVE STADIUM BROADCAST
          </div>
          <div style={{ fontSize: '0.75rem', color: connected ? '#10b981' : '#ef4444', fontWeight: 700 }}>
            {connected ? '● WEBSOCKET CONNECTED' : '○ DISCONNECTED'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '24px' }}>
          {/* Team A */}
          <div>
            <img src={match.team_a_logo} alt={match.team_a_name} style={{ width: '80px', height: '80px', borderRadius: '20px', margin: '0 auto 12px auto' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{match.team_a_name}</h2>
            <div style={{ fontSize: '4rem', fontWeight: 900, color: '#10b981', fontFamily: 'Outfit', lineHeight: 1 }}>
              {scores.team_a_score}
            </div>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-muted)' }}>VS</div>

          {/* Team B */}
          <div>
            <img src={match.team_b_logo} alt={match.team_b_name} style={{ width: '80px', height: '80px', borderRadius: '20px', margin: '0 auto 12px auto' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{match.team_b_name}</h2>
            <div style={{ fontSize: '4rem', fontWeight: 900, color: '#06b6d4', fontFamily: 'Outfit', lineHeight: 1 }}>
              {scores.team_b_score}
            </div>
          </div>
        </div>
      </div>

      {/* Events Ticker */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame style={{ color: '#f59e0b' }} /> Live Match Feed
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {events.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Match underway. Waiting for first event...</div>
          ) : (
            [...events].reverse().map((ev) => (
              <div
                key={ev.id}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.2rem' }}>
                    {ev.event_type === 'GOAL' ? '⚽' : ev.event_type === 'WICKET' ? '🔴' : '⚡'}
                  </span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{ev.event_type}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.player_name || 'Team Action'}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
                  {ev.event_time_seconds}s
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
