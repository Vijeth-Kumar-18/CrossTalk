export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const APP_CONFIG = {
  NAME: 'CrossTalk',
  BRAND_LINE: 'Cross-Language Discourse Without Language Barriers',
  SUBTITLE: 'Direct peer-to-peer dispute resolution between speakers with zero shared vocabulary.',
  VERSION: '2.5.0',
} as const;

export const SUPPORTED_LANGUAGES: Record<string, LanguageOption> = {
  'en-US': { code: 'en-US', name: 'English (US)', nativeName: 'English' },
  'es-ES': { code: 'es-ES', name: 'Spanish (ES)', nativeName: 'Español' },
  'de-DE': { code: 'de-DE', name: 'German (DE)', nativeName: 'Deutsch' },
  'hi-IN': { code: 'hi-IN', name: 'Hindi (IN)', nativeName: 'हिन्दी' },
  'fr-FR': { code: 'fr-FR', name: 'French (FR)', nativeName: 'Français' },
  'zh-CN': { code: 'zh-CN', name: 'Mandarin (CN)', nativeName: '中文' },
  'ja-JP': { code: 'ja-JP', name: 'Japanese (JP)', nativeName: '日本語' },
  'it-IT': { code: 'it-IT', name: 'Italian (IT)', nativeName: 'Italiano' },
  'pt-BR': { code: 'pt-BR', name: 'Portuguese (BR)', nativeName: 'Português' },
};

export const AUDIO_CONFIG = {
  SPEECH_RATE: 1.1, // Conversational pacing
  SPEECH_PITCH: 1.0,
  INTERRUPT_CUTOFF_DELAY_MS: 0,
} as const;

export const PRESET_TOPICS = [
  'Commercial contract scope creep and delayed milestone payment release',
  'Startup equity split renegotiation between founding team members',
  'Commercial lease deposit deduction and maintenance responsibility',
  'Software architecture roadmap vs immediate marketing deliverables',
  'Freelance agency unpaid invoice dispute and revision limits',
] as const;

export const UI_STRINGS = {
  NAVBAR: {
    BRAND: 'CrossTalk',
    DASHBOARD: 'Dashboard',
    NEW_DEBATE: 'New Debate',
    SIGN_IN: 'Sign In',
    SIGN_UP: 'Create Account',
    SIGN_OUT: 'Sign Out',
  },
  LANDING: {
    BADGE: 'Peer-to-Peer Cross-Language Debate Protocol',
    HERO_TITLE: 'Cross-Language Discourse Without Language Barriers',
    HERO_DESC: 'Resolve tough disputes directly. Speak your native tongue, hear your opponent in real time, and interrupt naturally without artificial turn-taking.',
    CTA_START: 'Start a Free Debate',
    CTA_SIGN_IN: 'Sign In to Your Workspace',
    FEATURE_1_TITLE: 'Natural Conversational Interruptions',
    FEATURE_1_DESC: 'When you speak, your opponent’s incoming audio translation ducks instantly. No sanitized, robotic turn-based waiting.',
    FEATURE_2_TITLE: 'Authentic Slang & Raw Sentiment',
    FEATURE_2_DESC: 'Rhetorical pushes, firmness, and colloquial pushbacks are translated with their visceral edge intact rather than sterilized.',
    FEATURE_3_TITLE: 'Cognitive Stance Tracking',
    FEATURE_3_DESC: 'Real-time analysis detects whether debaters are escalating, defending, considering counter-arguments, or conceding points.',
  },
  AUTH: {
    LOGIN_TITLE: 'Sign in to CrossTalk',
    LOGIN_SUBTITLE: 'Enter your verified account email and password.',
    SIGNUP_TITLE: 'Create your CrossTalk account',
    SIGNUP_SUBTITLE: 'Pick your native language and set a secure password.',
    EMAIL_LABEL: 'Email Address',
    PASSWORD_LABEL: 'Password (min. 8 characters)',
    CONFIRM_PASSWORD_LABEL: 'Confirm Password',
    NAME_LABEL: 'Full Name',
    LANG_LABEL: 'Native Spoken Language',
    LOGIN_BTN: 'Sign In',
    SIGNUP_BTN: 'Create Account',
  },
  DASHBOARD: {
    WELCOME: 'Welcome back',
    SUBTITLE: 'Manage active debate rooms or enter a room code to resolve a dispute.',
    CREATE_CARD_TITLE: 'Create a Debate Room',
    CREATE_CARD_DESC: 'Initiate a new dispute session and invite your opponent via a 6-character room code.',
    JOIN_CARD_TITLE: 'Join via Room Code',
    JOIN_CARD_DESC: 'Enter a 6-character room code shared by your counterpart.',
    ROOM_CODE_LABEL: '6-Character Room Code',
    ROOM_CODE_PLACEHOLDER: 'e.g. DISPUT',
    CREATE_MODAL_TITLE: 'Start a New Debate Session',
    TOPIC_LABEL: 'Dispute Topic / Issue',
    TOPIC_PLACEHOLDER: 'What is the core disagreement?',
    SUBMIT_CREATE_BTN: 'Generate Room & Code',
    SUBMIT_JOIN_BTN: 'Enter Debate Room',
    RECENT_DEBATES: 'Your Debate Rooms',
    NO_DEBATES: 'No debate rooms created or joined yet. Create your first room above.',
  },
  ROOM: {
    WAITING_STATUS: 'Waiting for Opponent',
    CONNECTED_STATUS: 'Opponent Connected',
    ROOM_CODE_LABEL: 'Room Code:',
    COPY_CODE: 'Copy Code',
    COPIED: 'Copied!',
    SUMMARY_BTN: 'Resolution Summary',
    LEAVE_BTN: 'Exit Room',
    YOU_HEADER: 'You',
    OPPONENT_HEADER: 'Opponent',
    MIC_START: 'Click to Speak',
    MIC_ACTIVE: 'Transmitting Speech...',
    INPUT_PLACEHOLDER: 'Type your point or speak into microphone...',
    SEND_BTN: 'Send',
    INTERRUPT_ALERT: 'Interruption detected — opponent translation audio silenced',
    TRANSCRIPT_TITLE: 'Live Dispute Transcript',
    AUDIO_MUTED: 'Audio Muted',
    AUDIO_ACTIVE: 'Audio Active',
    CONCESSION_BADGE: 'Conceding Point',
  },
  SUMMARY: {
    TITLE: 'Dispute Resolution Audit',
    SUBTITLE: 'Chronological transcript and key moments where participants yielded or found common ground.',
    BACK_BTN: 'Back to Debate Room',
    DASHBOARD_BTN: 'Return to Dashboard',
    COPY_TRANSCRIPT: 'Copy Entire Transcript',
    COPIED: 'Transcript copied to clipboard.',
    TOTAL_TURNS: 'Total Exchanges',
    INTERRUPTIONS: 'Interruptions Logged',
    AVG_HEAT: 'Average Heat Score',
    CONCESSIONS: 'Concessions Detected',
  },
} as const;
