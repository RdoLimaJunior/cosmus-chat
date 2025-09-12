import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { ChatMessage } from '../types';

interface ChatContextType {
  chatHistory: ChatMessage[];
  saveChatHistory: (messages: ChatMessage[]) => void;
  clearChatHistory: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const savedHistory = localStorage.getItem('cosmus-chatHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.warn("Não foi possível carregar o histórico de chat do localStorage:", error);
      return [];
    }
  });

  const saveChatHistory = useCallback((messages: ChatMessage[]) => {
    try {
      localStorage.setItem('cosmus-chatHistory', JSON.stringify(messages));
      setChatHistory(messages);
    } catch (error) {
      console.warn("Não foi possível salvar o histórico de chat no localStorage:", error);
      setChatHistory(messages); // Ainda define o estado para a sessão atual
    }
  }, []);

  const clearChatHistory = useCallback(() => {
    try {
      localStorage.removeItem('cosmus-chatHistory');
      setChatHistory([]);
    } catch (error) {
      console.warn("Não foi possível limpar o histórico de chat do localStorage:", error);
      setChatHistory([]); // Ainda limpa o estado para a sessão atual
    }
  }, []);

  const value = {
    chatHistory,
    saveChatHistory,
    clearChatHistory,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat deve ser usado dentro de um ChatProvider');
  }
  return context;
};