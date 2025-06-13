import { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { AnimatedLogo } from './AnimatedLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Mic, Square, MessageSquare, ChevronDown, HelpCircle } from 'lucide-react';

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

// Mock user inputs for simulation
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

export function VoiceInterface() {
  const { 
    voiceState, 
    setVoiceState, 
    toggleVoiceMode, 
    startTranscript, 
    endTranscript, 
    addTranscriptMessage, 
    currentTranscriptId 
  } = useApp();
  
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [conversationTurn, setConversationTurn] = useState(0);
  
  // Use refs to track the latest state in async callbacks
  const isActiveRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptIdRef = useRef<string | null>(null);

  // Update ref when conversation state changes
  useEffect(() => {
    isActiveRef.current = isConversationActive;
  }, [isConversationActive]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // End transcript if one is active
      if (transcriptIdRef.current) {
        endTranscript(transcriptIdRef.current);
      }
    };
  }, [endTranscript]);

  // Continuous conversation cycle
  const continueConversationCycle = () => {
    if (!isActiveRef.current) return;

    // Start listening
    setVoiceState('listening');
    setTranscript('');

    // Simulate listening period (2-3 seconds)
    timeoutRef.current = setTimeout(() => {
      if (!isActiveRef.current) return;
      
      setVoiceState('processing');
      // Simulate user input
      const userInput = userInputs[Math.floor(Math.random() * userInputs.length)];
      setTranscript(userInput);
      
      // Add user message to transcript
      if (transcriptIdRef.current) {
        addTranscriptMessage(transcriptIdRef.current, 'user', userInput);
      }
      
      // Simulate processing (1-3 seconds)
      timeoutRef.current = setTimeout(() => {
        if (!isActiveRef.current) return;
        
        const response = voiceResponses[Math.floor(Math.random() * voiceResponses.length)];
        setLastResponse(response);
        setVoiceState('speaking');
        setConversationTurn(prev => prev + 1);
        
        // Add AI response to transcript
        if (transcriptIdRef.current) {
          addTranscriptMessage(transcriptIdRef.current, 'delegate', response);
        }
        
        // Simulate speaking duration (2-4 seconds), then automatically continue
        timeoutRef.current = setTimeout(() => {
          if (isActiveRef.current) {
            // Automatically continue to next listening cycle
            continueConversationCycle();
          } else {
            setVoiceState('idle');
          }
        }, 2000 + Math.random() * 2000);
      }, 1000 + Math.random() * 2000);
    }, 2000 + Math.random() * 1000);
  };

  const startConversation = () => {
    setIsConversationActive(true);
    setConversationTurn(0);
    setTranscript('');
    setLastResponse('');
    
    // Start a new transcript
    const transcriptTitle = `Voice Conversation - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    const transcriptId = startTranscript('voice', transcriptTitle);
    transcriptIdRef.current = transcriptId;
    
    continueConversationCycle();
  };

  const stopConversation = () => {
    setIsConversationActive(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVoiceState('idle');
    setTranscript('');
    setLastResponse('');
    setConversationTurn(0);
    
    // End the transcript
    if (transcriptIdRef.current) {
      endTranscript(transcriptIdRef.current);
      transcriptIdRef.current = null;
    }
  };

  const getStatusInfo = () => {
    if (!isConversationActive) {
      return {
        title: 'Ready to chat',
        description: 'Tap the microphone to start a continuous conversation.',
      };
    }

    switch (voiceState) {
      case 'listening':
        return {
          title: 'Listening...',
          description: 'I can hear you. Speak naturally.',
        };
      case 'processing':
        return {
          title: 'Processing...',
          description: 'Analyzing your message.',
        };
      case 'speaking':
        return {
          title: 'Speaking...',
          description: lastResponse,
        };
      default:
        return {
          title: 'Ready to chat',
          description: 'Tap the microphone to start a continuous conversation.',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Simplified header with just the switch button */}
      <div className="flex items-center justify-end p-4 border-b">
        <Button
          variant="outline"
          onClick={toggleVoiceMode}
          className="gap-2 border-brand-blue/30 text-brand-blue hover:bg-brand-blue hover:text-white"
        >
          <MessageSquare className="h-5 w-5" />
          Switch to Chat
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        {/* Status */}
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border text-lg ${
            voiceState === 'listening' ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue' :
            voiceState === 'processing' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800/30 dark:text-amber-400' :
            voiceState === 'speaking' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-800/30 dark:text-green-400' :
            'bg-muted border-border text-muted-foreground'
          }`}>
            {statusInfo.title}
          </div>
          {isConversationActive && conversationTurn > 0 && (
            <div className="text-sm text-muted-foreground">
              Turn {conversationTurn} • Conversation active
              {transcriptIdRef.current && (
                <span className="ml-2">• Recording transcript</span>
              )}
            </div>
          )}
        </div>

        {/* Logo */}
        <AnimatedLogo state={voiceState} size="xl" />

        {/* Description */}
        <div className="text-center max-w-md">
          <p className="text-muted-foreground text-lg">
            {statusInfo.description}
          </p>
        </div>

        {/* Main control */}
        <div className="flex items-center gap-4">
          {!isConversationActive ? (
            <Button
              size="lg"
              onClick={startConversation}
              className="h-20 w-20 rounded-full p-0 relative overflow-hidden shadow-lg bg-brand-blue hover:bg-brand-blue-dark text-white"
            >
              <Mic className="h-8 w-8 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={stopConversation}
              className="h-20 w-20 rounded-full p-0 relative overflow-hidden shadow-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Square className="h-8 w-8 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            </Button>
          )}
        </div>

        {/* Conversation status */}
        {isConversationActive && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Conversation is active. Press the stop button to end.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your conversation is being automatically transcribed and saved.
            </p>
          </div>
        )}

        {/* Transcript */}
        {transcript && isConversationActive && (
          <Card className="w-full max-w-md p-4 border-brand-blue/20 bg-brand-accent">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">You said</p>
              <p>"{transcript}"</p>
            </div>
          </Card>
        )}

        {/* Last AI Response */}
        {lastResponse && voiceState !== 'speaking' && isConversationActive && (
          <Card className="w-full max-w-md p-4 border-green-200 bg-green-50 dark:border-green-800/30 dark:bg-green-950/20">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">Delegate said</p>
              <p>"{lastResponse}"</p>
            </div>
          </Card>
        )}
      </div>

      {/* Only show instructions when conversation is not active */}
      {!isConversationActive && (
        <div className="border-t bg-muted/30">
          <Collapsible open={isInstructionsOpen} onOpenChange={setIsInstructionsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full h-12 justify-between rounded-none border-none hover:bg-brand-accent"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-brand-blue" />
                  <span>How to use voice mode</span>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 transition-transform duration-200 text-brand-blue ${
                    isInstructionsOpen ? 'rotate-180' : ''
                  }`} 
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <div className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-brand-blue/10 border border-brand-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm text-brand-blue">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Start continuous conversation</p>
                      <p className="text-muted-foreground">Tap the microphone button once to begin a flowing conversation.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-brand-blue/10 border border-brand-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm text-brand-blue">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Speak when listening</p>
                      <p className="text-muted-foreground">When you see "Listening...", speak naturally. The conversation will continue automatically.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-brand-blue/10 border border-brand-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm text-brand-blue">3</span>
                    </div>
                    <div>
                      <p className="font-medium">End conversation</p>
                      <p className="text-muted-foreground">Press the stop button (square) anytime to end the conversation.</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground">
                    <strong>New:</strong> Voice mode now supports continuous conversations with automatic transcription! All conversations are saved and can be accessed in the Transcripts section.
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}