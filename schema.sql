-- ====================================================================
-- CrossTalk: Real-Time Peer-to-Peer Cross-Language Debate Platform
-- Neon Serverless PostgreSQL Schema
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en-US',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Debate Rooms / Sessions
CREATE TABLE IF NOT EXISTS debate_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(10) UNIQUE NOT NULL,
    topic VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    participant_a_id UUID REFERENCES users(id),
    participant_b_id UUID REFERENCES users(id),
    participant_a_lang VARCHAR(10) NOT NULL,
    participant_b_lang VARCHAR(10),
    status VARCHAR(30) DEFAULT 'waiting', -- 'waiting', 'active', 'concluded'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    concluded_at TIMESTAMP WITH TIME ZONE
);

-- 3. Individual Debate Turns
CREATE TABLE IF NOT EXISTS debate_turns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES debate_rooms(id) ON DELETE CASCADE,
    speaker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    detected_sentiment VARCHAR(40) NOT NULL,
    heat_score INTEGER DEFAULT 5, -- 1 to 10
    is_concession BOOLEAN DEFAULT FALSE,
    did_interrupt BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_rooms_code ON debate_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_turns_room ON debate_turns(room_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 5. Seed Initial Test Users for Immediate Multi-Window Testing
INSERT INTO users (id, email, password_hash, full_name, preferred_language)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'marco@example.com', 'password123', 'Marco Rossi', 'en-US'),
    ('b0000000-0000-0000-0000-000000000002', 'rohan@example.com', 'password123', 'Rohan Mehta', 'de-DE')
ON CONFLICT (email) DO NOTHING;

-- 6. Seed Initial Demo Room
INSERT INTO debate_rooms (id, room_code, topic, created_by, participant_a_id, participant_b_id, participant_a_lang, participant_b_lang, status)
VALUES
    (
        'c0000000-0000-0000-0000-000000000001',
        'DISPUT',
        'Commercial contract scope expansion and milestone payment release',
        'a0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000002',
        'en-US',
        'de-DE',
        'active'
    )
ON CONFLICT (room_code) DO NOTHING;
