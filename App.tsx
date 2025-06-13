import { AppProvider, useApp } from './components/AppContext';
import { AppSidebar } from './components/AppSidebar';
import { ChatInterface } from './components/ChatInterface';
import { VoiceInterface } from './components/VoiceInterface';
import { SettingsPage } from './components/SettingsPage';
import { HistoryPage } from './components/HistoryPage';
import { TranscriptsPage } from './components/TranscriptsPage';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar';
import { Separator } from './components/ui/separator';
import { Alert, AlertDescription } from './components/ui/alert';
import { Button } from './components/ui/button';
import ErrorBoundary from './components/ErrorBoundary';
import { WifiOff, Server, RefreshCw, AlertTriangle } from 'lucide-react';
import { config } from './config/environment';

function ConnectionStatus() {
  const { isOnline, isWebSocketConnected, apiHealthy, errors, reconnectWebSocket, checkApiHealth } = useApp();

  if (isOnline && apiHealthy && (config.enableMockData || isWebSocketConnected)) {
    return null;
  }

  return (
    <div className="border-b bg-yellow-50 dark:bg-yellow-950/20">
      <div className="container mx-auto px-4 py-2">
        <Alert className="border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="flex items-center justify-between">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              {!isOnline && "No internet connection. Working in offline mode."}
              {isOnline && !apiHealthy && "API server unavailable. Using cached data."}
              {isOnline && apiHealthy && !isWebSocketConnected && !config.enableMockData && "Voice features unavailable. WebSocket connection failed."}
            </div>
            {(isOnline && (!apiHealthy || (!isWebSocketConnected && !config.enableMockData))) && (
              <div className="flex gap-2">
                {!apiHealthy && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => checkApiHealth()}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry API
                  </Button>
                )}
                {!isWebSocketConnected && !config.enableMockData && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={reconnectWebSocket}
                    className="h-7 text-xs"
                  >
                    <Server className="h-3 w-3 mr-1" />
                    Reconnect
                  </Button>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentView } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatInterface />;
      case 'voice':
        return <VoiceInterface />;
      case 'settings':
        return <SettingsPage />;
      case 'history':
        return <HistoryPage />;
      case 'transcripts':
        return <TranscriptsPage />;
      default:
        return <ChatInterface />;
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'chat':
        return 'Chat';
      case 'voice':
        return 'Voice Mode';
      case 'settings':
        return 'Settings';
      case 'history':
        return 'History';
      case 'transcripts':
        return 'Transcripts';
      default:
        return 'Chat';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ConnectionStatus />
      
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Only show header for non-voice views */}
          {currentView !== 'voice' && (
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2">
                  <span>{getViewTitle()}</span>
                  {config.enableMockData && (
                    <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-1 rounded">
                      Demo Mode
                    </span>
                  )}
                </div>
              </div>
            </header>
          )}
          
          <div className={`flex flex-1 flex-col ${currentView !== 'voice' ? 'gap-4 p-4 pt-0' : ''}`}>
            <div className={`min-h-[100vh] flex-1 ${currentView !== 'voice' ? 'rounded-xl bg-muted/50 md:min-h-min' : ''}`}>
              <ErrorBoundary>
                {renderCurrentView()}
              </ErrorBoundary>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}