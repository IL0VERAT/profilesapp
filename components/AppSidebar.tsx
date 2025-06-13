import { useApp } from './AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from './ui/sidebar';
import { 
  MessageSquare, 
  Mic, 
  Settings, 
  History, 
  Search, 
  Plus, 
  Trash2,
  FileText
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import delegateLogo from 'figma:asset/98d43dcf6b53047cfa083d0de0852d8ec35cb88d.png';

export function AppSidebar() {
  const { 
    currentView, 
    setCurrentView, 
    chatSessions = [], // Default to empty array to prevent undefined error
    currentChatSession,
    createChatSession, 
    selectChatSession, 
    deleteChatSession
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Simple search function for chat sessions
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) {
      return chatSessions;
    }
    
    const query = searchQuery.toLowerCase();
    return chatSessions.filter(session => 
      session.title.toLowerCase().includes(query) ||
      (session.lastMessage && session.lastMessage.toLowerCase().includes(query))
    );
  }, [searchQuery, chatSessions]);

  const handleNewChat = async () => {
    try {
      await createChatSession();
      setCurrentView('chat');
    } catch (error) {
      console.error('Failed to create new chat session:', error);
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    try {
      await selectChatSession(sessionId);
      setCurrentView('chat');
    } catch (error) {
      console.error('Failed to select chat session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteChatSession(sessionId);
    } catch (error) {
      console.error('Failed to delete chat session:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex items-center gap-2">
            <ImageWithFallback 
              src={delegateLogo} 
              alt="Delegate AI Logo" 
              className="w-8 h-8 rounded-md object-contain"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-brand-blue">Delegate AI</span>
              <span className="text-xs text-muted-foreground">Powered by Project Delegate</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentView('chat')}
                  isActive={currentView === 'chat'}
                  className="gap-3"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentView('voice')}
                  isActive={currentView === 'voice'}
                  className="gap-3"
                >
                  <Mic className="h-5 w-5" />
                  <span>Voice Mode</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentView('transcripts')}
                  isActive={currentView === 'transcripts'}
                  className="gap-3"
                >
                  <FileText className="h-5 w-5" />
                  <span>Transcripts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentView('history')}
                  isActive={currentView === 'history'}
                  className="gap-3"
                >
                  <History className="h-5 w-5" />
                  <span>History</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setCurrentView('settings')}
                  isActive={currentView === 'settings'}
                  className="gap-3"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Chat Sessions */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Recent Chats</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleNewChat}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </SidebarGroupLabel>
          
          {showSearch && (
            <div className="px-2 pb-2">
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>
          )}
          
          <SidebarGroupContent>
            <ScrollArea className="flex-1">
              <SidebarMenu>
                {filteredSessions.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    {searchQuery.trim() ? 'No chats found' : 'No chats yet'}
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <SidebarMenuItem key={session.id}>
                      <div className="group relative">
                        <SidebarMenuButton
                          onClick={() => handleSessionClick(session.id)}
                          isActive={currentChatSession?.id === session.id}
                          className="h-auto py-2 px-2 w-full text-left items-start"
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            {/* Title and Badge Row */}
                            <div className="flex items-center gap-2 w-full pr-6">
                              <span className="text-sm font-medium truncate flex-1 min-w-0">
                                {session.title}
                              </span>
                              <Badge 
                                variant="secondary" 
                                className="text-xs shrink-0 h-4 px-1"
                              >
                                <MessageSquare className="h-2.5 w-2.5" />
                              </Badge>
                            </div>
                            
                            {/* Message and Time Row */}
                            <div className="flex items-center gap-2 w-full pr-6">
                              <span className="text-xs text-muted-foreground truncate flex-1 min-w-0">
                                {session.lastMessage || 'No messages yet'}
                              </span>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {formatDate(session.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </SidebarMenuButton>
                        
                        {/* Delete button positioned absolutely to avoid nesting */}
                        <div 
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                        >
                          <div className="h-5 w-5 rounded-sm hover:bg-destructive/20 flex items-center justify-center cursor-pointer text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by Project Delegate
          </p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}