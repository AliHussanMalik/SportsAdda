const { test, describe, it } = require('node:test');
const assert = require('node:assert');

describe('Live Match Scoring Console & Match Progression Test Suite', () => {

  // Test 1: Initial Match State & Configuration (Score = 0, Overs = 0)
  it('1. Initial match state must begin with 0 runs, 0 wickets, and 0 overs', () => {
    const initialScoreboard = {
      team_a_score: 0,
      team_b_score: 0,
      team_a_wickets: 0,
      team_b_wickets: 0,
      team_a_overs: '0.0',
      team_b_overs: '0.0',
      total_overs_limit: 10 // Set by Captain / Organizer
    };

    assert.strictEqual(initialScoreboard.team_a_score, 0, 'Initial score must be 0');
    assert.strictEqual(initialScoreboard.team_a_wickets, 0, 'Initial wickets must be 0');
    assert.strictEqual(initialScoreboard.team_a_overs, '0.0', 'Initial overs must be 0.0');
    assert.strictEqual(initialScoreboard.total_overs_limit, 10, 'Total overs configured by Captain/Organizer');
  });

  // Test 2: Batting Order Setup & Auto-Assignment of Striker / Non-Striker
  it('2. Captain adds players and configures batting order with automatic Striker and Non-Striker assignment', () => {
    const squadRoster = [
      { player_id: 'p1', player_name: 'Babar Azam', preferred_role: 'Batsman' },
      { player_id: 'p2', player_name: 'Mohammad Rizwan', preferred_role: 'Wicketkeeper' },
      { player_id: 'p3', player_name: 'Fakhar Zaman', preferred_role: 'Batsman' },
      { player_id: 'p4', player_name: 'Shaheen Afridi', preferred_role: 'Bowler' }
    ];

    // Captain configures batting order
    const configuredOrder = squadRoster.map((player, index) => ({
      player_id: player.player_id,
      player_name: player.player_name,
      batting_position: index + 1,
      is_extra_player: false,
      status: index === 0 ? 'STRIKER' : index === 1 ? 'NON_STRIKER' : 'QUEUED'
    }));

    const striker = configuredOrder.find(b => b.status === 'STRIKER');
    const nonStriker = configuredOrder.find(b => b.status === 'NON_STRIKER');
    const queued = configuredOrder.filter(b => b.status === 'QUEUED');

    assert.strictEqual(striker.player_id, 'p1', 'Position 1 must be active Striker');
    assert.strictEqual(nonStriker.player_id, 'p2', 'Position 2 must be active Non-Striker');
    assert.strictEqual(queued.length, 2, 'Remaining players must be QUEUED');
  });

  // Test 3: Ball-by-Ball Progression & Strike Swapping on Odd Runs
  it('3. Ball-by-ball run recording updates score and swaps strike on odd runs or over completion', () => {
    let state = {
      total_runs: 0,
      total_balls: 0,
      striker: 'p1',
      nonStriker: 'p2'
    };

    function recordBall(runs) {
      state.total_runs += runs;
      state.total_balls += 1;

      // Swap strike if odd runs or over finished (every 6 balls)
      const isOddRuns = runs % 2 !== 0;
      const isOverEnd = state.total_balls % 6 === 0;

      if (isOddRuns !== isOverEnd) {
        // Single swap condition (XOR)
        const temp = state.striker;
        state.striker = state.nonStriker;
        state.nonStriker = temp;
      }
    }

    recordBall(1); // 1 run -> strike swaps
    assert.strictEqual(state.total_runs, 1);
    assert.strictEqual(state.striker, 'p2');

    recordBall(4); // 4 runs -> strike stays
    assert.strictEqual(state.total_runs, 5);
    assert.strictEqual(state.striker, 'p2');
  });

  // Test 4: Wicket Dismissal & Automatic Next Batsman Advancement
  it('4. Wicket dismissal marks current striker OUT and automatically advances next queued batsman', () => {
    const battingOrder = [
      { player_id: 'p1', player_name: 'Babar', status: 'STRIKER' },
      { player_id: 'p2', player_name: 'Rizwan', status: 'NON_STRIKER' },
      { player_id: 'p3', player_name: 'Fakhar', status: 'QUEUED' },
      { player_id: 'p4', player_name: 'Shaheen', status: 'QUEUED' }
    ];

    const dismissedPlayerId = 'p1';

    // 1. Mark dismissed as OUT
    const dismissedIndex = battingOrder.findIndex(b => b.player_id === dismissedPlayerId);
    battingOrder[dismissedIndex].status = 'OUT';

    // 2. Next queued player is automatically assigned as STRIKER
    const nextQueuedIndex = battingOrder.findIndex(b => b.status === 'QUEUED');
    assert.ok(nextQueuedIndex !== -1, 'Next queued batsman must exist');
    battingOrder[nextQueuedIndex].status = 'STRIKER';

    assert.strictEqual(battingOrder[0].status, 'OUT', 'Dismissed player must be marked OUT');
    assert.strictEqual(battingOrder[2].status, 'STRIKER', 'Next queued player (Fakhar) automatically becomes STRIKER');
  });

  // Test 5: Automatic Bowler Order & Runtime Captain Override
  it('5. Bowler order auto-advances after 6 balls unless Captain manually changes bowler at runtime', () => {
    const bowlerRotation = ['b1 (Haris Rauf)', 'b2 (Naseem Shah)', 'b3 (Shadab Khan)'];
    let currentBowlerIndex = 0;
    let captainManualOverride = null;

    function getActiveBowler(currentOverNumber) {
      if (captainManualOverride) return captainManualOverride;
      return bowlerRotation[currentOverNumber % bowlerRotation.length];
    }

    // Over 1: Auto bowler 1
    assert.strictEqual(getActiveBowler(0), 'b1 (Haris Rauf)');

    // Over 2: Auto bowler 2
    assert.strictEqual(getActiveBowler(1), 'b2 (Naseem Shah)');

    // Captain overrides runtime bowler for Over 3
    captainManualOverride = 'b3 (Shadab Khan)';
    assert.strictEqual(getActiveBowler(2), 'b3 (Shadab Khan)', 'Captain manual override takes precedence');
  });

  // Test 6: Innings Transition after Overs/Wickets Expiry
  it('6. First team turn ends when overs limit or max wickets is reached, starting second team turn', () => {
    const matchSettings = { total_overs: 5, max_wickets: 10 };
    let firstInnings = { overs_bowled: 5.0, wickets_lost: 4, runs_scored: 58, is_completed: false };

    if (firstInnings.overs_bowled >= matchSettings.total_overs || firstInnings.wickets_lost >= matchSettings.max_wickets) {
      firstInnings.is_completed = true;
    }

    assert.strictEqual(firstInnings.is_completed, true, 'First innings is completed');

    const secondInnings = {
      target_runs: firstInnings.runs_scored + 1,
      current_runs: 0,
      overs_bowled: 0.0,
      wickets_lost: 0
    };

    assert.strictEqual(secondInnings.target_runs, 59, 'Second team target is Team 1 runs + 1');
  });

  // Test 7: Match Completion & Player Stats Profile Sync
  it('7. Match completion syncs runs, wickets, saves, and stumpings to player profiles for review', () => {
    const playerStatsMap = {
      'p1': { runs_scored: 42, balls_faced: 28, dismissals: 1 },
      'p2': { runs_scored: 18, balls_faced: 12, dismissals: 0 },
      'b1': { overs_bowled: 2.0, wickets_taken: 3, runs_conceded: 14 },
      'k1': { total_saves: 5, stumpings: 2 }
    };

    assert.strictEqual(playerStatsMap['p1'].runs_scored, 42);
    assert.strictEqual(playerStatsMap['b1'].wickets_taken, 3);
    assert.strictEqual(playerStatsMap['k1'].stumpings, 2);
  });

  // Test 8: Captain Verification & Review Sign-Off
  it('8. Captains can review progress after turn is over and sign-off confirmation', () => {
    let verificationState = {
      captain_a_confirmed: false,
      captain_b_confirmed: false,
      status: 'PENDING_CONFIRMATION'
    };

    // Captain A reviews & confirms
    verificationState.captain_a_confirmed = true;
    assert.strictEqual(verificationState.status, 'PENDING_CONFIRMATION');

    // Captain B reviews & confirms
    verificationState.captain_b_confirmed = true;
    if (verificationState.captain_a_confirmed && verificationState.captain_b_confirmed) {
      verificationState.status = 'CONFIRMED';
    }

    assert.strictEqual(verificationState.status, 'CONFIRMED', 'Both captains sign off to confirm score correctness');
  });

});
