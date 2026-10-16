import { neon } from '@neondatabase/serverless';
import { User, DebateRoom, DebateTurn } from '@/types/clashTypes';
import { DEMO_USERS } from '@/constants/appConstants';

/**
 * In-memory fallback stores for immediate development/testing
 */
let memoryUsers: User[] = [
  {
    id: DEMO_USERS[0].id,
    email: DEMO_USERS[0].email,
    full_name: DEMO_USERS[0].fullName,
    preferred_language: DEMO_USERS[0].preferredLanguage,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: DEMO_USERS[1].id,
    email: DEMO_USERS[1].email,
    full_name: DEMO_USERS[1].fullName,
    preferred_language: DEMO_USERS[1].preferredLanguage,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

let memoryRooms: DebateRoom[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    room_code: 'DISPUT',
    topic: 'Commercial contract scope expansion and milestone payment release',
    created_by: DEMO_USERS[0].id,
    participant_a_id: DEMO_USERS[0].id,
    participant_b_id: DEMO_USERS[1].id,
    participant_a_lang: 'en-US',
    participant_b_lang: 'de-DE',
    status: 'active',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    participant_a: memoryUsers[0],
    participant_b: memoryUsers[1],
  },
];

let memoryTurns: DebateTurn[] = [
  {
    id: 'turn-seed-1',
    room_id: 'c0000000-0000-0000-0000-000000000001',
    speaker_id: DEMO_USERS[0].id,
    speaker_name: DEMO_USERS[0].fullName,
    original_text: 'You cannot unilaterally add $4,000 for deliverables clearly outlined in the initial statement of work.',
    translated_text: 'Sie können nicht einseitig 4.000 $ für Leistungen hinzufügen, die klar in der ursprünglichen Leistungsbeschreibung definiert waren.',
    detected_sentiment: 'heated',
    heat_score: 7,
    is_concession: false,
    did_interrupt: false,
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'turn-seed-2',
    room_id: 'c0000000-0000-0000-0000-000000000001',
    speaker_id: DEMO_USERS[1].id,
    speaker_name: DEMO_USERS[1].fullName,
    original_text: 'Das ist unbegründet! Sie haben drei zusätzliche Revisionsrunden verlangt, die nirgends im Vertrag standen.',
    translated_text: 'That is completely unfounded! You demanded three additional revision rounds that were nowhere in the contract.',
    detected_sentiment: 'escalating',
    heat_score: 8,
    is_concession: false,
    did_interrupt: true,
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
];

let schemaReady = false;

function getNeonClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('ep-example-pooler') || connectionString.trim() === '') {
    return null;
  }
  try {
    return neon(connectionString);
  } catch (err) {
    console.warn('[CrossTalk DB] Neon init warning:', err);
    return null;
  }
}

async function ensureSchema(sql: any) {
  if (schemaReady) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          preferred_language VARCHAR(10) NOT NULL DEFAULT 'en-US',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS debate_rooms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          room_code VARCHAR(10) UNIQUE NOT NULL,
          topic VARCHAR(255) NOT NULL,
          created_by UUID REFERENCES users(id) ON DELETE CASCADE,
          participant_a_id UUID REFERENCES users(id),
          participant_b_id UUID REFERENCES users(id),
          participant_a_lang VARCHAR(10) NOT NULL,
          participant_b_lang VARCHAR(10),
          status VARCHAR(30) DEFAULT 'waiting',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          concluded_at TIMESTAMP WITH TIME ZONE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS debate_turns (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          room_id UUID REFERENCES debate_rooms(id) ON DELETE CASCADE,
          speaker_id UUID REFERENCES users(id) ON DELETE CASCADE,
          original_text TEXT NOT NULL,
          translated_text TEXT NOT NULL,
          detected_sentiment VARCHAR(40) NOT NULL,
          heat_score INTEGER DEFAULT 5,
          is_concession BOOLEAN DEFAULT FALSE,
          did_interrupt BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    schemaReady = true;
  } catch (err) {
    console.error('[CrossTalk DB] Schema initialization error:', err);
  }
}

// ================= USER QUERIES =================

export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = getNeonClient();
  if (sql) {
    try {
      await ensureSchema(sql);
      const rows = await sql`SELECT id, email, full_name, preferred_language, created_at FROM users WHERE email = ${email} LIMIT 1`;
      if (rows.length > 0) {
        const u = rows[0];
        return {
          id: String(u.id),
          email: String(u.email),
          full_name: String(u.full_name),
          preferred_language: String(u.preferred_language),
          created_at: new Date(u.created_at).toISOString(),
        };
      }
      return null;
    } catch (err) {
      console.warn('[CrossTalk DB] Neon getUserByEmail error:', err);
    }
  }

  const found = memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return found || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const sql = getNeonClient();
  if (sql) {
    try {
      await ensureSchema(sql);
      const rows = await sql`SELECT id, email, full_name, preferred_language, created_at FROM users WHERE id = ${id} LIMIT 1`;
      if (rows.length > 0) {
        const u = rows[0];
        return {
          id: String(u.id),
          email: String(u.email),
          full_name: String(u.full_name),
          preferred_language: String(u.preferred_language),
          created_at: new Date(u.created_at).toISOString(),
        };
      }
      return null;
    } catch (err) {
      console.warn('[CrossTalk DB] Neon getUserById error:', err);
    }
  }

  const found = memoryUsers.find((u) => u.id === id);
  return found || null;
}

export async function createUser(data: {
  email: string;
  password?: string;
  fullName: string;
  preferredLanguage: string;
}): Promise<User> {
  const sql = getNeonClient();
  if (sql) {
    try {
      await ensureSchema(sql);
      const rows = await sql`
        INSERT INTO users (email, password_hash, full_name, preferred_language)
        VALUES (${data.email}, ${data.password || 'password123'}, ${data.fullName}, ${data.preferredLanguage})
        RETURNING id, email, full_name, preferred_language, created_at
      `;
      const u = rows[0];
      const newUser: User = {
        id: String(u.id),
        email: String(u.email),
        full_name: String(u.full_name),
        preferred_language: String(u.preferred_language),
        created_at: new Date(u.created_at).toISOString(),
      };
      memoryUsers.push(newUser);
      return newUser;
    } catch (err) {
      console.warn('[CrossTalk DB] Neon createUser error:', err);
    }
  }

  const newUser: User = {
    id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: data.email,
    full_name: data.fullName,
    preferred_language: data.preferredLanguage,
    created_at: new Date().toISOString(),
  };
  memoryUsers.push(newUser);
  return newUser;
}

// ================= DEBATE ROOM QUERIES =================

export async function createDebateRoom(data: {
  topic: string;
  createdBy: string;
  creatorLang: string;
}): Promise<DebateRoom> {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const sql = getNeonClient();

  if (sql) {
    try {
      await ensureSchema(sql);
      const rows = await sql`
        INSERT INTO debate_rooms (room_code, topic, created_by, participant_a_id, participant_a_lang, status)
        VALUES (${roomCode}, ${data.topic}, ${data.createdBy}, ${data.createdBy}, ${data.creatorLang}, 'waiting')
        RETURNING id, room_code, topic, created_by, participant_a_id, participant_a_lang, status, created_at
      `;
      const r = rows[0];
      const creator = await getUserById(data.createdBy);
      const room: DebateRoom = {
        id: String(r.id),
        room_code: String(r.room_code),
        topic: String(r.topic),
        created_by: String(r.created_by),
        participant_a_id: String(r.participant_a_id),
        participant_a_lang: String(r.participant_a_lang),
        status: 'waiting',
        created_at: new Date(r.created_at).toISOString(),
        participant_a: creator || undefined,
      };
      memoryRooms.unshift(room);
      return room;
    } catch (err) {
      console.warn('[CrossTalk DB] Neon createDebateRoom error:', err);
    }
  }

  const creator = memoryUsers.find((u) => u.id === data.createdBy);
  const newRoom: DebateRoom = {
    id: `r-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    room_code: roomCode,
    topic: data.topic,
    created_by: data.createdBy,
    participant_a_id: data.createdBy,
    participant_a_lang: data.creatorLang,
    status: 'waiting',
    created_at: new Date().toISOString(),
    participant_a: creator || undefined,
  };
  memoryRooms.unshift(newRoom);
  return newRoom;
}

export async function getRoomById(id: string): Promise<DebateRoom | null> {
  const sql = getNeonClient();
  if (sql) {
    try {
      await ensureSchema(sql);
      const rows = await sql`
        SELECT r.id, r.room_code, r.topic, r.created_by, r.participant_a_id, r.participant_b_id,
               r.participant_a_lang, r.participant_b_lang, r.status, r.created_at, r.concluded_at,
               ua.email as ua_email, ua.full_name as ua_name, ua.preferred_language as ua_lang,
               ub.email as ub_email, ub.full_name as ub_name, ub.preferred_language as ub_lang
        FROM debate_rooms r
        LEFT JOIN users ua ON r.participant_a_id = ua.id
        LEFT JOIN users ub ON r.participant_b_id = ub.id
        WHERE r.id = ${id}
        LIMIT 1
      `;
      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: String(r.id),
          room_code: String(r.room_code),
          topic: String(r.topic),
          created_by: String(r.created_by),
          participant_a_id: String(r.participant_a_id),
          participant_b_id: r.participant_b_id ? String(r.participant_b_id) : undefined,
          participant_a_lang: String(r.participant_a_lang),
          participant_b_lang: r.participant_b_lang ? String(r.participant_b_lang) : undefined,
          status: r.status as any,
          created_at: new Date(r.created_at).toISOString(),
          concluded_at: r.concluded_at ? new Date(r.concluded_at).toISOString() : undefined,
          participant_a: r.participant_a_id ? {
            id: String(r.participant_a_id),
            email: String(r.ua_email || ''),
            full_name: String(r.ua_name || 'Participant 1'),
            preferred_language: String(r.ua_lang || r.participant_a_lang),
          } : undefined,
          participant_b: r.participant_b_id ? {
            id: String(r.participant_b_id),
            email: String(r.ub_email || ''),
            full_name: String(r.ub_name || 'Participant 2'),
            preferred_language: String(r.ub_lang || r.participant_b_lang),
          } : undefined,
        };
      }
      return null;
    } catch (err) {
      console.warn('[CrossTalk DB] Neon getRoomById error:', err);
    }
  }

  const room = memoryRooms.find((r) => r.id === id);
  if (room) {
    room.participant_a = memoryUsers.find((u) => u.id === room.participant_a_id) || room.participant_a;
    if (room.participant_b_id) {
      room.participant_b = memoryUsers.find((u) => u.id === room.participant_b_id) || room.participant_b;
    }
  }
  return room || null;
}

export async function getRoomByCode(code: string): Promise<DebateRoom | null> {
  const cleanCode = code.trim().toUpperCase();
  const sql = getNeonClient();
  if (sql) {
    try {
      await ensureSchema(sql);
      const rows = await sql`
        SELECT r.id FROM debate_rooms r WHERE UPPER(r.room_code) = ${cleanCode} LIMIT 1
      `;
      if (rows.length > 0) {
        return getRoomById(rows[0].id);
      }
      return null;
    } catch (err) {
      console.warn('[CrossTalk DB] Neon getRoomByCode error:', err);
    }
  }

  const room = memoryRooms.find((r) => r.room_code.toUpperCase() === cleanCode);
  if (room) {
    return getRoomById(room.id);
  }
  return null;
}

export async function joinDebateRoom(data: {
  roomCode: string;
  userId: string;
  userLang: string;
}): Promise<DebateRoom | null> {
  const room = await getRoomByCode(data.roomCode);
  if (!room) return null;

  // If already in room as participant A
  if (room.participant_a_id === data.userId) {
    return room;
  }

  const sql = getNeonClient();
  if (sql) {
    try {
      await ensureSchema(sql);
      await sql`
        UPDATE debate_rooms
        SET participant_b_id = ${data.userId},
            participant_b_lang = ${data.userLang},
            status = 'active'
        WHERE id = ${room.id}
      `;
      return getRoomById(room.id);
    } catch (err) {
      console.warn('[CrossTalk DB] Neon joinDebateRoom error:', err);
    }
  }

  room.participant_b_id = data.userId;
  room.participant_b_lang = data.userLang;
  room.status = 'active';
  room.participant_b = memoryUsers.find((u) => u.id === data.userId);

  return room;
}

export async function getUserDebateRooms(userId: string): Promise<DebateRoom[]> {
  const sql = getNeonClient();
  if (sql) {
    try {
      await ensureSchema(sql);
      const rows = await sql`
        SELECT id FROM debate_rooms
        WHERE participant_a_id = ${userId} OR participant_b_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 20
      `;
      const rooms: DebateRoom[] = [];
      for (const r of rows) {
        const fullRoom = await getRoomById(r.id);
        if (fullRoom) rooms.push(fullRoom);
      }
      return rooms;
    } catch (err) {
      console.warn('[CrossTalk DB] Neon getUserDebateRooms error:', err);
    }
  }

  return memoryRooms.filter(
    (r) => r.participant_a_id === userId || r.participant_b_id === userId
  );
}

// ================= DEBATE TURNS QUERIES =================

export async function addDebateTurn(turn: {
  roomId: string;
  speakerId: string;
  originalText: string;
  translatedText: string;
  sentiment: string;
  heatScore: number;
  isConcession: boolean;
  didInterrupt: boolean;
}): Promise<DebateTurn> {
  const user = await getUserById(turn.speakerId);
  const speakerName = user?.full_name || 'Participant';

  const sql = getNeonClient();
  if (sql) {
    try {
      await ensureSchema(sql);
      const rows = await sql`
        INSERT INTO debate_turns (
          room_id, speaker_id, original_text, translated_text, detected_sentiment, heat_score, is_concession, did_interrupt
        )
        VALUES (
          ${turn.roomId}, ${turn.speakerId}, ${turn.originalText}, ${turn.translatedText},
          ${turn.sentiment}, ${turn.heatScore}, ${turn.isConcession}, ${turn.didInterrupt}
        )
        RETURNING id, room_id, speaker_id, original_text, translated_text, detected_sentiment, heat_score, is_concession, did_interrupt, created_at
      `;
      const r = rows[0];
      const createdTurn: DebateTurn = {
        id: String(r.id),
        room_id: String(r.room_id),
        speaker_id: String(r.speaker_id),
        speaker_name: speakerName,
        original_text: String(r.original_text),
        translated_text: String(r.translated_text),
        detected_sentiment: String(r.detected_sentiment),
        heat_score: Number(r.heat_score),
        is_concession: Boolean(r.is_concession),
        did_interrupt: Boolean(r.did_interrupt),
        created_at: new Date(r.created_at).toISOString(),
      };
      memoryTurns.push(createdTurn);
      return createdTurn;
    } catch (err) {
      console.warn('[CrossTalk DB] Neon addDebateTurn error:', err);
    }
  }

  const newTurn: DebateTurn = {
    id: `turn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    room_id: turn.roomId,
    speaker_id: turn.speakerId,
    speaker_name: speakerName,
    original_text: turn.originalText,
    translated_text: turn.translatedText,
    detected_sentiment: turn.sentiment,
    heat_score: turn.heatScore,
    is_concession: turn.isConcession,
    did_interrupt: turn.didInterrupt,
    created_at: new Date().toISOString(),
  };
  memoryTurns.push(newTurn);
  return newTurn;
}

export async function getRoomTurns(roomId: string): Promise<DebateTurn[]> {
  const sql = getNeonClient();
  if (sql) {
    try {
      await ensureSchema(sql);
      const rows = await sql`
        SELECT t.id, t.room_id, t.speaker_id, t.original_text, t.translated_text,
               t.detected_sentiment, t.heat_score, t.is_concession, t.did_interrupt, t.created_at,
               u.full_name as speaker_name
        FROM debate_turns t
        LEFT JOIN users u ON t.speaker_id = u.id
        WHERE t.room_id = ${roomId}
        ORDER BY t.created_at ASC
        LIMIT 100
      `;
      return rows.map((r) => ({
        id: String(r.id),
        room_id: String(r.room_id),
        speaker_id: String(r.speaker_id),
        speaker_name: String(r.speaker_name || 'Participant'),
        original_text: String(r.original_text),
        translated_text: String(r.translated_text),
        detected_sentiment: String(r.detected_sentiment),
        heat_score: Number(r.heat_score),
        is_concession: Boolean(r.is_concession),
        did_interrupt: Boolean(r.did_interrupt),
        created_at: new Date(r.created_at).toISOString(),
      }));
    } catch (err) {
      console.warn('[CrossTalk DB] Neon getRoomTurns error:', err);
    }
  }

  return memoryTurns.filter((t) => t.room_id === roomId);
}
