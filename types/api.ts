// Base API types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User and Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  debateStrength: 'collaborative' | 'inquisitive' | 'socratic' | 'devil-advocate' | 'aggressive';
  theme: 'light' | 'dark' | 'system';
  voiceSettings: {
    enabled: boolean;
    autoRecord: boolean;
    language: string;
    voice: string;
  };
}

// Chat-related types
export interface ChatSession {
  id: string;
  title: string;
  type: 'chat' | 'voice';
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'delegate';
  content: string;
  timestamp: string;
  metadata?: {
    tokens?: number;
    model?: string;
    processingTime?: number;
  };
}

export interface SendMessageRequest {
  sessionId?: string;
  message: string;
  context?: {
    previousMessages?: number;
    systemPrompt?: string;
  };
}

export interface SendMessageResponse {
  message: ChatMessage;
  session: ChatSession;
  usage?: {
    tokensUsed: number;
    cost?: number;
  };
}

// Voice-related types
export interface VoiceSession {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'active' | 'completed' | 'error';
  transcriptId?: string;
}

export interface VoiceMessage {
  id: string;
  sessionId: string;
  speaker: 'user' | 'delegate';
  content: string;
  audioUrl?: string;
  timestamp: string;
  confidence?: number;
  metadata?: {
    speechDuration?: number;
    processingTime?: number;
  };
}

export interface StartVoiceSessionRequest {
  title?: string;
  language?: string;
  voiceSettings?: {
    voice: string;
    speed: number;
    pitch: number;
  };
}

export interface ProcessVoiceRequest {
  sessionId: string;
  audioData: Blob | ArrayBuffer;
  format: 'wav' | 'mp3' | 'webm';
}

export interface ProcessVoiceResponse {
  transcription: string;
  response: string;
  audioUrl?: string;
  confidence: number;
}

// Transcript types
export interface Transcript {
  id: string;
  title: string;
  type: 'chat' | 'voice';
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  tags?: string[];
  messageCount: number;
  duration?: number;
  status: 'active' | 'completed';
}

export interface TranscriptMessage {
  id: string;
  transcriptId: string;
  speaker: 'user' | 'delegate';
  content: string;
  timestamp: string;
  metadata?: {
    confidence?: number;
    audioUrl?: string;
  };
}

// Settings types
export interface UpdatePreferencesRequest {
  debateStrength?: UserPreferences['debateStrength'];
  theme?: UserPreferences['theme'];
  voiceSettings?: Partial<UserPreferences['voiceSettings']>;
}

// WebSocket types
export interface WebSocketMessage {
  type: 'voice_start' | 'voice_data' | 'voice_end' | 'voice_response' | 'error' | 'ping' | 'pong';
  sessionId?: string;
  data?: any;
  timestamp: string;
}

export interface VoiceStreamData {
  transcription?: string;
  response?: string;
  audioChunk?: string; // base64 encoded
  isComplete: boolean;
  confidence?: number;
}

// Error types
export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Search and filtering
export interface SearchRequest {
  query: string;
  type?: 'chat' | 'voice' | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  type: 'chat' | 'voice';
  title: string;
  snippet: string;
  timestamp: string;
  relevanceScore: number;
}