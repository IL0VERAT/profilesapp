import { useApp } from './AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { MessageSquareText, Users, Zap, Flame, Target } from 'lucide-react';

export function SettingsPage() {
  const { debateStrength, setDebateStrength, sessions, messages, transcripts } = useApp();

  const debateStrengthOptions = [
    {
      value: 'collaborative' as const,
      label: 'Collaborative',
      icon: Users,
      description: 'Focuses on finding common ground and building on your ideas',
      color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800/30'
    },
    {
      value: 'balanced' as const,
      label: 'Balanced',
      icon: MessageSquareText,
      description: 'Provides thoughtful counterpoints while being respectful',
      color: 'bg-brand-accent text-brand-blue border-brand-blue/20'
    },
    {
      value: 'assertive' as const,
      label: 'Assertive',
      icon: Target,
      description: 'Challenges your ideas more directly with clear reasoning',
      color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/30'
    },
    {
      value: 'strong' as const,
      label: 'Strong',
      icon: Zap,
      description: 'Actively debates and pushes back on weak arguments',
      color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800/30'
    },
    {
      value: 'aggressive' as const,
      label: 'Aggressive',
      icon: Flame,
      description: 'Maximum debate intensity - expect fierce intellectual challenges',
      color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/30'
    }
  ];

  const currentDebateOption = debateStrengthOptions.find(option => option.value === debateStrength);

  const totalMessages = messages.length;
  const userMessages = messages.filter(msg => msg.isUser).length;

  const handleReset = () => {
    setDebateStrength('balanced');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-medium mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your AI assistant experience
        </p>
      </div>

      <div className="grid gap-6">
        {/* Debate Strength Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Debate Strength</CardTitle>
            <CardDescription>
              Control how assertive the AI is when discussing ideas and challenging your thoughts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="debateStrength">Debate Style</Label>
              <Select
                value={debateStrength}
                onValueChange={(value) => setDebateStrength(value as typeof debateStrength)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {debateStrengthOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Current Selection Display */}
            {currentDebateOption && (
              <div className={`p-4 rounded-lg border ${currentDebateOption.color}`}>
                <div className="flex items-start gap-3">
                  <currentDebateOption.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium mb-1">{currentDebateOption.label} Mode</div>
                    <p className="text-sm opacity-90">{currentDebateOption.description}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-2">
              <p>Choose how you want the AI to engage with your ideas:</p>
              <div className="space-y-1">
                <div><strong>Collaborative:</strong> Works with you to develop ideas together</div>
                <div><strong>Balanced:</strong> Provides helpful counterpoints (recommended)</div>
                <div><strong>Assertive:</strong> Challenges weak reasoning more directly</div>
                <div><strong>Strong:</strong> Actively debates and tests your arguments</div>
                <div><strong>Aggressive:</strong> Maximum intellectual challenge and debate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice & Transcript Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Voice & Transcripts</CardTitle>
            <CardDescription>
              Settings for voice conversations and transcript management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Automatic Transcription</div>
                  <div className="text-sm text-muted-foreground">Voice conversations are automatically transcribed and saved</div>
                </div>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Continuous Conversations</div>
                  <div className="text-sm text-muted-foreground">Voice mode supports flowing, natural conversations</div>
                </div>
                <Badge variant="secondary">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>
              Overview of your AI assistant usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-medium">{sessions.length}</div>
                <div className="text-sm text-muted-foreground">Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium">{totalMessages}</div>
                <div className="text-sm text-muted-foreground">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium">{userMessages}</div>
                <div className="text-sm text-muted-foreground">Your Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-medium">{transcripts.length}</div>
                <div className="text-sm text-muted-foreground">Saved Transcripts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant Information */}
        <Card>
          <CardHeader>
            <CardTitle>About Delegate AI</CardTitle>
            <CardDescription>
              Information about your AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="font-medium mb-2">AI Identity</div>
                <p className="text-sm text-muted-foreground">
                  Your AI assistant identifies as "Delegate" and is designed to provide helpful, 
                  accurate responses while adapting to your preferred debate style.
                </p>
              </div>
              
              <div>
                <div className="font-medium mb-2">Capabilities</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• Text and voice conversations</div>
                  <div>• Adjustable debate and discussion styles</div>
                  <div>• Automatic conversation transcription</div>
                  <div>• Multi-session conversation management</div>
                  <div>• Conversation history and search</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}