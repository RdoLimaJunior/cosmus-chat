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
  removeAvatar: () => void; // Adiciona a função para remover o avatar
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

const initialUserData: UserData = { name: null, missionsCompleted: 0, lastMission: null, avatar: null };

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(() => {
    try {
      const savedData = localStorage.getItem('cosmus-userData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Remove a propriedade chatHistory de dados legados para manter o armazenamento limpo
        delete parsedData.chatHistory;
        return {
            ...initialUserData, // Garante que novos campos existam
            ...parsedData // Mescla com dados salvos
        };
      }
    } catch (error) {
      console.warn("Não foi possível acessar o localStorage:", error);
    }
    return initialUserData;
  });

  const [lastCompletedMission, setLastCompletedMission] = useState<{ name: string; timestamp: number } | null>(null);

  // Helper para atualizar o estado e o localStorage de forma segura
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
    const newMission = { name: missionName, timestamp: Date.now() };
    updateUserData(prevData => ({
      ...prevData,
      missionsCompleted: prevData.missionsCompleted + 1,
      lastMission: newMission,
    }));
    setLastCompletedMission(newMission); // Dispara o efeito para o toast
  }, [updateUserData]);
  
  const signOut = useCallback(() => {
    try {
      localStorage.removeItem('cosmus-userData');
      // Não use `updateUserData` aqui, pois queremos uma redefinição completa
      setUserData(initialUserData);
    } catch (error) {
      console.warn("Não foi possível limpar os dados do usuário do localStorage:", error);
      setUserData(initialUserData); // Ainda redefine o estado para a sessão atual
    }
  }, []);

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