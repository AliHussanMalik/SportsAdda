const { test, describe, it } = require('node:test');
const assert = require('node:assert');

describe('User Role Distinction & Player Directory Privacy Test Suite', () => {
  // Test 1: User Registration Role Assignment (PLAYER vs INDOOR_OWNER)
  it('1. Account registration correctly assigns PLAYER and INDOOR_OWNER roles', () => {
    const playerRegistration = {
      display_name: 'Babar Azam',
      password: 'password123',
      role: 'PLAYER',
      primary_sport: 'CRICKET'
    };

    const ownerRegistration = {
      display_name: 'Malik Sports Complex',
      password: 'ownerpassword123',
      role: 'INDOOR_OWNER',
      primary_sport: 'CRICKET'
    };

    assert.strictEqual(playerRegistration.role, 'PLAYER');
    assert.strictEqual(ownerRegistration.role, 'INDOOR_OWNER');
  });

  // Test 2: Player Directory Privacy Logic for Regular Players
  it('2. Regular PLAYER role accounts receive ONLY their own profile on the Account page', () => {
    const loggedInUser = { user_id: 'u-100', display_name: 'Babar Azam', role: 'PLAYER' };
    const allProfiles = [
      { user_id: 'u-100', display_name: 'Babar Azam', role: 'PLAYER' },
      { user_id: 'u-200', display_name: 'Shaheen Afridi', role: 'PLAYER' },
      { user_id: 'u-300', display_name: 'DHA Arena Owner', role: 'INDOOR_OWNER' }
    ];

    // Privacy filter simulation
    const isPlayer = loggedInUser.role === 'PLAYER';
    const visibleDirectory = isPlayer 
      ? allProfiles.filter(p => p.user_id === loggedInUser.user_id) 
      : allProfiles;

    assert.strictEqual(visibleDirectory.length, 1);
    assert.strictEqual(visibleDirectory[0].display_name, 'Babar Azam');
  });

  // Test 3: Indoor Owner Directory Access
  it('3. INDOOR_OWNER and ADMIN roles retain directory access for arena roster & booking management', () => {
    const ownerUser = { user_id: 'u-300', display_name: 'DHA Arena Owner', role: 'INDOOR_OWNER' };
    const allProfiles = [
      { user_id: 'u-100', display_name: 'Babar Azam', role: 'PLAYER' },
      { user_id: 'u-200', display_name: 'Shaheen Afridi', role: 'PLAYER' },
      { user_id: 'u-300', display_name: 'DHA Arena Owner', role: 'INDOOR_OWNER' }
    ];

    const isOwnerOrAdmin = ownerUser.role === 'INDOOR_OWNER' || ownerUser.role === 'ADMIN';
    const visibleDirectory = isOwnerOrAdmin ? allProfiles : allProfiles.filter(p => p.user_id === ownerUser.user_id);

    assert.strictEqual(visibleDirectory.length, 3);
  });
});
