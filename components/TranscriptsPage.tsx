import { useState } from 'react';
import { useApp } from './AppContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Search, MessageSquare, Mic, Clock, Trash2, Download, Eye } from 'lucide-react';

export function TranscriptsPage() {
  const { transcripts, searchTranscripts, deleteTranscript, getTranscripts } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'chat' | 'voice'>('all');

  const filteredTranscripts = searchQuery.trim() 
    ? searchTranscripts(searchQuery)
    : activeTab === 'all' 
      ? transcripts 
      : getTranscripts(activeTab);

  const getTranscriptById = (id: string) => {
    return transcripts.find(t => t.id === id);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const downloadTranscript = (transcript: any) => {
    const content = [
      `${transcript.title}`,
      `Date: ${formatDate(transcript.startTime)}`,
      `Type: ${transcript.type}`,
      transcript.duration ? `Duration: ${formatDuration(transcript.duration)}` : '',
      '---',
      '',
      ...transcript.messages.map((msg: any) => 
        `${msg.speaker === 'user' ? 'You' : 'Delegate'} (${formatDate(msg.timestamp)}): ${msg.content}`
      )
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${transcript.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedTranscriptData = selectedTranscript ? getTranscriptById(selectedTranscript) : null;

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="space-y-2">
          <h2>Conversation Transcripts</h2>
          <p className="text-muted-foreground max-w-2xl">
            Access and manage your chat and voice conversation history
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transcripts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'chat' | 'voice')} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All ({transcripts.length})</TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat ({getTranscripts('chat').length})
          </TabsTrigger>
          <TabsTrigger value="voice">
            <Mic className="w-4 h-4 mr-2" />
            Voice ({getTranscripts('voice').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex-1">
          <ScrollArea className="h-[calc(100vh-400px)]">
            {filteredTranscripts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  {searchQuery.trim() ? 'No transcripts found matching your search.' : 'No transcripts yet.'}
                </div>
                {!searchQuery.trim() && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Start a conversation to create your first transcript.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTranscripts.map((transcript) => (
                  <Card key={transcript.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <CardTitle>{transcript.title}</CardTitle>
                          
                          {/* Transcript metadata */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-4 text-sm">
                              <Badge variant={transcript.type === 'voice' ? 'default' : 'secondary'} className="gap-1">
                                {transcript.type === 'voice' ? <Mic className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                                {transcript.type}
                              </Badge>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatDate(transcript.startTime)}
                              </span>
                              {transcript.duration && (
                                <span className="text-muted-foreground">
                                  Duration: {formatDuration(transcript.duration)}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {transcript.messages.length} messages
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2">
                        <Dialog open={selectedTranscript === transcript.id} onOpenChange={(open) => setSelectedTranscript(open ? transcript.id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>{selectedTranscriptData?.title}</DialogTitle>
                              <DialogDescription>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge variant={selectedTranscriptData?.type === 'voice' ? 'default' : 'secondary'} className="gap-1">
                                    {selectedTranscriptData?.type === 'voice' ? <Mic className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                                    {selectedTranscriptData?.type}
                                  </Badge>
                                  <span>{selectedTranscriptData ? formatDate(selectedTranscriptData.startTime) : ''}</span>
                                  {selectedTranscriptData?.duration && (
                                    <span>Duration: {formatDuration(selectedTranscriptData.duration)}</span>
                                  )}
                                </div>
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedTranscriptData && (
                              <ScrollArea className="max-h-[60vh] mt-4">
                                <div className="space-y-4">
                                  {selectedTranscriptData.messages.map((message, index) => (
                                    <div key={index} className={`flex gap-3 ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                        message.speaker === 'user' 
                                          ? 'bg-brand-blue text-white' 
                                          : 'bg-muted'
                                      }`}>
                                        <div className="text-sm opacity-70 mb-1">
                                          {message.speaker === 'user' ? 'You' : 'Delegate'} • {formatDate(message.timestamp)}
                                        </div>
                                        <div>{message.content}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => downloadTranscript(transcript)}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Transcript</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this transcript? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteTranscript(transcript.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}