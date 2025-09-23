import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen'; // Mantém o carregamento inicial para a primeira tela
import MissionToast from './components/MissionToast';
import Tutorial from './components/Tutorial';
import SideNav from './components/SideNav';
import SplashScreen from './components/SplashScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { PwaInstallProvider } from './contexts/PwaInstallContext';
import { ChatProvider } from './contexts/ChatContext';
import { TutorialProvider } from './contexts/TutorialContext';

// Carregamento lento (lazy loading) para os componentes principais que não são necessários imediatamente
const ChatWindow = lazy(() => import('./components/ChatWindow'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));

// Um componente de fallback simples e centralizado para o Suspense
const LoadingFallback: React.FC = () => (
  <div className="flex-grow flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-t-transparent border-[var(--color-accent)] rounded-full animate-spin"></div>
  </div>
);

const CosmusApp: React.FC = () => {
  const { userName, setUserName, lastCompletedMission } = useUser();
  const [missionToast, setMissionToast] = useState<{ name: string; key: number } | null>(null);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (lastCompletedMission) {
      setMissionToast({ name: lastCompletedMission.name, key: lastCompletedMission.timestamp });
      
      const timer = setTimeout(() => {
        setMissionToast(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [lastCompletedMission]);


  return (
    <div className="flex bg-transparent text-[var(--color-text-base)] font-mono transition-colors duration-300 h-screen">
      <SplashScreen />
      <Tutorial />
      <Suspense fallback={<LoadingFallback />}>
        <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </Suspense>
      
      {missionToast && <MissionToast key={missionToast.key} missionName={missionToast.name} />}
      
      {userName ? (
        <>
          <SideNav 
            isProfileOpen={isProfileOpen}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <div className="flex flex-col flex-grow h-screen overflow-hidden">
            <Header />
            <main className="flex-grow p-2 sm:p-4 md:p-6 overflow-hidden">
              <Suspense fallback={<LoadingFallback />}>
                <ChatWindow />
              </Suspense>
            </main>
          </div>
        </>
      ) : (
          <WelcomeScreen onNameSubmit={setUserName} />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <UserProvider>
      <PwaInstallProvider>
        <ChatProvider>
          <TutorialProvider>
            <CosmusApp />
          </TutorialProvider>
        </ChatProvider>
      </PwaInstallProvider>
    </UserProvider>
  </ThemeProvider>
);

export default App;