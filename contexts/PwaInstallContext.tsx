import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// A interface BeforeInstallPromptEvent não é um tipo de evento DOM padrão, então nós a definimos.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaInstallContextType {
  isInstallable: boolean;
  install: () => void;
}

const PwaInstallContext = createContext<PwaInstallContextType | undefined>(undefined);

export const PwaInstallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setPrompt(null);
      console.log('PWA foi instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    console.log(`Resposta do usuário ao prompt de instalação: ${outcome}`);
    // O prompt só pode ser usado uma vez.
    setPrompt(null);
  };

  return (
    <PwaInstallContext.Provider value={{ isInstallable: !!prompt, install }}>
      {children}
    </PwaInstallContext.Provider>
  );
};

export const usePwaInstall = (): PwaInstallContextType => {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error('usePwaInstall deve ser usado dentro de um PwaInstallProvider');
  }
  return context;
};