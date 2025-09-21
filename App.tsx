import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import WelcomeScreen from './components/WelcomeScreen';
import MissionToast from './components/MissionToast';
import Tutorial from './components/Tutorial';
import SideNav from './components/SideNav'; // Import SideNav
import UserProfile from './components/UserProfile';
import SettingsModal from './components/SettingsModal'; // Import SettingsModal
import SplashScreen from './components/SplashScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { PwaInstallProvider } from './contexts/PwaInstallContext';
import { ChatProvider } from './contexts/ChatContext';
import { TutorialProvider } from './contexts/TutorialContext';

const CosmusApp: React.FC = () => {
  const { userName, setUserName, lastCompletedMission } = useUser();
  const [missionToast, setMissionToast] = useState<{ name: string; key: number } | null>(null);
  
  // O estado dos modais agora é gerenciado aqui
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
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
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
              <ChatWindow />
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