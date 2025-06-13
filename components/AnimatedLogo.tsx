import { Bot } from 'lucide-react';
import { VoiceState } from './AppContext';

interface AnimatedLogoProps {
  state: VoiceState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AnimatedLogo({ state, size = 'xl' }: AnimatedLogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const getStateClasses = () => {
    switch (state) {
      case 'listening':
        return 'bg-brand-blue/10 border-brand-blue/30 shadow-lg';
      case 'processing':
        return 'bg-amber-50 border-amber-200 shadow-lg dark:bg-amber-950/20 dark:border-amber-800/30';
      case 'speaking':
        // Use blue for speaking (responding back) 
        return 'bg-brand-blue/10 border-brand-blue/30 shadow-lg';
      default:
        return 'bg-muted border-border';
    }
  };

  const getIconColor = () => {
    switch (state) {
      case 'listening':
        return 'text-brand-blue';
      case 'processing':
        return 'text-amber-600 dark:text-amber-400';
      case 'speaking':
        // Use blue for speaking (responding back)
        return 'text-brand-blue';
      default:
        return 'text-muted-foreground';
    }
  };

  // Inline animation styles 
  const getAnimationStyle = () => {
    switch (state) {
      case 'listening':
        return {
          animation: 'breathe 3s ease-in-out infinite',
          boxShadow: '0 0 20px rgba(91, 155, 213, 0.3)',
        };
      case 'processing':
        return {
          animation: 'rotateGlow 2s linear infinite',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
        };
      case 'speaking':
        // Use blue pulse/glow for speaking (responding back)
        return {
          animation: 'breathe 2.5s ease-in-out infinite',
          boxShadow: '0 0 25px rgba(91, 155, 213, 0.4)',
        };
      default:
        return {};
    }
  };

  const isActive = state !== 'idle';

  return (
    <div className="relative">
      {/* Add keyframes dynamically */}
      <style>{`
        @keyframes breathe {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(91, 155, 213, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(91, 155, 213, 0.5);
            transform: scale(1.02);
          }
        }
        
        @keyframes wave {
          0%, 100% { 
            box-shadow: 0 0 25px rgba(34, 197, 94, 0.4);
            transform: scale(1);
          }
          25% { 
            box-shadow: 0 0 35px rgba(34, 197, 94, 0.6);
            transform: scale(1.03);
          }
          50% { 
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
            transform: scale(0.99);
          }
          75% { 
            box-shadow: 0 0 40px rgba(34, 197, 94, 0.7);
            transform: scale(1.04);
          }
        }
        
        @keyframes rotateGlow {
          0% { 
            transform: rotate(0deg);
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
          }
          50% { 
            box-shadow: 0 0 30px rgba(245, 158, 11, 0.6);
          }
          100% { 
            transform: rotate(360deg);
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
          }
        }
        
        @keyframes pulseRing {
          0% { 
            transform: scale(0.8);
            opacity: 1;
          }
          100% { 
            transform: scale(2.4);
            opacity: 0;
          }
        }
        
        @keyframes speakingPulseRing {
          0% { 
            transform: scale(0.9);
            opacity: 1;
          }
          100% { 
            transform: scale(2.6);
            opacity: 0;
          }
        }
        
        @keyframes listeningDots {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        @keyframes speakingBars {
          0%, 100% { 
            height: 0.75rem;
            opacity: 0.6;
          }
          50% { 
            height: 1.25rem;
            opacity: 1;
          }
        }
      `}</style>

      {/* Animated glow rings for listening state */}
      {state === 'listening' && (
        <>
          <div
            className={`absolute inset-0 rounded-full bg-brand-blue/20 ${sizeClasses[size]}`}
            style={{
              animation: 'pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
              animationDelay: '0s'
            }}
          />
          <div
            className={`absolute inset-0 rounded-full bg-brand-blue/15 ${sizeClasses[size]}`}
            style={{
              animation: 'pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
              animationDelay: '0.6s'
            }}
          />
          <div
            className={`absolute inset-0 rounded-full bg-brand-blue/10 ${sizeClasses[size]}`}
            style={{
              animation: 'pulseRing 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
              animationDelay: '1.2s'
            }}
          />
        </>
      )}

      {/* Blue pulsing rings for speaking state (responding back to user) */}
      {state === 'speaking' && (
        <>
          <div
            className={`absolute inset-0 rounded-full bg-brand-blue/25 ${sizeClasses[size]}`}
            style={{
              animation: 'speakingPulseRing 1.8s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
              animationDelay: '0s'
            }}
          />
          <div
            className={`absolute inset-0 rounded-full bg-brand-blue/20 ${sizeClasses[size]}`}
            style={{
              animation: 'speakingPulseRing 1.8s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
              animationDelay: '0.4s'
            }}
          />
          <div
            className={`absolute inset-0 rounded-full bg-brand-blue/15 ${sizeClasses[size]}`}
            style={{
              animation: 'speakingPulseRing 1.8s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
              animationDelay: '0.8s'
            }}
          />
        </>
      )}

      {state === 'processing' && (
        <div
          className={`absolute inset-0 rounded-full bg-amber-400/20 ${sizeClasses[size]}`}
          style={{
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        />
      )}

      {/* Secondary subtle glow */}
      {isActive && (
        <div
          className={`
            absolute inset-2 rounded-full opacity-40
            ${state === 'listening' ? 'bg-brand-blue/20' : ''}
            ${state === 'processing' ? 'bg-amber-300/30' : ''}
            ${state === 'speaking' ? 'bg-brand-blue/20' : ''}
          `}
          style={{
            animation: `pulse ${state === 'listening' || state === 'speaking' ? '4s' : '2s'} ease-in-out infinite`
          }}
        />
      )}

      {/* Main logo container with custom animations */}
      <div
        className={`
          ${sizeClasses[size]} 
          ${getStateClasses()}
          rounded-full border-2 flex items-center justify-center
          transition-all duration-500 ease-in-out
          relative z-10
        `}
        style={getAnimationStyle()}
      >
        <Bot className={`${iconSizes[size]} ${getIconColor()} transition-all duration-300`} />
      </div>

      {/* Enhanced state indicators with custom animations */}
      {state === 'listening' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div 
            className="w-2 h-2 bg-brand-blue rounded-full" 
            style={{
              animation: 'listeningDots 1.4s ease-in-out infinite',
              animationDelay: '0s'
            }}
          />
          <div 
            className="w-2 h-2 bg-brand-blue rounded-full" 
            style={{
              animation: 'listeningDots 1.4s ease-in-out infinite',
              animationDelay: '0.3s'
            }}
          />
          <div 
            className="w-2 h-2 bg-brand-blue rounded-full" 
            style={{
              animation: 'listeningDots 1.4s ease-in-out infinite',
              animationDelay: '0.6s'
            }}
          />
        </div>
      )}

      {/* Processing indicator - rotating dots */}
      {state === 'processing' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            <div 
              className="w-1.5 h-4 bg-amber-500 rounded-full" 
              style={{
                animation: 'bounce 1s infinite',
                animationDelay: '0ms'
              }}
            />
            <div 
              className="w-1.5 h-4 bg-amber-500 rounded-full" 
              style={{
                animation: 'bounce 1s infinite',
                animationDelay: '150ms'
              }}
            />
            <div 
              className="w-1.5 h-4 bg-amber-500 rounded-full" 
              style={{
                animation: 'bounce 1s infinite',
                animationDelay: '300ms'
              }}
            />
          </div>
        </div>
      )}

      {/* Speaking indicator - blue sound bars to match the blue theme */}
      {state === 'speaking' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-0.5 items-end">
            <div 
              className="w-1 bg-brand-blue rounded-full" 
              style={{
                height: '1rem',
                animation: 'speakingBars 0.8s ease-in-out infinite',
                animationDelay: '0ms'
              }}
            />
            <div 
              className="w-1 bg-brand-blue rounded-full" 
              style={{
                height: '0.75rem',
                animation: 'speakingBars 0.8s ease-in-out infinite',
                animationDelay: '100ms'
              }}
            />
            <div 
              className="w-1 bg-brand-blue rounded-full" 
              style={{
                height: '1.25rem',
                animation: 'speakingBars 0.8s ease-in-out infinite',
                animationDelay: '200ms'
              }}
            />
            <div 
              className="w-1 bg-brand-blue rounded-full" 
              style={{
                height: '0.5rem',
                animation: 'speakingBars 0.8s ease-in-out infinite',
                animationDelay: '300ms'
              }}
            />
            <div 
              className="w-1 bg-brand-blue rounded-full" 
              style={{
                height: '1rem',
                animation: 'speakingBars 0.8s ease-in-out infinite',
                animationDelay: '400ms'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}