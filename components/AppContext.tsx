import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { config } from '../config/environment';
import { apiService } from '../services/api';
import { mockApiService } from '../services/mockData';
import { wsService } from '../services/websocket';
import { 
  User, 
  ChatSession, 
  ChatMessage, 
  VoiceSession,
  Transcript,
  TranscriptMessage,
  UpdatePreferencesRequest,
  SearchResult
} from '../types/api';

// Types
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';
export type CurrentView = 'chat' | 'voice' | 'settings' | 'history' | 'transcripts';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface AppState {
  // User and authentication
  user: User | null;
  isAuthenticated: boolean;
  
  // Current view and session
  currentView: CurrentView;
  currentChatSession: ChatSession | null;
  currentVoiceSession: VoiceSession | null;
  currentTranscriptId: string | null;
  
  // Voice interface
  voiceState: VoiceState;
  isVoiceMode: boolean;
  
  // Data
  chatSessions: ChatSession[];
  chatMessages: ChatMessage[];
  transcripts: Transcript[];
  searchResults: SearchResult[];
  
  // Loading states
  loadingStates: {
    user: LoadingState;
    chatSessions: LoadingState;
    chatMessages: LoadingState;
    transcripts: LoadingState;
    sendMessage: LoadingState;
    voiceProcessing: LoadingState;
  };
  
  // Errors
  errors: {
    user: string | null;
    chatSessions: string | null;
    chatMessages: string | null;
    transcripts: string | null;
    sendMessage: string | null;
    voiceProcessing: string | null;
    websocket: string | null;
  };
  
  // Connection status
  isOnline: boolean;
  isWebSocketConnected: boolean;
  apiHealthy: boolean;
}

// Actions
type AppAction =
  | { type: 'SET_LOADING'; key: keyof AppState['loadingStates']; loading: LoadingState }
  | { type: 'SET_ERROR'; key: keyof AppState['errors']; error: string | null }
  | { type: 'SET_USER'; user: User | null }
  | { type: 'SET_CURRENT_VIEW'; view: CurrentView }
  | { type: 'SET_VOICE_STATE'; state: VoiceState }
  | { type: 'TOGGLE_VOICE_MODE' }
  | { type: 'SET_CHAT_SESSIONS'; sessions: ChatSession[] }
  | { type: 'ADD_CHAT_SESSION'; session: ChatSession }
  | { type: 'UPDATE_CHAT_SESSION'; session: ChatSession }
  | { type: 'REMOVE_CHAT_SESSION'; sessionId: string }
  | { type: 'SET_CURRENT_CHAT_SESSION'; session: ChatSession | null }
  | { type: 'SET_CHAT_MESSAGES'; messages: ChatMessage[] }
  | { type: 'ADD_CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'SET_CURRENT_VOICE_SESSION'; session: VoiceSession | null }
  | { type: 'SET_TRANSCRIPTS'; transcripts: Transcript[] }
  | { type: 'ADD_TRANSCRIPT'; transcript: Transcript }
  | { type: 'UPDATE_TRANSCRIPT'; transcript: Transcript }
  | { type: 'REMOVE_TRANSCRIPT'; transcriptId: string }
  | { type: 'SET_CURRENT_TRANSCRIPT'; transcriptId: string | null }
  | { type: 'ADD_TRANSCRIPT_MESSAGE'; transcriptId: string; message: TranscriptMessage }
  | { type: 'SET_SEARCH_RESULTS'; results: SearchResult[] }
  | { type: 'SET_CONNECTION_STATUS'; isOnline: boolean; isWebSocketConnected: boolean; apiHealthy: boolean };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  currentView: 'chat',
  currentChatSession: null,
  currentVoiceSession: null,
  currentTranscriptId: null,
  voiceState: 'idle',
  isVoiceMode: false,
  chatSessions: [],
  chatMessages: [],
  transcripts: [],
  searchResults: [],
  loadingStates: {
    user: 'idle',
    chatSessions: 'idle',
    chatMessages: 'idle',
    transcripts: 'idle',
    sendMessage: 'idle',
    voiceProcessing: 'idle',
  },
  errors: {
    user: null,
    chatSessions: null,
    chatMessages: null,
    transcripts: null,
    sendMessage: null,
    voiceProcessing: null,
    websocket: null,
  },
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isWebSocketConnected: false,
  apiHealthy: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.key]: action.loading,
        },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.key]: action.error,
        },
      };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.user,
        isAuthenticated: action.user !== null,
      };
    
    case 'SET_CURRENT_VIEW':
      return {
        ...state,
        currentView: action.view,
        isVoiceMode: action.view === 'voice',
      };
    
    case 'SET_VOICE_STATE':
      return {
        ...state,
        voiceState: action.state,
      };
    
    case 'TOGGLE_VOICE_MODE':
      const newView = state.isVoiceMode ? 'chat' : 'voice';
      return {
        ...state,
        isVoiceMode: !state.isVoiceMode,
        currentView: newView,
        voiceState: newView === 'voice' ? 'idle' : 'idle',
      };
    
    case 'SET_CHAT_SESSIONS':
      return {
        ...state,
        chatSessions: action.sessions,
      };
    
    case 'ADD_CHAT_SESSION':
      return {
        ...state,
        chatSessions: [action.session, ...state.chatSessions],
      };
    
    case 'UPDATE_CHAT_SESSION':
      return {
        ...state,
        chatSessions: state.chatSessions.map(session =>
          session.id === action.session.id ? action.session : session
        ),
      };
    
    case 'REMOVE_CHAT_SESSION':
      return {
        ...state,
        chatSessions: state.chatSessions.filter(session => session.id !== action.sessionId),
        currentChatSession: state.currentChatSession?.id === action.sessionId ? null : state.currentChatSession,
      };
    
    case 'SET_CURRENT_CHAT_SESSION':
      return {
        ...state,
        currentChatSession: action.session,
      };
    
    case 'SET_CHAT_MESSAGES':
      return {
        ...state,
        chatMessages: action.messages,
      };
    
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.message],
      };
    
    case 'SET_CURRENT_VOICE_SESSION':
      return {
        ...state,
        currentVoiceSession: action.session,
      };
    
    case 'SET_TRANSCRIPTS':
      return {
        ...state,
        transcripts: action.transcripts,
      };
    
    case 'ADD_TRANSCRIPT':
      return {
        ...state,
        transcripts: [action.transcript, ...state.transcripts],
      };
    
    case 'UPDATE_TRANSCRIPT':
      return {
        ...state,
        transcripts: state.transcripts.map(transcript =>
          transcript.id === action.transcript.id ? action.transcript : transcript
        ),
      };
    
    case 'REMOVE_TRANSCRIPT':
      return {
        ...state,
        transcripts: state.transcripts.filter(transcript => transcript.id !== action.transcriptId),
        currentTranscriptId: state.currentTranscriptId === action.transcriptId ? null : state.currentTranscriptId,
      };
    
    case 'SET_CURRENT_TRANSCRIPT':
      return {
        ...state,
        currentTranscriptId: action.transcriptId,
      };
    
    case 'ADD_TRANSCRIPT_MESSAGE':
      // This would be handled by the transcript system
      return state;
    
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.results,
      };
    
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isOnline: action.isOnline,
        isWebSocketConnected: action.isWebSocketConnected,
        apiHealthy: action.apiHealthy,
      };
    
    default:
      return state;
  }
}

// Context
interface AppContextType extends AppState {
  // Navigation
  setCurrentView: (view: CurrentView) => void;
  toggleVoiceMode: () => void;
  
  // Voice interface
  setVoiceState: (state: VoiceState) => void;
  
  // Chat methods
  loadChatSessions: () => Promise<void>;
  createChatSession: (title?: string) => Promise<ChatSession>;
  selectChatSession: (sessionId: string) => Promise<void>;
  sendMessage: (message: string, sessionId?: string) => Promise<void>;
  deleteChatSession: (sessionId: string) => Promise<void>;
  
  // Voice methods
  startVoiceSession: (title?: string) => Promise<VoiceSession>;
  endVoiceSession: (sessionId: string) => Promise<void>;
  processVoiceInput: (audioData: Blob | ArrayBuffer, sessionId: string) => Promise<void>;
  
  // Transcript methods
  loadTranscripts: () => Promise<void>;
  startTranscript: (type: 'chat' | 'voice', title: string) => string;
  endTranscript: (transcriptId: string) => void;
  addTranscriptMessage: (transcriptId: string, speaker: 'user' | 'delegate', content: string) => void;
  deleteTranscript: (transcriptId: string) => Promise<void>;
  downloadTranscript: (transcriptId: string, format?: 'json' | 'txt' | 'pdf') => Promise<void>;
  
  // Settings methods
  updateUserPreferences: (preferences: UpdatePreferencesRequest) => Promise<void>;
  
  // Search methods
  search: (query: string, type?: 'chat' | 'voice' | 'all') => Promise<void>;
  
  // Utility methods
  clearError: (key: keyof AppState['errors']) => void;
  checkApiHealth: () => Promise<void>;
  reconnectWebSocket: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper function to get the appropriate API service
const getApiService = () => {
  return config.enableMockData ? mockApiService : apiService;
};

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const setLoading = (key: keyof AppState['loadingStates'], loading: LoadingState) => {
    dispatch({ type: 'SET_LOADING', key, loading });
  };

  const setError = (key: keyof AppState['errors'], error: string | null) => {
    dispatch({ type: 'SET_ERROR', key, error });
  };

  const handleApiError = (error: any, key: keyof AppState['errors']) => {
    console.error(`API Error (${key}):`, error);
    setError(key, error.message || 'An unexpected error occurred');
    setLoading(key as keyof AppState['loadingStates'], 'error');
  };

  // Initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check API health first
        await checkApiHealth();
        
        // Load user data
        await loadUser();
        
        // Load initial data
        await loadChatSessions();
        await loadTranscripts();
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };

    initializeApp();

    // Set up network status monitoring
    const handleOnline = () => {
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        isOnline: true,
        isWebSocketConnected: wsService.isConnected(),
        apiHealthy: state.apiHealthy,
      });
      checkApiHealth();
    };

    const handleOffline = () => {
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        isOnline: false,
        isWebSocketConnected: false,
        apiHealthy: false,
      });
    };

    // Only add event listeners if window is available
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    // Set up WebSocket event handlers
    try {
      wsService.ensureInitialized();
      
      wsService.on('connected', () => {
        dispatch({
          type: 'SET_CONNECTION_STATUS',
          isOnline: state.isOnline,
          isWebSocketConnected: true,
          apiHealthy: state.apiHealthy,
        });
        setError('websocket', null);
      });

      wsService.on('disconnected', () => {
        dispatch({
          type: 'SET_CONNECTION_STATUS',
          isOnline: state.isOnline,
          isWebSocketConnected: false,
          apiHealthy: state.apiHealthy,
        });
      });

      wsService.on('error', (error) => {
        setError('websocket', 'WebSocket connection error');
      });

      wsService.on('reconnectFailed', () => {
        setError('websocket', 'Failed to reconnect to server');
      });
    } catch (error) {
      console.warn('WebSocket setup failed:', error);
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      
      if (!config.enableMockData) {
        try {
          apiService.cancelAllRequests();
          wsService.disconnect();
        } catch (error) {
          console.warn('Cleanup failed:', error);
        }
      }
    };
  }, []);

  // API methods
  const loadUser = async () => {
    try {
      setLoading('user', 'loading');
      setError('user', null);
      
      const api = getApiService();
      const user = await api.getCurrentUser();
      
      dispatch({ type: 'SET_USER', user });
      setLoading('user', 'success');
    } catch (error) {
      handleApiError(error, 'user');
    }
  };

  const checkApiHealth = async () => {
    try {
      const api = getApiService();
      const healthy = await api.healthCheck();
      
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        isOnline: state.isOnline,
        isWebSocketConnected: state.isWebSocketConnected,
        apiHealthy: healthy,
      });
    } catch (error) {
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        isOnline: state.isOnline,
        isWebSocketConnected: state.isWebSocketConnected,
        apiHealthy: false,
      });
    }
  };

  const loadChatSessions = async () => {
    try {
      setLoading('chatSessions', 'loading');
      setError('chatSessions', null);
      
      const api = getApiService();
      const sessions = await api.getChatSessions();
      
      dispatch({ type: 'SET_CHAT_SESSIONS', sessions });
      setLoading('chatSessions', 'success');
    } catch (error) {
      handleApiError(error, 'chatSessions');
    }
  };

  const createChatSession = async (title?: string): Promise<ChatSession> => {
    const api = getApiService();
    const session = await api.createChatSession(title);
    
    dispatch({ type: 'ADD_CHAT_SESSION', session });
    dispatch({ type: 'SET_CURRENT_CHAT_SESSION', session });
    
    return session;
  };

  const selectChatSession = async (sessionId: string) => {
    try {
      setLoading('chatMessages', 'loading');
      setError('chatMessages', null);
      
      const api = getApiService();
      const messages = await api.getChatMessages(sessionId);
      const session = state.chatSessions.find(s => s.id === sessionId);
      
      if (session) {
        dispatch({ type: 'SET_CURRENT_CHAT_SESSION', session });
        dispatch({ type: 'SET_CHAT_MESSAGES', messages });
        setLoading('chatMessages', 'success');
      }
    } catch (error) {
      handleApiError(error, 'chatMessages');
    }
  };

  const sendMessage = async (message: string, sessionId?: string) => {
    try {
      setLoading('sendMessage', 'loading');
      setError('sendMessage', null);
      
      const api = getApiService();
      const response = await api.sendChatMessage({
        message,
        sessionId: sessionId || state.currentChatSession?.id,
      });
      
      // Update current session if it was created
      if (!sessionId) {
        dispatch({ type: 'SET_CURRENT_CHAT_SESSION', session: response.session });
      }
      
      // Add user message first (if not already added)
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        sessionId: response.session.id,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      
      dispatch({ type: 'ADD_CHAT_MESSAGE', message: userMessage });
      dispatch({ type: 'ADD_CHAT_MESSAGE', message: response.message });
      dispatch({ type: 'UPDATE_CHAT_SESSION', session: response.session });
      
      setLoading('sendMessage', 'success');
    } catch (error) {
      handleApiError(error, 'sendMessage');
    }
  };

  const deleteChatSession = async (sessionId: string) => {
    try {
      const api = getApiService();
      await api.deleteChatSession(sessionId);
      
      dispatch({ type: 'REMOVE_CHAT_SESSION', sessionId });
    } catch (error) {
      console.error('Failed to delete chat session:', error);
    }
  };

  // Voice methods
  const startVoiceSession = async (title?: string): Promise<VoiceSession> => {
    const api = getApiService();
    const session = await api.startVoiceSession({ title });
    
    dispatch({ type: 'SET_CURRENT_VOICE_SESSION', session });
    
    if (!config.enableMockData) {
      wsService.startVoiceStream(session.id);
    }
    
    return session;
  };

  const endVoiceSession = async (sessionId: string) => {
    try {
      const api = getApiService();
      const session = await api.endVoiceSession(sessionId);
      
      dispatch({ type: 'SET_CURRENT_VOICE_SESSION', session });
      
      if (!config.enableMockData) {
        wsService.endVoiceStream(sessionId);
      }
    } catch (error) {
      console.error('Failed to end voice session:', error);
    }
  };

  const processVoiceInput = async (audioData: Blob | ArrayBuffer, sessionId: string) => {
    try {
      setLoading('voiceProcessing', 'loading');
      setError('voiceProcessing', null);
      
      const api = getApiService();
      const response = await api.processVoiceInput({
        sessionId,
        audioData,
        format: 'webm', // Default format
      });
      
      setLoading('voiceProcessing', 'success');
    } catch (error) {
      handleApiError(error, 'voiceProcessing');
    }
  };

  // Transcript methods (simplified for now)
  const loadTranscripts = async () => {
    try {
      setLoading('transcripts', 'loading');
      setError('transcripts', null);
      
      const api = getApiService();
      const transcripts = await api.getTranscripts();
      
      dispatch({ type: 'SET_TRANSCRIPTS', transcripts });
      setLoading('transcripts', 'success');
    } catch (error) {
      handleApiError(error, 'transcripts');
    }
  };

  const startTranscript = (type: 'chat' | 'voice', title: string): string => {
    const transcript: Transcript = {
      id: `transcript_${Date.now()}`,
      title,
      type,
      sessionId: type === 'chat' ? state.currentChatSession?.id || '' : state.currentVoiceSession?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      status: 'active',
    };
    
    dispatch({ type: 'ADD_TRANSCRIPT', transcript });
    dispatch({ type: 'SET_CURRENT_TRANSCRIPT', transcriptId: transcript.id });
    
    return transcript.id;
  };

  const endTranscript = (transcriptId: string) => {
    const transcript = state.transcripts.find(t => t.id === transcriptId);
    if (transcript) {
      const updatedTranscript = {
        ...transcript,
        status: 'completed' as const,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_TRANSCRIPT', transcript: updatedTranscript });
    }
  };

  const addTranscriptMessage = (transcriptId: string, speaker: 'user' | 'delegate', content: string) => {
    const message: TranscriptMessage = {
      id: `msg_${Date.now()}`,
      transcriptId,
      speaker,
      content,
      timestamp: new Date().toISOString(),
    };
    
    dispatch({ type: 'ADD_TRANSCRIPT_MESSAGE', transcriptId, message });
    
    // Update transcript message count
    const transcript = state.transcripts.find(t => t.id === transcriptId);
    if (transcript) {
      const updatedTranscript = {
        ...transcript,
        messageCount: transcript.messageCount + 1,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_TRANSCRIPT', transcript: updatedTranscript });
    }
  };

  const deleteTranscript = async (transcriptId: string) => {
    try {
      const api = getApiService();
      await api.deleteTranscript(transcriptId);
      
      dispatch({ type: 'REMOVE_TRANSCRIPT', transcriptId });
    } catch (error) {
      console.error('Failed to delete transcript:', error);
    }
  };

  const downloadTranscript = async (transcriptId: string, format: 'json' | 'txt' | 'pdf' = 'json') => {
    try {
      const api = getApiService();
      const blob = await api.downloadTranscript(transcriptId, format);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript_${transcriptId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download transcript:', error);
    }
  };

  // Settings methods
  const updateUserPreferences = async (preferences: UpdatePreferencesRequest) => {
    try {
      const api = getApiService();
      const user = await api.updateUserPreferences(preferences);
      
      dispatch({ type: 'SET_USER', user });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  // Search methods
  const search = async (query: string, type?: 'chat' | 'voice' | 'all') => {
    try {
      const api = getApiService();
      const results = await api.search({ query, type });
      
      dispatch({ type: 'SET_SEARCH_RESULTS', results });
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Utility methods
  const clearError = (key: keyof AppState['errors']) => {
    setError(key, null);
  };

  const reconnectWebSocket = () => {
    if (!config.enableMockData) {
      wsService.reconnect();
    }
  };

  // Navigation methods
  const setCurrentView = (view: CurrentView) => {
    dispatch({ type: 'SET_CURRENT_VIEW', view });
  };

  const toggleVoiceMode = () => {
    dispatch({ type: 'TOGGLE_VOICE_MODE' });
  };

  const setVoiceState = (voiceState: VoiceState) => {
    dispatch({ type: 'SET_VOICE_STATE', state: voiceState });
  };

  const contextValue: AppContextType = {
    ...state,
    setCurrentView,
    toggleVoiceMode,
    setVoiceState,
    loadChatSessions,
    createChatSession,
    selectChatSession,
    sendMessage,
    deleteChatSession,
    startVoiceSession,
    endVoiceSession,
    processVoiceInput,
    loadTranscripts,
    startTranscript,
    endTranscript,
    addTranscriptMessage,
    deleteTranscript,
    downloadTranscript,
    updateUserPreferences,
    search,
    clearError,
    checkApiHealth,
    reconnectWebSocket,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}