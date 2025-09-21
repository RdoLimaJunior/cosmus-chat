import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

// Nova estrutura para uma missão
interface Mission {
  name: string;
  timestamp: number;
}

// Estrutura para os dados do usuário, para ser salva no localStorage
interface UserData {
  name: string | null;
  missionHistory: Mission[];
  avatar: string | null;
}

interface UserContextType {
  userName: string | null;
  avatar: string | null;
  missionsCompleted: number;
  rank: string;
  lastMission: Mission | null;
  lastCompletedMission: Mission | null; // Para o toast
  missionHistory: Mission[]; // Expor o histórico completo
  setUserName: (name: string) => void;
  setAvatar: (avatarDataUrl: string) => void;
  removeAvatar: () => void;
  completeMission: (missionName: string) => void;
  signOut: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getRank = (missions: number): string => {
  if (missions >= 30) return 'Comandante da Frota Estelar';
  if (missions >= 15) return 'Capitão Cósmico';
  if (missions >= 5) return 'Tenente Espacial';
  return 'Cadete Estelar';
};

const initialUserData: UserData = { name: null, missionHistory: [], avatar: null };

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(() => {
    try {
      const savedData = localStorage.getItem('cosmus-userData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Migração simples de dados legados para a nova estrutura de histórico
        if (typeof parsedData.missionsCompleted === 'number' && !parsedData.missionHistory) {
            const newHistory: Mission[] = [];
            if (parsedData.lastMission) {
                newHistory.push(parsedData.lastMission);
            }
            // Não podemos recuperar o histórico completo, mas o último é preservado.
            parsedData.missionHistory = newHistory;
        }

        // Remove campos antigos
        delete parsedData.missionsCompleted;
        delete parsedData.lastMission;
        delete parsedData.chatHistory;

        return {
            ...initialUserData,
            ...parsedData
        };
      }
    } catch (error) {
      console.warn("Não foi possível acessar o localStorage:", error);
    }
    return initialUserData;
  });

  const [lastCompletedMission, setLastCompletedMission] = useState<Mission | null>(null);

  const updateUserData = useCallback((updater: (prev: UserData) => UserData) => {
    setUserData(prevData => {
      const newData = updater(prevData);
      try {
        localStorage.setItem('cosmus-userData', JSON.stringify(newData));
      } catch (error) {
        console.warn("Não foi possível salvar os dados do usuário no localStorage:", error);
      }
      return newData;
    });
  }, []);

  const setUserName = useCallback((name: string) => {
    updateUserData(prevData => ({ ...prevData, name }));
  }, [updateUserData]);
  
  const setAvatar = useCallback((avatarDataUrl: string) => {
    updateUserData(prevData => ({ ...prevData, avatar: avatarDataUrl }));
  }, [updateUserData]);

  const removeAvatar = useCallback(() => {
    updateUserData(prevData => ({ ...prevData, avatar: null }));
  }, [updateUserData]);

  const completeMission = useCallback((missionName: string) => {
    const newMission: Mission = { name: missionName, timestamp: Date.now() };
    updateUserData(prevData => ({
      ...prevData,
      missionHistory: [...prevData.missionHistory, newMission],
    }));
    setLastCompletedMission(newMission);
  }, [updateUserData]);
  
  const signOut = useCallback(() => {
    try {
      localStorage.removeItem('cosmus-userData');
      setUserData(initialUserData);
    } catch (error) {
      console.warn("Não foi possível limpar os dados do usuário do localStorage:", error);
      setUserData(initialUserData);
    }
  }, []);

  // Dados derivados do estado
  const missionsCompleted = userData.missionHistory.length;
  const lastMission = userData.missionHistory.length > 0 ? userData.missionHistory[userData.missionHistory.length - 1] : null;
  const rank = useMemo(() => getRank(missionsCompleted), [missionsCompleted]);

  const value = {
    userName: userData.name,
    avatar: userData.avatar,
    missionsCompleted,
    rank,
    lastMission,
    lastCompletedMission,
    missionHistory: userData.missionHistory,
    setUserName,
    setAvatar,
    removeAvatar,
    completeMission,
    signOut,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
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