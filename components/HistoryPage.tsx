import { useState } from 'react';
import { useApp } from './AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  MessageSquare, 
  Trash2, 
  Search, 
  Calendar,
  User,
  Bot,
  Mic
} from 'lucide-react';
import { Separator } from './ui/separator';

export function HistoryPage() {
  const { sessions, switchToSession, deleteSession, searchSessions, setCurrentView } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = searchQuery.trim() ? searchSessions(searchQuery) : sessions;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessagePreview = (session: any) => {
    if (session.lastMessage) {
      return session.lastMessage.slice(0, 100) + (session.lastMessage.length > 100 ? '...' : '');
    }
    return 'No messages yet';
  };

  const groupSessionsByDate = (sessions: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    sessions.forEach(session => {
      const date = session.timestamp.toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(session);
    });

    return groups;
  };

  const sessionGroups = groupSessionsByDate(filteredSessions);

  const handleOpenSession = (sessionId: string) => {
    switchToSession(sessionId);
    setCurrentView('chat');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-medium mb-2">Conversation History</h1>
        <p className="text-muted-foreground">
          Browse and manage your past conversations
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary">
          {filteredSessions.length} conversation{filteredSessions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Start a new conversation to see it appear here
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(sessionGroups).map(([date, sessionsForDate]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">{new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</h3>
              </div>
              
              <div className="grid gap-4">
                {sessionsForDate.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base truncate">{session.title}</CardTitle>
                            <Badge variant={session.type === 'voice' ? 'default' : 'secondary'} className="gap-1">
                              {session.type === 'voice' ? <Mic className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                              {session.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(session.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="outline" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {session.messageCount}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenSession(session.id)}
                          >
                            Open
                          </Button>
                          {sessions.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteSession(session.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {getMessagePreview(session)}
                        </p>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {session.messageCount} messages
                            </span>
                            <span className="flex items-center gap-1">
                              {session.type === 'voice' ? <Mic className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                              {session.type} conversation
                            </span>
                          </div>
                          <span>
                            Last updated: {session.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}