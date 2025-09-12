import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

// Estrutura para os dados do usuário, para ser salva no localStorage
interface UserData {
  name: string | null;
  missionsCompleted: number;
  lastMission: { name: string; timestamp: number } | null;
  avatar: string | null; // Adiciona o campo de avatar
}

interface UserContextType {
  userName: string | null;
  avatar: string | null; // Adiciona avatar ao tipo de contexto
  missionsCompleted: number;
  rank: string;
  lastMission: { name: string; timestamp: number } | null;
  lastCompletedMission: { name: string; timestamp: number } | null;
  setUserName: (name: string) => void;
  setAvatar: (avatarDataUrl: string) => void; // Adiciona a função para definir o avatar
  completeMission: (missionName: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getRank = (missions: number): string => {
  if (missions >= 30) return 'Comandante da Frota Estelar';
  if (missions >= 15) return 'Capitão Cósmico';
  if (missions >= 5) return 'Tenente Espacial';
  return 'Cadete Estelar';
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(() => {
    try {
      const savedData = localStorage.getItem('cosmus-userData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Remove a propriedade chatHistory de dados legados para manter o armazenamento limpo
        delete parsedData.chatHistory;
        return {
            name: null,
            missionsCompleted: 0,
            lastMission: null,
            avatar: null,
            ...parsedData // Mescla com dados salvos, garantindo que novos campos (como avatar) existam
        };
      }
    } catch (error) {
      console.warn("Não foi possível acessar o localStorage:", error);
    }
    return { name: null, missionsCompleted: 0, lastMission: null, avatar: null };
  });

  const [lastCompletedMission, setLastCompletedMission] = useState<{ name: string; timestamp: number } | null>(null);

  const saveUserData = useCallback((data: UserData) => {
    try {
      localStorage.setItem('cosmus-userData', JSON.stringify(data));
      setUserData(data);
    } catch (error) {
      console.warn("Não foi possível salvar os dados do usuário no localStorage:", error);
      setUserData(data); // Ainda define o estado para a sessão atual
    }
  }, []);

  const setUserName = useCallback((name: string) => {
    saveUserData({ ...userData, name });
  }, [userData, saveUserData]);
  
  const setAvatar = useCallback((avatarDataUrl: string) => {
    saveUserData({ ...userData, avatar: avatarDataUrl });
  }, [userData, saveUserData]);

  const completeMission = useCallback((missionName: string) => {
    const newMission = { name: missionName, timestamp: Date.now() };
    saveUserData({
      ...userData,
      missionsCompleted: userData.missionsCompleted + 1,
      lastMission: newMission,
    });
    setLastCompletedMission(newMission); // Dispara o efeito para o toast
  }, [userData, saveUserData]);

  const rank = useMemo(() => getRank(userData.missionsCompleted), [userData.missionsCompleted]);

  const value = {
    userName: userData.name,
    avatar: userData.avatar,
    missionsCompleted: userData.missionsCompleted,
    rank,
    lastMission: userData.lastMission,
    lastCompletedMission,
    setUserName,
    setAvatar,
    completeMission,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    {/* FIX: Corrected closing tag typo from </User-Provider> to match the opening <UserContext.Provider>. */}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
};