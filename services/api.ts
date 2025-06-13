import { config, validateEnvironment } from '../config/environment';
import {
  APIResponse,
  PaginatedResponse,
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
  APIError
} from '../types/api';

class APIService {
  private baseURL: string;
  private apiKey: string;
  private abortControllers: Map<string, AbortController> = new Map();
  private isInitialized = false;

  constructor() {
    // Defer initialization to avoid immediate environment validation
    this.baseURL = '';
    this.apiKey = '';
  }

  // Initialize the service (called when first used)
  private initialize(): void {
    if (this.isInitialized) return;
    
    try {
      validateEnvironment();
      this.baseURL = config.apiBaseURL;
      this.apiKey = config.apiKey || '';
      this.isInitialized = true;
    } catch (error) {
      console.error('API Service initialization failed:', error);
      // In development, continue with defaults
      if (config.environment === 'development') {
        this.baseURL = 'http://localhost:3001/api';
        this.apiKey = '';
        this.isInitialized = true;
      } else {
        throw error;
      }
    }
  }

  // Base request method with error handling and retries
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = config.maxRetries
  ): Promise<APIResponse<T>> {
    this.initialize(); // Ensure service is initialized
    
    const url = `${this.baseURL}${endpoint}`;
    const requestId = `${endpoint}-${Date.now()}`;
    
    // Create abort controller for this request
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client': 'delegate-ai-web',
    };

    // Only add Authorization header if API key exists
    if (this.apiKey) {
      defaultHeaders['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: APIResponse<T> = await response.json();
      
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      // Clean up abort controller
      this.abortControllers.delete(requestId);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request was cancelled');
        }
        
        // Retry logic for network errors
        if (retries > 0 && this.shouldRetry(error)) {
          await this.delay(1000 * (config.maxRetries - retries + 1));
          return this.request<T>(endpoint, options, retries - 1);
        }

        throw new Error(`API Error: ${error.message}`);
      }

      throw error;
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  private shouldRetry(error: Error): boolean {
    // Retry on network errors, timeout errors, and 5xx server errors
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('5')
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cancel all pending requests
  public cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  // Chat API methods
  async getChatSessions(): Promise<ChatSession[]> {
    const response = await this.request<ChatSession[]>('/chat/sessions');
    return response.data || [];
  }

  async createChatSession(title?: string): Promise<ChatSession> {
    const response = await this.request<ChatSession>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    return response.data!;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await this.request<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
    return response.data || [];
  }

  async sendChatMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await this.request<SendMessageResponse>('/chat/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.data!;
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    await this.request(`/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Voice API methods
  async startVoiceSession(request: StartVoiceSessionRequest): Promise<VoiceSession> {
    const response = await this.request<VoiceSession>('/voice/sessions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.data!;
  }

  async endVoiceSession(sessionId: string): Promise<VoiceSession> {
    const response = await this.request<VoiceSession>(`/voice/sessions/${sessionId}/end`, {
      method: 'POST',
    });
    return response.data!;
  }

  async processVoiceInput(request: ProcessVoiceRequest): Promise<ProcessVoiceResponse> {
    this.initialize(); // Ensure service is initialized

    const formData = new FormData();
    formData.append('sessionId', request.sessionId);
    formData.append('audio', request.audioData);
    formData.append('format', request.format);

    const url = `${this.baseURL}/voice/process`;
    const controller = new AbortController();
    
    const headers: Record<string, string> = {
      'X-Client': 'delegate-ai-web',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: APIResponse<ProcessVoiceResponse> = await response.json();
      
      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      return data.data!;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
      }
      throw error;
    }
  }

  async getVoiceMessages(sessionId: string): Promise<VoiceMessage[]> {
    const response = await this.request<VoiceMessage[]>(`/voice/sessions/${sessionId}/messages`);
    return response.data || [];
  }

  // Transcript API methods
  async getTranscripts(): Promise<Transcript[]> {
    const response = await this.request<Transcript[]>('/transcripts');
    return response.data || [];
  }

  async getTranscript(transcriptId: string): Promise<Transcript> {
    const response = await this.request<Transcript>(`/transcripts/${transcriptId}`);
    return response.data!;
  }

  async getTranscriptMessages(transcriptId: string): Promise<TranscriptMessage[]> {
    const response = await this.request<TranscriptMessage[]>(`/transcripts/${transcriptId}/messages`);
    return response.data || [];
  }

  async deleteTranscript(transcriptId: string): Promise<void> {
    await this.request(`/transcripts/${transcriptId}`, {
      method: 'DELETE',
    });
  }

  async downloadTranscript(transcriptId: string, format: 'json' | 'txt' | 'pdf' = 'json'): Promise<Blob> {
    this.initialize(); // Ensure service is initialized

    const response = await fetch(`${this.baseURL}/transcripts/${transcriptId}/download?format=${format}`, {
      headers: {
        'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download transcript: ${response.statusText}`);
    }

    return response.blob();
  }

  // User and Settings API methods
  async getCurrentUser(): Promise<User> {
    const response = await this.request<User>('/user/profile');
    return response.data!;
  }

  async updateUserPreferences(preferences: UpdatePreferencesRequest): Promise<User> {
    const response = await this.request<User>('/user/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
    return response.data!;
  }

  // Search API methods
  async search(request: SearchRequest): Promise<SearchResult[]> {
    const queryParams = new URLSearchParams({
      query: request.query,
      ...(request.type && { type: request.type }),
      ...(request.limit && { limit: request.limit.toString() }),
      ...(request.offset && { offset: request.offset.toString() }),
      ...(request.dateRange && {
        startDate: request.dateRange.start,
        endDate: request.dateRange.end,
      }),
    });

    const response = await this.request<SearchResult[]>(`/search?${queryParams}`);
    return response.data || [];
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request('/health');
      return response.success;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const apiService = new APIService();

// Export class for testing
export { APIService };