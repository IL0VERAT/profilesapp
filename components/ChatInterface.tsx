import { useState, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from './ui/scroll-area';
import { useApp } from './AppContext';
import { Button } from './ui/button';
import { Plus, Mic } from 'lucide-react';

// Mock AI responses for demonstration
const mockAIResponses = [
  "I'm Delegate, and I'm here to help you with any questions or tasks you might have. What would you like to know?",
  "That's an interesting question! Let me think about that for a moment...",
  "I understand what you're asking. Here's my perspective on that:",
  "Great question! I can help you explore that topic further.",
  "I'm processing your request. Here's what I can tell you:",
  "That's a complex topic, but I'll do my best to explain it clearly.",
  "I appreciate you sharing that with me. Let me provide you with some insights.",
  "Based on what you've told me, here's what I would suggest:",
];

export function ChatInterface() {
  const { 
    chatSessions = [], // Use correct property name and provide default
    currentChatSession,
    chatMessages = [], // Use correct property name and provide default
    createChatSession,
    sendMessage,
    toggleVoiceMode,
    loadingStates
  } = useApp();
  
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      const scrollContainer = document.querySelector('[data-slot="scroll-area-viewport"]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleSendMessage = async (messageText: string) => {
    try {
      await sendMessage(messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCreateNewSession = async () => {
    try {
      await createChatSession();
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  // Show empty state if no session is selected
  if (!currentChatSession && chatSessions.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="text-muted-foreground space-y-2">
          <p>No conversation selected</p>
          <p className="text-sm">Select a conversation from the sidebar or start a new one</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleCreateNewSession} 
            className="gap-2 min-w-[160px]"
            disabled={loadingStates.chatSessions === 'loading'}
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </Button>
          <Button 
            onClick={toggleVoiceMode} 
            className="gap-2 min-w-[160px] bg-brand-blue hover:bg-brand-blue-dark text-white"
          >
            <Mic className="h-4 w-4" />
            Try Voice Mode
          </Button>
        </div>
        <div className="text-xs text-muted-foreground max-w-sm">
          Start with text chat or try voice mode for a more natural conversation experience with Delegate.
        </div>
      </div>
    );
  }

  // Show welcome state if no sessions exist
  if (chatSessions.length === 0 && loadingStates.chatSessions !== 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="text-muted-foreground space-y-2">
          <p>Welcome to Delegate AI</p>
          <p className="text-sm">Start your first conversation to begin chatting</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleCreateNewSession} 
            className="gap-2 min-w-[160px]"
            disabled={loadingStates.chatSessions === 'loading'}
          >
            <Plus className="h-4 w-4" />
            Start Chatting
          </Button>
          <Button 
            onClick={toggleVoiceMode} 
            className="gap-2 min-w-[160px] bg-brand-blue hover:bg-brand-blue-dark text-white"
          >
            <Mic className="h-4 w-4" />
            Try Voice Mode
          </Button>
        </div>
        <div className="text-xs text-muted-foreground max-w-sm">
          Start with text chat or try voice mode for a more natural conversation experience with Delegate.
        </div>
      </div>
    );
  }

  // Show loading state
  if (loadingStates.chatSessions === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="text-muted-foreground space-y-2">
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur">
        <div className="flex items-center gap-2">
          <h2 className="font-medium truncate">
            {currentChatSession?.title || 'New Chat'}
          </h2>
        </div>
        <Button
          onClick={toggleVoiceMode}
          variant="outline"
          size="sm"
          className="gap-2 shrink-0 border-brand-blue/30 text-brand-blue hover:bg-brand-blue hover:text-white"
        >
          <Mic className="h-4 w-4" />
          Voice Mode
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {chatMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message.content}
                isUser={message.role === 'user'}
                timestamp={message.timestamp}
              />
            ))}
            {(loadingStates.sendMessage === 'loading' || isTyping) && <TypingIndicator />}
          </div>
        </ScrollArea>
      </div>

      {/* Message input area with voice button */}
      <div className="flex items-end gap-2 p-4 border-t bg-background/50">
        {/* Prominent voice mode button */}
        <Button
          onClick={toggleVoiceMode}
          size="lg"
          className="h-12 w-12 rounded-full p-0 bg-brand-blue hover:bg-brand-blue-dark text-white shadow-lg shrink-0 relative overflow-hidden"
          title="Switch to Voice Mode"
        >
          <Mic className="h-5 w-5 relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-light/20 to-transparent"></div>
        </Button>
        
        <div className="flex-1">
          <MessageInput 
            onSendMessage={handleSendMessage} 
            disabled={loadingStates.sendMessage === 'loading'} 
          />
        </div>
      </div>
    </div>
  );
}