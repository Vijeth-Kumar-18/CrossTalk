export type RoomStatus = 'waiting' | 'active' | 'concluded';

export type StanceType =
  | 'Standing Firm'
  | 'Pushing Back'
  | 'Defending Position'
  | 'Considering Point'
  | 'Conceding';

export interface User {
  id: string;
  email: string;
  full_name: string;
  preferred_language: string;
  created_at?: string;
}

export interface DebateRoom {
  id: string;
  room_code: string;
  topic: string;
  created_by: string;
  participant_a_id: string;
  participant_b_id?: string | null;
  participant_a_lang: string;
  participant_b_lang?: string | null;
  status: RoomStatus;
  created_at: string;
  concluded_at?: string | null;
  participant_a?: User;
  participant_b?: User;
}

export interface DebateTurn {
  id: string;
  room_id: string;
  speaker_id: string;
  speaker_name?: string;
  original_text: string;
  translated_text: string;
  detected_sentiment: string;
  heat_score: number; // 1 to 10
  is_concession: boolean;
  did_interrupt: boolean;
  created_at: string;
}

export interface TranslateRequest {
  roomId: string;
  speakerId: string;
  text: string;
  fromLang: string;
  toLang: string;
  didInterrupt?: boolean;
}

export interface TranslateResponse {
  translatedText: string;
  sentiment: string;
  heatScore: number;
  isConcession: boolean;
  stance: StanceType;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  isNeon?: boolean;
}
