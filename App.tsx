import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import WelcomeScreen from './components/WelcomeScreen';
import MissionToast from './components/MissionToast';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { PwaInstallProvider } from './contexts/PwaInstallContext';
import { ChatProvider } from './contexts/ChatContext';

const CosmusApp: React.FC = () => {
  const { userName, setUserName, lastCompletedMission } = useUser();
  const [missionToast, setMissionToast] = useState<{ name: string; key: number } | null>(null);

  useEffect(() => {
    if (lastCompletedMission) {
      // Usamos a key para re-acionar a animação se a mesma missão for completada novamente (improvável, mas seguro)
      setMissionToast({ name: lastCompletedMission.name, key: lastCompletedMission.timestamp });
      
      const timer = setTimeout(() => {
        setMissionToast(null);
      }, 5000); // O toast desaparece após 5 segundos (a duração da animação)

      return () => clearTimeout(timer);
    }
  }, [lastCompletedMission]);


  return (
    <div className="flex flex-col h-screen bg-transparent text-[var(--color-text-base)] font-mono transition-colors duration-300">
      {missionToast && <MissionToast key={missionToast.key} missionName={missionToast.name} />}
      {userName ? (
        <>
          <Header />
          <main className="flex-grow p-2 sm:p-4 md:p-6 overflow-hidden">
            <ChatWindow />
          </main>
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
          <CosmusApp />
        </ChatProvider>
      </PwaInstallProvider>
    </UserProvider>
  </ThemeProvider>
);

export default App;