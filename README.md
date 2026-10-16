# CrossTalk

> Real-Time Cross-Language Dispute Resolution and Negotiation Protocol

CrossTalk is an open peer-to-peer discourse protocol engineered for high-stakes contentious discussions between parties who share no common language. Unlike generic tourist translation tools that sanitize speech into polite corporate phrasing and force rigid walkie-talkie turn-taking, CrossTalk preserves argumentative intent, emotional intensity, and rhetorical friction while enabling natural interruptions through acoustic barge-in ducking.

---

## 1. Problem Statement

Standard translation applications fail during real disputes due to four systemic limitations:

1. **Polite Tone Sanitization**: Conventional machine translation filters out urgency, firm pushbacks, and colloquial nuance, obscuring the speaker's true posture.
2. **Turn-Taking Rigidity**: Standard systems force sequential, turn-based speech. In real arguments, parties talk over each other; without interruption handling, conflicting audio streams cause cognitive collapse.
3. **Sentiment Blindness**: Off-the-shelf tools treat sentences in isolation, missing stance shifts (e.g., Escalating, Defending, Standing Firm, or Conceding).
4. **Single-Device Constraints**: Most mobile tools assume both participants are huddling around a single shared screen, which is unsuitable for contentious commercial or legal disagreements.

CrossTalk solves these challenges by providing isolated authenticated sessions, sub-30ms acoustic ducking, real-time stance analytics, and end-of-session consensus audit reports.

---

## 2. Core Architecture and Features

### 2.1 Acoustic Barge-In Interruption Ducking
When a participant speaks into their microphone or transmits an argument while their counterpart's translation is playing, CrossTalk triggers a client-side cutoff via `window.speechSynthesis.cancel()`. The opposing audio is silenced in under 30 milliseconds, mirroring real-life conversational dynamics.

### 2.2 Google Gemini Flash Inference
The translation pipeline utilizes Google Gemini Flash (`gemini-3.8-flash`) via `@google/generative-ai` with structured JSON schema enforcement (`application/json`). Each utterance returns:
- `translatedText`: Contextual, emotion-preserved translation in the target language.
- `sentiment`: Categorized tone (`heated`, `firm`, `defensive`, `conceding`).
- `heatScore`: Intensity rating on a 1-to-10 integer scale.
- `stance`: Current debater stance (`Standing Firm`, `Pushing Back`, `Defending Position`, `Considering Point`, `Conceding`).
- `isConcession`: Explicit boolean flag identifying yielded points or concessions.

### 2.3 Strict Cryptographic Authentication
User accounts and access credentials utilize Node.js built-in cryptography (`crypto.scryptSync` with random 16-byte salts and `crypto.timingSafeEqual` constant-time verification). Passwords must meet strict length and complexity requirements (minimum 8 characters containing letters and numbers). No hardcoded mock personas or authentication bypasses exist.

### 2.4 Serverless PostgreSQL Persistence (Neon)
Session state, room invitations, participant links, and turn-by-turn dispute transcripts are persisted in Neon Serverless PostgreSQL with complete ACID guarantees. Automatic schema synchronization ensures tables (`users`, `debate_rooms`, `debate_turns`) and performance indexes are initialized seamlessly.

### 2.5 Speech Recognition Deduplication
Web Speech API event emissions are protected by an index-tracking barrier (`lastFinalIndexRef`) and rapid-fire debounce locks (`isDispatchingRef`, `lastDispatchedTextRef`). This guarantees that continuous speech recognition streams never process or submit the same utterance multiple times.

### 2.6 Responsive Multi-Device Interface
A responsive layout optimized for desktop, tablet, and mobile browsers. Includes a slide-down mobile navigation drawer, debater profile management for updating full name and preferred language, and an About page for non-authenticated visitors.

---

## 3. Technology Stack

- **Framework**: Next.js (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS (Enterprise Monochrome Theme inspired by Stripe and Linear)
- **Database**: Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **Language Intelligence**: Google Gemini Flash (`@google/generative-ai`)
- **Speech Audio Engine**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Security**: Node.js Cryptography (`scrypt` key derivation, `timingSafeEqual`)
- **Iconography**: Lucide React

---

## 4. Directory Structure

```
DebateArena/
├── public/                     # Static assets
├── scripts/
│   └── push-db.mjs             # Neon database schema migration script
├── src/
│   ├── app/
│   │   ├── about/              # Professional protocol overview (unauthenticated)
│   │   ├── api/
│   │   │   ├── auth/           # Login and signup endpoints (scrypt)
│   │   │   ├── rooms/          # Room creation, joining, and listing
│   │   │   │   └── [roomId]/
│   │   │   │       ├── summary/# Post-debate consensus audit
│   │   │   │       └── turns/  # Turn retrieval endpoint
│   │   │   ├── translate/      # Turn translation and Gemini Flash inference
│   │   │   └── user/
│   │   │       └── profile/    # Profile and credential management
│   │   ├── dashboard/          # Debater dashboard (create/join rooms)
│   │   ├── login/              # Strict credential sign-in
│   │   ├── profile/            # User settings and language preferences
│   │   ├── room/
│   │   │   └── [roomId]/       # Live P2P dispute workspace
│   │   │       └── summary/    # Transcript audit and concession report
│   │   ├── signup/             # Strict registration
│   │   ├── layout.tsx          # Root application shell
│   │   ├── page.tsx            # Product landing page
│   │   └── globals.css         # Design system tokens and animations
│   ├── components/
│   │   └── Navbar.tsx          # Responsive navigation bar with mobile drawer
│   ├── constants/
│   │   └── appConstants.ts     # Supported languages, configurations, strings
│   ├── context/
│   │   └── AuthContext.tsx     # Client-side session and authentication provider
│   ├── lib/
│   │   ├── auth.ts             # Cryptographic hashing and strength validation
│   │   └── db.ts               # Neon PostgreSQL client and query layer
│   ├── services/
│   │   └── translateService.ts # Gemini Flash inference engine
│   └── types/
│       └── clashTypes.ts       # Shared TypeScript data models
├── .env.example                # Sample environment variables
├── package.json                # Project dependencies and operational scripts
├── schema.sql                  # PostgreSQL table definitions and indexes
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 5. Database Schema

The database consists of three core relational tables defined in `schema.sql`:

### `users`
- `id` (UUID, Primary Key)
- `email` (VARCHAR(255), Unique, Indexed)
- `password_hash` (VARCHAR(255), Salted scrypt hash)
- `full_name` (VARCHAR(100))
- `preferred_language` (VARCHAR(10), e.g., `en-US`, `de-DE`, `es-ES`)
- `created_at` (TIMESTAMP WITH TIME ZONE)

### `debate_rooms`
- `id` (UUID, Primary Key)
- `room_code` (VARCHAR(10), Unique, Indexed, e.g., `DISPUT`)
- `topic` (VARCHAR(255))
- `created_by` (UUID, Foreign Key to `users`)
- `participant_a_id` (UUID, Foreign Key to `users`)
- `participant_b_id` (UUID, Foreign Key to `users`, Nullable)
- `participant_a_lang` (VARCHAR(10))
- `participant_b_lang` (VARCHAR(10), Nullable)
- `status` (VARCHAR(30), `waiting` | `active` | `concluded`)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `concluded_at` (TIMESTAMP WITH TIME ZONE, Nullable)

### `debate_turns`
- `id` (UUID, Primary Key)
- `room_id` (UUID, Foreign Key to `debate_rooms`, Indexed)
- `speaker_id` (UUID, Foreign Key to `users`)
- `original_text` (TEXT)
- `translated_text` (TEXT)
- `detected_sentiment` (VARCHAR(40))
- `heat_score` (INTEGER, 1 to 10)
- `is_concession` (BOOLEAN)
- `did_interrupt` (BOOLEAN)
- `created_at` (TIMESTAMP WITH TIME ZONE, Indexed)

---

## 6. Getting Started

### 6.1 Prerequisites
- Node.js 18.18 or higher
- A Neon Serverless PostgreSQL account (https://neon.tech)
- A Google Gemini API key (https://aistudio.google.com/app/apikey)

### 6.2 Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/Vijeth-Kumar-18/CrossTalk.git
cd CrossTalk
npm install
```

### 6.3 Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):

```ini
# Neon PostgreSQL Connection URL
DATABASE_URL="postgresql://neondb_owner:<password>@<endpoint>.neon.tech/neondb?sslmode=require"

# Google Gemini Flash API Key
GEMINI_API_KEY="AIzaSy_your_api_key_here"

# Model Identifier
GEMINI_MODEL="gemini-3.8-flash"

# Port
PORT=3000
```

### 6.4 Initialize Database Schema
Push the SQL schema and indexes to your Neon instance:

```bash
npm run db:push
```

Expected output:
```
[CrossTalk DB] Connecting to Neon Serverless PostgreSQL...
[CrossTalk DB] Executing schema.sql on Neon...
  Extension "pgcrypto" verified
  Table "users" verified
  Table "debate_rooms" verified
  Table "debate_turns" verified
  High-performance indexes verified
[CrossTalk DB Success] Neon database successfully initialized!
```

### 6.5 Running Locally
Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Available Scripts

- `npm run dev`: Starts the Next.js local development server.
- `npm run build`: Compiles production assets and builds the application.
- `npm run start`: Runs the built production server.
- `npm run lint`: Runs ESLint checks across the codebase.
- `npm run db:push`: Applies `schema.sql` to the configured Neon database.

---

## 8. License

This project is released under the MIT License.
