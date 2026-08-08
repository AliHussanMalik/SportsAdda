import React, { useState, useEffect } from 'react';
import { Trophy, Award, Crown, Target, Shield, CheckCircle } from 'lucide-react';

export default function AwardsAnalyticsView({ activeMatchId }) {
  const [awardsData, setAwardsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finalized, setFinalized] = useState(false);

  const fetchAwards = async () => {
    if (!activeMatchId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/awards/${activeMatchId}`);
      const data = await res.json();
      if (data.success) {
        setAwardsData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, [activeMatchId]);

  const handleFinalizeAwards = async () => {
    if (!activeMatchId || !awardsData?.awards) return;
    try {
      const { mvp, top_scorer, best_keeper } = awardsData.awards;
      const res = await fetch(`/api/analytics/awards/${activeMatchId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mvp_player_id: mvp?.user_id || null,
          top_scorer_player_id: top_scorer?.user_id || null,
          best_keeper_player_id: best_keeper?.user_id || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setFinalized(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '60px 32px', textAlign: 'center', margin: '40px auto', maxWidth: '640px', borderRadius: '24px' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>
          ✨ Calculating automated post-match awards...
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Evaluating player MVP points, boundaries, wickets, and defensive metrics.</p>
      </div>
    );
  }

  if (!awardsData || !awardsData.awards) {
    return (
      <div className="glass-panel glow-box" style={{ padding: '64px 36px', textAlign: 'center', margin: '40px auto', maxWidth: '640px', borderRadius: '24px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.25))',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          boxShadow: '0 0 24px rgba(245, 158, 11, 0.3)'
        }}>
          <Trophy size={36} style={{ color: '#f59e0b' }} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: '10px', letterSpacing: '-0.02em' }}>
          Automated Match Awards Engine
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
          Select or complete a match in the Scorer Console to view computed Player of the Match, Top Scorer, and Best Keeper analytics.
        </p>
      </div>
    );
  }

  const { mvp, top_scorer, best_bowler, best_keeper } = awardsData.awards;

  return (
    <div style={{ padding: '16px 0 32px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.02em' }}>
            <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Trophy style={{ color: '#f59e0b' }} size={24} />
            </div>
            Automated Post-Match Awards Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Algorithmic post-match award calculation evaluating overall match performance, goals/runs, wickets, and keeper metrics.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleFinalizeAwards} disabled={finalized}>
          <CheckCircle size={18} /> {finalized ? 'Awards Finalized & Saved' : 'Finalize & Save Match Awards'}
        </button>
      </div>

      {/* Awards Podium Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* MVP Card */}
        <div className="glass-panel glow-box" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' }}>
          <Trophy size={48} style={{ color: '#f59e0b', margin: '0 auto 12px auto' }} />
          <span className="badge badge-pro" style={{ marginBottom: '8px' }}>🏆 MAN OF THE MATCH (MVP)</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            {mvp?.display_name || 'N/A'}
          </h3>
          <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700, marginTop: '4px' }}>
            MVP Rating: {mvp?.mvp_score || 0} pts
          </div>
        </div>

        {/* Top Scorer Card */}
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          <Award size={48} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
          <span className="badge badge-captain" style={{ marginBottom: '8px' }}>⚽/🏏 BEST BATSMAN / TOP SCORER</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            {top_scorer?.display_name || 'N/A'}
          </h3>
          <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>
            {top_scorer?.goals > 0 ? `${top_scorer.goals} Goals` : `${top_scorer?.runs || 0} Runs`}
          </div>
        </div>

        {/* Best Bowler Card */}
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
          <Target size={48} style={{ color: '#ef4444', margin: '0 auto 12px auto' }} />
          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', marginBottom: '8px' }}>🎯 BEST BOWLER</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            {best_bowler?.display_name || 'N/A'}
          </h3>
          <div style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 700, marginTop: '4px' }}>
            {best_bowler?.wickets || 0} Wickets Taken
          </div>
        </div>

        {/* Golden Glove Keeper Card */}
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
          <Shield size={48} style={{ color: '#06b6d4', margin: '0 auto 12px auto' }} />
          <span className="badge badge-keeper" style={{ marginBottom: '8px' }}>🧤 GOLDEN GLOVE (KEEPER)</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            {best_keeper?.display_name || 'N/A'}
          </h3>
          <div style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 700, marginTop: '4px' }}>
            {best_keeper?.saves || 0} Saves / {best_keeper?.stumpings || 0} Stumpings
          </div>
        </div>
      </div>

      {/* Full Player Match Performance Metrics */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
          Player Performance Breakdown Table
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Player</th>
              <th style={{ padding: '12px' }}>Goals</th>
              <th style={{ padding: '12px' }}>Runs</th>
              <th style={{ padding: '12px' }}>Wickets</th>
              <th style={{ padding: '12px' }}>Saves / Stumpings</th>
              <th style={{ padding: '12px' }}>MVP Score</th>
            </tr>
          </thead>
          <tbody>
            {awardsData.allPlayerStats.map((p) => (
              <tr key={p.user_id} style={{ borderBottom: '1px solid var(--border-color)', color: '#fff' }}>
                <td style={{ padding: '12px', fontWeight: 700 }}>{p.display_name}</td>
                <td style={{ padding: '12px' }}>{p.goals}</td>
                <td style={{ padding: '12px' }}>{p.runs}</td>
                <td style={{ padding: '12px' }}>{p.wickets}</td>
                <td style={{ padding: '12px' }}>{p.saves} Saves / {p.stumpings} St</td>
                <td style={{ padding: '12px', fontWeight: 800, color: '#f59e0b' }}>{p.mvp_score} pts</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gamification & Equipment Promotion Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <h4 style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.05rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            👑 Tournament Loyalty Badges & Rewards Track
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Earn 100 SportsAdda Loyalty XP per match booking. Redeem for store vouchers and free floodlight hours.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>🏆 Season MVP Track</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Level 4 (480 / 500 XP)</div>
            </div>
            <span className="badge" style={{ background: '#f59e0b', color: '#000', fontWeight: 900 }}>REWARD READY</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <h4 style={{ color: '#10b981', fontWeight: 800, fontSize: '1.05rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛍️ Localized Store Equipment Promotions
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Exclusive 15% OFF discount on Ihsan Tapeball Bats & Speed Balls at partner pro-shops.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>🏏 Pro-Shop Tapeball Kit</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Voucher Code: <strong>SPORTSADDA15</strong></div>
            </div>
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Claim Offer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
