const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'sports_adda',
});

const schemaSQL = `
-- Enable Spatial Extensions for Geo-Distance Searches
CREATE EXTENSION IF NOT EXISTS cube CASCADE;
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;

-- 1. Player Profiles & Specialized Roles
CREATE TABLE IF NOT EXISTS player_profiles (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(30) DEFAULT 'PLAYER', -- 'ADMIN', 'SCORER', 'PLAYER'
    profile_photo_url VARCHAR(255),
    primary_sport VARCHAR(50) DEFAULT 'FUTSAL',
    preferred_role VARCHAR(50),
    jersey_number INT,
    subscription_tier VARCHAR(20) DEFAULT 'FREE', -- 'FREE', 'PRO'
    is_captain BOOLEAN DEFAULT FALSE,
    is_coach BOOLEAN DEFAULT FALSE,
    is_keeper BOOLEAN DEFAULT FALSE,
    keeper_type VARCHAR(20) DEFAULT 'NONE', -- 'GOALKEEPER', 'WICKETKEEPER', 'NONE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(100) UNIQUE;
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE player_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'PLAYER';

-- 2. Specialized Keeper Statistics
CREATE TABLE IF NOT EXISTS keeper_stats (
    user_id UUID PRIMARY KEY REFERENCES player_profiles(user_id) ON DELETE CASCADE,
    total_saves INT DEFAULT 0,
    clean_sheets INT DEFAULT 0,
    penalties_saved INT DEFAULT 0,
    goals_conceded INT DEFAULT 0,
    keeper_catches INT DEFAULT 0,
    stumpings INT DEFAULT 0,
    keeper_runouts INT DEFAULT 0,
    byes_conceded INT DEFAULT 0
);

-- 3. Teams & Rosters
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    captain_id UUID REFERENCES player_profiles(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES player_profiles(user_id) ON DELETE CASCADE,
    role_in_team VARCHAR(30) DEFAULT 'PLAYER', -- 'CAPTAIN', 'COACH', 'PLAYER'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, player_id)
);

-- 4. Indoor Venues & Booking Slots
CREATE TABLE IF NOT EXISTS indoor_arenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    address TEXT
);

-- Arena Geo-Location & Amenities Extension
ALTER TABLE indoor_arenas 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES player_profiles(user_id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Lahore',
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 2500.00,
ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(2,1) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_ac BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_cameras BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_changing_room BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_canteen BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_prayer_area BOOLEAN DEFAULT FALSE;

-- Multi-Store Ownership for Indoor Owners
CREATE TABLE IF NOT EXISTS owner_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES player_profiles(user_id) ON DELETE CASCADE NOT NULL,
    arena_id UUID REFERENCES indoor_arenas(id) ON DELETE SET NULL,
    store_name VARCHAR(150) NOT NULL,
    store_address TEXT NOT NULL,
    contact_phone VARCHAR(50),
    store_type VARCHAR(50) DEFAULT 'EQUIPMENT_PRO_SHOP',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store Inventory Management
CREATE TABLE IF NOT EXISTS store_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES owner_stores(id) ON DELETE CASCADE NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) DEFAULT 'CRICKET_GEAR',
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_arena_location ON indoor_arenas (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_arena_rating ON indoor_arenas (avg_rating);
CREATE INDEX IF NOT EXISTS idx_owner_stores ON owner_stores (owner_id);

CREATE TABLE IF NOT EXISTS arena_courts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_id UUID REFERENCES indoor_arenas(id) ON DELETE CASCADE,
    court_name VARCHAR(100),
    sport_type VARCHAR(50) DEFAULT 'CRICKET',
    hourly_rate DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS court_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id UUID REFERENCES arena_courts(id) ON DELETE CASCADE,
    booked_by_user_id UUID NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PENDING'
);

-- Indoor Cricket Dedicated Pitch Management
CREATE TABLE IF NOT EXISTS indoor_cricket_pitches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_id UUID REFERENCES indoor_arenas(id) ON DELETE CASCADE NOT NULL,
    pitch_name VARCHAR(150) NOT NULL,
    pitch_type VARCHAR(50) DEFAULT 'TAPE_BALL', -- TAPE_BALL, LEATHER_BALL, BOX_CRICKET, BOWLING_MACHINE_NET
    length_yards INT DEFAULT 22,
    has_bowling_machine BOOLEAN DEFAULT FALSE,
    hourly_rate DECIMAL(10,2) DEFAULT 2500.00,
    peak_hourly_rate DECIMAL(10,2) DEFAULT 3500.00,
    bowling_machine_fee DECIMAL(10,2) DEFAULT 500.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS indoor_pitch_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pitch_id UUID REFERENCES indoor_cricket_pitches(id) ON DELETE CASCADE NOT NULL,
    slot_date DATE NOT NULL,
    start_time VARCHAR(10) NOT NULL, -- e.g. '18:00'
    end_time VARCHAR(10) NOT NULL,   -- e.g. '19:00'
    is_peak_hour BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'OPEN', -- OPEN, BOOKED, MAINTENANCE
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS indoor_cricket_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES indoor_pitch_slots(id) ON DELETE CASCADE NOT NULL,
    pitch_id UUID REFERENCES indoor_cricket_pitches(id) ON DELETE CASCADE NOT NULL,
    booked_by_user_id UUID REFERENCES player_profiles(user_id) ON DELETE CASCADE NOT NULL,
    team_name VARCHAR(150) NOT NULL,
    include_bowling_machine BOOLEAN DEFAULT FALSE,
    include_equipment_kit BOOLEAN DEFAULT FALSE,
    total_price DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(30) DEFAULT 'APPROVED', -- PENDING, APPROVED, CHECKED_IN, CANCELLED
    qr_checkin_code VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Universal Real-Time Notifications Engine Table
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES player_profiles(user_id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Custom / Open Pitch Grounds
CREATE TABLE IF NOT EXISTS custom_grounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by_user_id UUID REFERENCES player_profiles(user_id),
    ground_name VARCHAR(150) NOT NULL,
    address_text TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    ground_type VARCHAR(50) DEFAULT 'OPEN_FIELD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Match Fixtures & Live Scoring
CREATE TABLE IF NOT EXISTS match_fixtures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_a_id UUID REFERENCES teams(id) NOT NULL,
    team_b_id UUID REFERENCES teams(id) NOT NULL,
    court_booking_id UUID REFERENCES court_bookings(id),
    scorer_user_id UUID NOT NULL,
    toss_winner_id UUID REFERENCES teams(id),
    toss_decision VARCHAR(10), -- 'BAT', 'BOWL', 'KICKOFF'
    match_status VARCHAR(20) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'LIVE', 'FINISHED'
    winner_team_id UUID REFERENCES teams(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update Matches to Allow Open Pitch Matches & Cricket Setup Settings
ALTER TABLE match_fixtures 
ADD COLUMN IF NOT EXISTS is_custom_ground BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS custom_ground_id UUID REFERENCES custom_grounds(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS total_overs INT DEFAULT 10,
ADD COLUMN IF NOT EXISTS playing_squad_count INT DEFAULT 11,
ADD COLUMN IF NOT EXISTS max_wickets INT DEFAULT 10;

ALTER TABLE match_fixtures ALTER COLUMN court_booking_id DROP NOT NULL;

CREATE TABLE IF NOT EXISTS match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES match_fixtures(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'GOAL', 'RUN', 'WICKET', 'SAVE', 'STUMPING'
    player_id UUID REFERENCES player_profiles(user_id),
    event_time_seconds INT,
    details JSONB
);

-- Cricket Batting Order & Extra Players Queue
CREATE TABLE IF NOT EXISTS cricket_batting_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES match_fixtures(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES player_profiles(user_id) ON DELETE CASCADE,
    batting_position INT NOT NULL,
    is_extra_player BOOLEAN DEFAULT FALSE,
    is_reserve BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'QUEUED', -- 'QUEUED', 'STRIKER', 'NON_STRIKER', 'OUT', 'NOT_OUT'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, team_id, player_id)
);
ALTER TABLE cricket_batting_order ADD COLUMN IF NOT EXISTS is_reserve BOOLEAN DEFAULT FALSE;

-- Player & Bowler Career Statistics Aggregation
CREATE TABLE IF NOT EXISTS cricket_player_stats (
    user_id UUID PRIMARY KEY REFERENCES player_profiles(user_id) ON DELETE CASCADE,
    total_runs INT DEFAULT 0,
    balls_faced INT DEFAULT 0,
    fours INT DEFAULT 0,
    sixes INT DEFAULT 0,
    dismissals INT DEFAULT 0,
    high_score INT DEFAULT 0,
    overs_bowled DECIMAL(5,1) DEFAULT 0.0,
    balls_bowled INT DEFAULT 0,
    runs_conceded INT DEFAULT 0,
    wickets_taken INT DEFAULT 0,
    economy_rate DECIMAL(5,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dual Captain Verification & Confirmation Intervals
CREATE TABLE IF NOT EXISTS match_captain_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES match_fixtures(id) ON DELETE CASCADE,
    interval_type VARCHAR(30) DEFAULT 'EACH_OVER', -- 'EACH_BALL', 'EACH_OVER', 'EVERY_2_OVERS'
    interval_value INT DEFAULT 1,
    last_verified_ball_count INT DEFAULT 0,
    captain_a_confirmed BOOLEAN DEFAULT FALSE,
    captain_b_confirmed BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'CONFIRMED', -- 'PENDING_CONFIRMATION', 'CONFIRMED'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Automated Post-Match Awards
CREATE TABLE IF NOT EXISTS match_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES match_fixtures(id) ON DELETE CASCADE,
    mvp_player_id UUID REFERENCES player_profiles(user_id),
    top_scorer_player_id UUID REFERENCES player_profiles(user_id),
    best_keeper_player_id UUID REFERENCES player_profiles(user_id)
);

-- 8. Financial Ledger & Transactions
CREATE TABLE IF NOT EXISTS financial_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(20) NOT NULL, -- 'INCOME', 'EXPENSE', 'SALARY'
    category VARCHAR(50) NOT NULL, -- 'SLOT_BOOKING', 'UTILITY_BILL', 'INVENTORY', 'STAFF_SALARY'
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(30), -- 'CASH', 'JAZZCASH', 'BANK_TRANSFER', 'STRIPE'
    description TEXT,
    receipt_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Staff Payroll
CREATE TABLE IF NOT EXISTS staff_payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_name VARCHAR(100) NOT NULL,
    role VARCHAR(50), -- 'SCORER', 'GROUND_STAFF', 'MANAGER'
    monthly_salary DECIMAL(10,2) NOT NULL,
    last_paid_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING'
);

-- 10. Automated Admin Reporting Settings
CREATE TABLE IF NOT EXISTS admin_report_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email VARCHAR(100) NOT NULL,
    admin_phone VARCHAR(20) NOT NULL,
    schedule_type VARCHAR(20) NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY'
    report_channel VARCHAR(20) NOT NULL, -- 'EMAIL', 'WHATSAPP', 'BOTH'
    send_time TIME DEFAULT '22:00:00'
);

-- 11. 360-Degree Ratings & Reviews
CREATE TABLE IF NOT EXISTS arena_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arena_id UUID REFERENCES indoor_arenas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES player_profiles(user_id),
    turf_quality_rating INT CHECK (turf_quality_rating BETWEEN 1 AND 5),
    lighting_rating INT CHECK (lighting_rating BETWEEN 1 AND 5),
    facilities_rating INT CHECK (facilities_rating BETWEEN 1 AND 5),
    overall_rating DECIMAL(2,1) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_conduct_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES match_fixtures(id),
    reviewed_player_id UUID REFERENCES player_profiles(user_id),
    punctuality_rating INT CHECK (punctuality_rating BETWEEN 1 AND 5),
    behavior_rating INT CHECK (behavior_rating BETWEEN 1 AND 5),
    is_red_flagged BOOLEAN DEFAULT FALSE,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scorer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES match_fixtures(id),
    scorer_user_id UUID NOT NULL,
    captain_user_id UUID REFERENCES player_profiles(user_id),
    accuracy_rating INT CHECK (accuracy_rating BETWEEN 1 AND 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function initDB() {
  const client = await pool.connect();
  try {
    console.log('🚀 Running SportsAdda database migrations on PostgreSQL...');
    await client.query(schemaSQL);
    console.log('✅ Database schema verified/created successfully!');

    // Check seed data in indoor_arenas for lat/lng updates
    await client.query(`
      UPDATE indoor_arenas SET
        latitude = 31.4700,
        longitude = 74.4100,
        avg_rating = 4.8,
        total_reviews = 12,
        has_ac = true,
        has_parking = true,
        has_cameras = true,
        has_changing_room = true,
        has_canteen = true,
        has_prayer_area = true
      WHERE latitude IS NULL;
    `);

    // Check if seed data exists
    const res = await client.query('SELECT COUNT(*) FROM player_profiles');
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial SportsAdda database records...');

      // Seed password: "Password123!" bcrypt hash: $2a$10$w8F2b59O6O1H1T3n5E8h7.v9E8h7E8h7E8h7E8h7E8h7E8h7E8h7
      // Using direct dummy hash for seed
      const defaultHash = '$2a$10$w8F2b59O6O1H1T3n5E8h7.v9E8h7E8h7E8h7E8h7E8h7E8h7E8h7';

      // 1. Players & Admins
      const adminRes = await client.query(`
        INSERT INTO player_profiles (display_name, email, password_hash, role, primary_sport, preferred_role, jersey_number, subscription_tier, is_captain)
        VALUES ('Admin Leader', 'admin@sportsadda.com', '${defaultHash}', 'ADMIN', 'FUTSAL', 'Manager', 99, 'PRO', true)
        RETURNING user_id;
      `);
      const admin_id = adminRes.rows[0].user_id;

      const p1 = await client.query(`
        INSERT INTO player_profiles (display_name, email, password_hash, role, primary_sport, preferred_role, jersey_number, subscription_tier, is_captain)
        VALUES ('Alex Striker', 'alex@sportsadda.com', '${defaultHash}', 'PLAYER', 'FUTSAL', 'Forward', 10, 'PRO', true)
        RETURNING user_id;
      `);
      const p1_id = p1.rows[0].user_id;

      const p2 = await client.query(`
        INSERT INTO player_profiles (display_name, email, password_hash, role, primary_sport, preferred_role, jersey_number, subscription_tier, is_keeper, keeper_type)
        VALUES ('Sam Shield', 'sam@sportsadda.com', '${defaultHash}', 'PLAYER', 'FUTSAL', 'Goalkeeper', 1, 'FREE', true, 'GOALKEEPER')
        RETURNING user_id;
      `);
      const p2_id = p2.rows[0].user_id;

      const p3 = await client.query(`
        INSERT INTO player_profiles (display_name, email, password_hash, role, primary_sport, preferred_role, jersey_number, subscription_tier, is_captain, is_coach)
        VALUES ('Leo Mastermind', 'leo@sportsadda.com', '${defaultHash}', 'SCORER', 'CRICKET', 'All-Rounder', 7, 'PRO', true, true)
        RETURNING user_id;
      `);
      const p3_id = p3.rows[0].user_id;

      const p4 = await client.query(`
        INSERT INTO player_profiles (display_name, email, password_hash, role, primary_sport, preferred_role, jersey_number, subscription_tier, is_keeper, keeper_type)
        VALUES ('David Gloveman', 'david@sportsadda.com', '${defaultHash}', 'PLAYER', 'CRICKET', 'Wicket Keeper', 18, 'PRO', true, 'WICKETKEEPER')
        RETURNING user_id;
      `);
      const p4_id = p4.rows[0].user_id;

      // 2. Keeper Stats
      await client.query(`
        INSERT INTO keeper_stats (user_id, total_saves, clean_sheets, penalties_saved, goals_conceded)
        VALUES ('${p2_id}', 24, 5, 2, 8);
      `);

      await client.query(`
        INSERT INTO keeper_stats (user_id, keeper_catches, stumpings, keeper_runouts, byes_conceded)
        VALUES ('${p4_id}', 14, 6, 3, 2);
      `);

      // 3. Teams
      const t1 = await client.query(`
        INSERT INTO teams (team_name, logo_url, captain_id)
        VALUES ('Thunder Strikers FC', 'https://api.dicebear.com/7.x/identicon/svg?seed=Thunder', '${p1_id}')
        RETURNING id;
      `);
      const team1_id = t1.rows[0].id;

      const t2 = await client.query(`
        INSERT INTO teams (team_name, logo_url, captain_id)
        VALUES ('Apex Titans CC', 'https://api.dicebear.com/7.x/identicon/svg?seed=Titans', '${p3_id}')
        RETURNING id;
      `);
      const team2_id = t2.rows[0].id;

      // Team rosters
      await client.query(`
        INSERT INTO team_roster (team_id, player_id, role_in_team) VALUES
        ('${team1_id}', '${p1_id}', 'CAPTAIN'),
        ('${team1_id}', '${p2_id}', 'PLAYER'),
        ('${team2_id}', '${p3_id}', 'CAPTAIN'),
        ('${team2_id}', '${p4_id}', 'PLAYER');
      `);

      // 4. Arenas & Courts
      const arenaRes = await client.query(`
        INSERT INTO indoor_arenas (name, address, latitude, longitude, avg_rating, total_reviews, has_ac, has_parking, has_cameras, has_changing_room, has_canteen, has_prayer_area)
        VALUES ('Velocity Sports Complex', 'DHA Phase 5 Commercial, Sector E', 31.4720, 74.4080, 4.8, 15, true, true, true, true, true, true)
        RETURNING id;
      `);
      const arena_id = arenaRes.rows[0].id;

      const c1 = await client.query(`
        INSERT INTO arena_courts (arena_id, court_name, sport_type, hourly_rate)
        VALUES ('${arena_id}', 'Turf Pitch Alpha', 'FUTSAL', 45.00)
        RETURNING id;
      `);
      const court1_id = c1.rows[0].id;

      const c2 = await client.query(`
        INSERT INTO arena_courts (arena_id, court_name, sport_type, hourly_rate)
        VALUES ('${arena_id}', 'Indoor Box Cricket pitch 1', 'CRICKET', 50.00)
        RETURNING id;
      `);
      const court2_id = c2.rows[0].id;

      // Court booking
      const bookRes = await client.query(`
        INSERT INTO court_bookings (court_id, booked_by_user_id, start_time, end_time, payment_status)
        VALUES ('${court1_id}', '${p1_id}', NOW(), NOW() + INTERVAL '2 hours', 'CONFIRMED')
        RETURNING id;
      `);
      const booking_id = bookRes.rows[0].id;

      // 5. Match Fixture
      const matchRes = await client.query(`
        INSERT INTO match_fixtures (team_a_id, team_b_id, court_booking_id, scorer_user_id, toss_winner_id, toss_decision, match_status)
        VALUES ('${team1_id}', '${team2_id}', '${booking_id}', '${p3_id}', '${team1_id}', 'KICKOFF', 'LIVE')
        RETURNING id;
      `);
      const match_id = matchRes.rows[0].id;

      // Match events sample
      await client.query(`
        INSERT INTO match_events (match_id, event_type, player_id, event_time_seconds, details) VALUES
        ('${match_id}', 'GOAL', '${p1_id}', 120, '{"note": "Powerful strike top left corner"}'),
        ('${match_id}', 'SAVE', '${p2_id}', 340, '{"note": "Diving save from point blank"}'),
        ('${match_id}', 'GOAL', '${p1_id}', 680, '{"note": "Solo dribble & goal"}');
      `);

      // 6. Seed Financial Ledger
      await client.query(`
        INSERT INTO financial_ledger (transaction_type, category, amount, payment_method, description) VALUES
        ('INCOME', 'SLOT_BOOKING', 120.00, 'STRIPE', 'Slot Booking Turf Pitch Alpha'),
        ('INCOME', 'PRO_SUBSCRIPTION', 49.99, 'JAZZCASH', 'Monthly Pro Subscription - Alex Striker'),
        ('EXPENSE', 'UTILITY_BILL', 85.00, 'BANK_TRANSFER', 'Electricity bill for Arena Lighting'),
        ('EXPENSE', 'INVENTORY', 150.00, 'CASH', 'Purchased 5 Futsal Balls & Match Cones');
      `);

      // 7. Seed Staff Payroll
      await client.query(`
        INSERT INTO staff_payroll (staff_name, role, monthly_salary, status) VALUES
        ('Leo Mastermind', 'SCORER', 600.00, 'PAID'),
        ('Zack Field Manager', 'MANAGER', 1200.00, 'PENDING'),
        ('Tariq Ground Staff', 'GROUND_STAFF', 450.00, 'PENDING');
      `);

      // 8. Seed Admin Report Settings
      await client.query(`
        INSERT INTO admin_report_settings (admin_email, admin_phone, schedule_type, report_channel) VALUES
        ('admin@sportsadda.com', '+923001234567', 'DAILY', 'BOTH');
      `);

      // 9. Seed Custom Ground
      await client.query(`
        INSERT INTO custom_grounds (created_by_user_id, ground_name, address_text, latitude, longitude, ground_type) VALUES
        ('${p1_id}', 'FAST NUCES Main Field', 'FAST NUCES University Campus, Block B', 31.4815, 74.3030, 'OPEN_FIELD');
      `);

      console.log('✅ Initial seed data created successfully!');
    } else {
      console.log('ℹ️ Database already contains records. Applied incremental updates.');
    }
  } catch (err) {
    console.error('❌ DB Init Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

initDB();
