import {
  User,
  ChatSession,
  ChatMessage,
  SendMessageRequest,
  SendMessageResponse,
  VoiceSession,
  VoiceMessage,
  StartVoiceSessionRequest,
  ProcessVoiceRequest,
  ProcessVoiceResponse,
  Transcript,
  TranscriptMessage,
  UpdatePreferencesRequest,
  SearchRequest,
  SearchResult,
} from '../types/api';

// Mock data generators
const generateId = () => `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Mock responses for voice mode
const voiceResponses = [
  "I'm Delegate, and I'm listening. What would you like to talk about?",
  "That's a great question! Let me think about that.",
  "I understand. Here's what I think about that topic.",
  "Interesting perspective! I'd be happy to discuss this further.",
  "I'm here to help with whatever you need.",
  "That's something I can definitely assist you with.",
  "Could you tell me more about that?",
  "I see what you mean. Here's another way to look at it.",
  "That's fascinating! What made you think of that?",
  "Let me expand on that idea for you.",
];

const userInputs = [
  "I'm interested in learning more about this topic...",
  "Can you explain that in more detail?",
  "What do you think about climate change?",
  "How can I improve my productivity?",
  "That's an interesting point...",
  "Tell me about artificial intelligence.",
  "What's your opinion on remote work?",
  "How do I stay motivated?",
];

// Mock user data
const mockUser: User = {
  id: 'user_001',
  email: 'user@example.com',
  name: 'Demo User',
  preferences: {
    debateStrength: 'socratic',
    theme: 'system',
    voiceSettings: {
      enabled: true,
      autoRecord: false,
      language: 'en-US',
      voice: 'alloy',
    },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock storage using localStorage
class MockStorage {
  private prefix = 'delegate_ai_mock_';

  get<T>(key: string, defaultValue: T): T {
    const stored = localStorage.getItem(this.prefix + key);
    return stored ? JSON.parse(stored) : defaultValue;
  }

  set<T>(key: string, value: T): void {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }
}

export class MockAPIService {
  private storage = new MockStorage();
  private user = mockUser;

  private delay(ms: number = 500 + Math.random() * 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Chat API methods
  async getChatSessions(): Promise<ChatSession[]> {
    await this.delay();
    return this.storage.get<ChatSession[]>('chatSessions', []);
  }

  async createChatSession(title?: string): Promise<ChatSession> {
    await this.delay();
    
    const session: ChatSession = {
      id: generateId(),
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      type: 'chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };

    const sessions = this.storage.get<ChatSession[]>('chatSessions', []);
    sessions.unshift(session);
    this.storage.set('chatSessions', sessions);

    return session;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    await this.delay();
    return this.storage.get<ChatMessage[]>(`chatMessages_${sessionId}`, []);
  }

  async sendChatMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    await this.delay(1000 + Math.random() * 2000);

    let session: ChatSession;
    
    if (request.sessionId) {
      const sessions = this.storage.get<ChatSession[]>('chatSessions', []);
      session = sessions.find(s => s.id === request.sessionId)!;
    } else {
      session = await this.createChatSession();
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      sessionId: session.id,
      role: 'user',
      content: request.message,
      timestamp: new Date().toISOString(),
    };

    // Generate AI response
    const responses = [
      "That's an interesting point. Let me think about that...",
      "I understand your perspective. Here's what I think...",
      "That's a complex topic. From my analysis...",
      "I appreciate you sharing that. In my view...",
      "That's worth considering. Here's another angle...",
    ];

    const aiMessage: ChatMessage = {
      id: generateId(),
      sessionId: session.id,
      role: 'delegate',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString(),
      metadata: {
        tokens: Math.floor(Math.random() * 500) + 100,
        model: 'gpt-4',
        processingTime: Math.floor(Math.random() * 2000) + 500,
      },
    };

    // Store messages
    const messages = this.storage.get<ChatMessage[]>(`chatMessages_${session.id}`, []);
    messages.push(userMessage, aiMessage);
    this.storage.set(`chatMessages_${session.id}`, messages);

    // Update session
    session.messageCount = messages.length;
    session.lastMessage = userMessage.content.substring(0, 50) + '...';
    session.updatedAt = new Date().toISOString();

    const sessions = this.storage.get<ChatSession[]>('chatSessions', []);
    const sessionIndex = sessions.findIndex(s => s.id === session.id);
    if (sessionIndex > -1) {
      sessions[sessionIndex] = session;
      this.storage.set('chatSessions', sessions);
    }

    return {
      message: aiMessage,
      session,
      usage: {
        tokensUsed: aiMessage.metadata?.tokens || 0,
        cost: 0.002,
      },
    };
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    await this.delay();
    
    const sessions = this.storage.get<ChatSession[]>('chatSessions', []);
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    this.storage.set('chatSessions', filteredSessions);
    this.storage.remove(`chatMessages_${sessionId}`);
  }

  // Voice API methods
  async startVoiceSession(request: StartVoiceSessionRequest): Promise<VoiceSession> {
    await this.delay();
    
    const session: VoiceSession = {
      id: generateId(),
      title: request.title || `Voice Session ${new Date().toLocaleTimeString()}`,
      startTime: new Date().toISOString(),
      status: 'active',
    };

    const sessions = this.storage.get<VoiceSession[]>('voiceSessions', []);
    sessions.unshift(session);
    this.storage.set('voiceSessions', sessions);

    return session;
  }

  async endVoiceSession(sessionId: string): Promise<VoiceSession> {
    await this.delay();
    
    const sessions = this.storage.get<VoiceSession[]>('voiceSessions', []);
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      session.endTime = new Date().toISOString();
      session.status = 'completed';
      session.duration = Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000);
      this.storage.set('voiceSessions', sessions);
    }

    return session!;
  }

  async processVoiceInput(request: ProcessVoiceRequest): Promise<ProcessVoiceResponse> {
    await this.delay(1500 + Math.random() * 2000);
    
    const transcription = userInputs[Math.floor(Math.random() * userInputs.length)];
    const response = voiceResponses[Math.floor(Math.random() * voiceResponses.length)];

    // Store voice message
    const message: VoiceMessage = {
      id: generateId(),
      sessionId: request.sessionId,
      speaker: 'user',
      content: transcription,
      timestamp: new Date().toISOString(),
      confidence: 0.85 + Math.random() * 0.15,
    };

    const messages = this.storage.get<VoiceMessage[]>(`voiceMessages_${request.sessionId}`, []);
    messages.push(message);
    
    const aiMessage: VoiceMessage = {
      id: generateId(),
      sessionId: request.sessionId,
      speaker: 'delegate',
      content: response,
      timestamp: new Date().toISOString(),
    };
    
    messages.push(aiMessage);
    this.storage.set(`voiceMessages_${request.sessionId}`, messages);

    return {
      transcription,
      response,
      confidence: message.confidence!,
    };
  }

  async getVoiceMessages(sessionId: string): Promise<VoiceMessage[]> {
    await this.delay();
    return this.storage.get<VoiceMessage[]>(`voiceMessages_${sessionId}`, []);
  }

  // Transcript API methods
  async getTranscripts(): Promise<Transcript[]> {
    await this.delay();
    return this.storage.get<Transcript[]>('transcripts', []);
  }

  async getTranscript(transcriptId: string): Promise<Transcript> {
    await this.delay();
    const transcripts = this.storage.get<Transcript[]>('transcripts', []);
    return transcripts.find(t => t.id === transcriptId)!;
  }

  async getTranscriptMessages(transcriptId: string): Promise<TranscriptMessage[]> {
    await this.delay();
    return this.storage.get<TranscriptMessage[]>(`transcriptMessages_${transcriptId}`, []);
  }

  async deleteTranscript(transcriptId: string): Promise<void> {
    await this.delay();
    const transcripts = this.storage.get<Transcript[]>('transcripts', []);
    const filtered = transcripts.filter(t => t.id !== transcriptId);
    this.storage.set('transcripts', filtered);
    this.storage.remove(`transcriptMessages_${transcriptId}`);
  }

  async downloadTranscript(transcriptId: string, format: 'json' | 'txt' | 'pdf' = 'json'): Promise<Blob> {
    await this.delay();
    
    const transcript = await this.getTranscript(transcriptId);
    const messages = await this.getTranscriptMessages(transcriptId);
    
    let content: string;
    let mimeType: string;
    
    switch (format) {
      case 'json':
        content = JSON.stringify({ transcript, messages }, null, 2);
        mimeType = 'application/json';
        break;
      case 'txt':
        content = `${transcript.title}\n${'='.repeat(transcript.title.length)}\n\n`;
        content += messages.map(m => `[${m.timestamp}] ${m.speaker}: ${m.content}`).join('\n');
        mimeType = 'text/plain';
        break;
      default:
        content = JSON.stringify({ transcript, messages }, null, 2);
        mimeType = 'application/json';
    }
    
    return new Blob([content], { type: mimeType });
  }

  // User and Settings API methods
  async getCurrentUser(): Promise<User> {
    await this.delay();
    return this.storage.get('user', this.user);
  }

  async updateUserPreferences(preferences: UpdatePreferencesRequest): Promise<User> {
    await this.delay();
    
    const user = this.storage.get('user', this.user);
    user.preferences = { ...user.preferences, ...preferences };
    user.updatedAt = new Date().toISOString();
    this.storage.set('user', user);
    
    return user;
  }

  // Search API methods
  async search(request: SearchRequest): Promise<SearchResult[]> {
    await this.delay();
    
    // Mock search results
    const results: SearchResult[] = [
      {
        id: 'result_1',
        type: 'chat',
        title: 'Discussion about AI Ethics',
        snippet: 'We talked about the ethical implications of artificial intelligence...',
        timestamp: new Date().toISOString(),
        relevanceScore: 0.95,
      },
      {
        id: 'result_2',
        type: 'voice',
        title: 'Voice Chat on Climate Change',
        snippet: 'Conversation about environmental policies and climate action...',
        timestamp: new Date().toISOString(),
        relevanceScore: 0.87,
      },
    ].filter(r => r.snippet.toLowerCase().includes(request.query.toLowerCase()));
    
    return results;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    await this.delay(100);
    return true;
  }

  // Helper methods for testing
  clearAllData(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('delegate_ai_mock_'));
    keys.forEach(key => localStorage.removeItem(key));
  }

  seedTestData(): void {
    // Add some test data for development
    const testSession: ChatSession = {
      id: 'test_session_1',
      title: 'Test Chat Session',
      type: 'chat',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      updatedAt: new Date().toISOString(),
      messageCount: 4,
      lastMessage: 'This is a test message for development...',
    };

    this.storage.set('chatSessions', [testSession]);
  }
}

// Create singleton instance
export const mockApiService = new MockAPIService();