export interface Environment {
  apiBaseURL: string;
  websocketURL: string;
  apiKey?: string;
  environment: 'development' | 'staging' | 'production';
  enableMockData: boolean;
  voiceProvider: 'openai' | 'azure' | 'google';
  chatModel: string;
  maxRetries: number;
  requestTimeout: number;
}

// Safe environment variable access with fallbacks
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // For development, just return default values to avoid build issues
  if (typeof process === 'undefined' && typeof window === 'undefined') {
    return defaultValue;
  }
  
  // Try to access environment variables safely
  try {
    // Check process.env first (Node.js/build time)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] || defaultValue;
    }
    
    // For client-side, environment variables are typically injected at build time
    // Return default value if not available
    return defaultValue;
  } catch (error) {
    console.warn(`Failed to access environment variable ${key}, using default:`, defaultValue);
    return defaultValue;
  }
};

const getBoolEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnvVar(key, defaultValue.toString());
  return value === 'true' || value === '1';
};

const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key, defaultValue.toString());
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Default configuration for development
export const config: Environment = {
  apiBaseURL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001/api'),
  websocketURL: getEnvVar('VITE_WS_URL', 'ws://localhost:3001'),
  apiKey: getEnvVar('VITE_API_KEY', ''),
  environment: (getEnvVar('VITE_ENV', 'development') as Environment['environment']),
  enableMockData: getBoolEnvVar('VITE_ENABLE_MOCK_DATA', true),
  voiceProvider: (getEnvVar('VITE_VOICE_PROVIDER', 'openai') as Environment['voiceProvider']),
  chatModel: getEnvVar('VITE_CHAT_MODEL', 'gpt-4'),
  maxRetries: getNumberEnvVar('VITE_MAX_RETRIES', 3),
  requestTimeout: getNumberEnvVar('VITE_REQUEST_TIMEOUT', 30000),
};

// Validate required environment variables
export function validateEnvironment(): void {
  const errors: string[] = [];

  // Only validate if we're not using mock data
  if (!config.enableMockData) {
    if (!config.apiBaseURL || config.apiBaseURL === 'http://localhost:3001/api') {
      errors.push('VITE_API_BASE_URL must be set when mock data is disabled');
    }
    
    if (!config.apiKey) {
      errors.push('VITE_API_KEY is required when mock data is disabled');
    }
  }

  // Validate environment value
  const validEnvironments = ['development', 'staging', 'production'];
  if (!validEnvironments.includes(config.environment)) {
    console.warn(`Invalid environment "${config.environment}", defaulting to development`);
    (config as any).environment = 'development';
  }

  // Validate voice provider
  const validProviders = ['openai', 'azure', 'google'];
  if (!validProviders.includes(config.voiceProvider)) {
    console.warn(`Invalid voice provider "${config.voiceProvider}", defaulting to openai`);
    (config as any).voiceProvider = 'openai';
  }

  // Only throw errors in production, otherwise enable mock data
  if (errors.length > 0) {
    console.error('Environment validation failed:', errors);
    if (config.environment === 'production') {
      throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
    } else {
      console.warn('Development mode: enabling mock data due to missing configuration');
      (config as any).enableMockData = true;
    }
  }
}

// Initialize and log configuration
try {
  if (config.environment === 'development') {
    console.log('🔧 Environment Configuration:', {
      environment: config.environment,
      enableMockData: config.enableMockData,
      apiBaseURL: config.apiBaseURL,
      hasApiKey: !!config.apiKey,
      voiceProvider: config.voiceProvider,
    });
  }
} catch (error) {
  console.warn('Failed to log environment configuration:', error);
}