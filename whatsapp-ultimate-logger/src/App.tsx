import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { LockScreen } from './components/LockScreen';
import { Dashboard } from './pages/Dashboard';
import { 
  DeletedMessagesPanel, 
  StealthModePanel, 
  AISentimentPanel, 
  AutoResponderPanel, 
  GPSTrackerPanel, 
  CallLoggerPanel, 
  TranscriberPanel, 
  SessionManagerPanel, 
  TelegramPanel, 
  SchedulerPanel, 
  DeepSearchPanel, 
  AnalyticsPanel, 
  ExportPanel, 
  TrayModePanel, 
  TranslatorPanel, 
  DeepfakeScannerPanel, 
  MemberProfilerPanel 
} from './pages/OperationalPages';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stealthActive, setStealthActive] = useState<boolean>(false);
  const [locked, setLocked] = useState<boolean>(true); // Enforce lock on startup

  // Render selected operational page
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sessions':
        return <SessionManagerPanel />;
      case 'deleted':
        return <DeletedMessagesPanel />;
      case 'stealth':
        return <StealthModePanel />;
      case 'sentiment':
        return <AISentimentPanel />;
      case 'autoresponder':
        return <AutoResponderPanel />;
      case 'gps_media':
        return <GPSTrackerPanel />;
      case 'calls':
        return <CallLoggerPanel />;
      case 'transcriber':
        return <TranscriberPanel />;
      case 'deepsearch':
        return <DeepSearchPanel />;
      case 'analytics':
        return <AnalyticsPanel />;
      case 'export':
        return <ExportPanel />;
      case 'telegram':
        return <TelegramPanel />;
      case 'scheduler':
        return <SchedulerPanel />;
      case 'traymode':
        return <TrayModePanel />;
      
      // Custom AI tools
      case 'translator':
        return <TranslatorPanel />;
      case 'deepfake':
        return <DeepfakeScannerPanel />;
      case 'memberprofiler':
        return <MemberProfilerPanel />;
        
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {/* Encryption shield lock screen */}
      {locked && (
        <LockScreen onUnlock={() => setLocked(false)} />
      )}

      {/* Main Operational Dashboard Workspace */}
      <div className="h-screen w-screen flex overflow-hidden select-none bg-space-950">
        
        {/* Main Content Frame */}
        <div className="flex-1 h-full flex flex-col overflow-hidden relative z-0">
          <Topbar 
            stealthActive={stealthActive} 
            setStealthActive={setStealthActive} 
            triggerLock={() => setLocked(true)}
            sessionsCount={2}
          />
          
          <main className="flex-1 w-full overflow-hidden bg-black/10 relative z-0">
            {renderContent()}
          </main>
        </div>

        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
      </div>
    </>
  );
}

export default App;
