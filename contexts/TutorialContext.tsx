import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type TutorialName = 'socratic' | 'nasa' | 'challenges';

interface TutorialStep {
  target: string; // Seletor CSS do elemento a ser destacado
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

interface Tutorial {
  steps: TutorialStep[];
}

interface TutorialContextType {
  isTutorialActive: boolean;
  activeTutorial: Tutorial | null;
  currentStepIndex: number;
  startTutorial: (name: TutorialName) => void;
  endTutorial: () => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  hasCompletedTutorial: (name: TutorialName) => boolean;
  clearCompletedTutorials: () => void;
}

const tutorials: Record<TutorialName, Tutorial> = {
  socratic: {
    steps: [
      {
        target: '#chat-history',
        title: 'Como Cosmus Ensina',
        content: 'Em vez de dar respostas diretas, Cosmus usa o Método Socrático. Ele te guiará com perguntas para ajudar você a descobrir o conhecimento por conta própria!',
        placement: 'right',
      },
      {
        target: '#suggestion-area',
        title: 'Explore Mais a Fundo',
        content: 'Use estes botões de sugestão após as respostas de Cosmus. Eles são o seu mapa para explorar os tópicos com mais detalhes e continuar a conversa!',
        placement: 'top',
      },
    ],
  },
  nasa: {
    steps: [
      {
        target: '#cosmic-wonder-button',
        title: 'Maravilhas Cósmicas',
        content: 'Está curioso para ver uma imagem ou vídeo real do espaço? Clique neste botão a qualquer momento!',
        placement: 'top',
      },
       {
        target: '#cosmic-wonder-button',
        title: 'Direto da NASA',
        content: 'Cosmus buscará nos arquivos da NASA para te mostrar uma foto ou vídeo espetacular de uma galáxia, nebulosa ou planeta. Cada clique é uma nova surpresa!',
        placement: 'top',
      },
    ],
  },
  challenges: {
      steps: [
          {
              target: '[id^="challenge-block-"]',
              title: 'Missões e Desafios',
              content: 'Quando você explora um tópico a fundo, completa uma "Missão"! Para celebrar, Cosmus te dará um Desafio do Dia.',
              placement: 'top'
          },
          {
              target: '[id^="challenge-block-"]',
              title: 'Para Além da Tela',
              content: 'O Desafio é uma pequena tarefa criativa ou de pesquisa para você fazer fora do chat. É uma forma divertida de continuar sua jornada de aprendizado!',
              placement: 'top'
          }
      ]
  }
};

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const COMPLETED_TUTORIALS_KEY = 'cosmus-completedTutorials';

export const TutorialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const getCompletedTutorials = useCallback((): TutorialName[] => {
    try {
      const saved = localStorage.getItem(COMPLETED_TUTORIALS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Não foi possível ler os tutoriais concluídos do localStorage', error);
      return [];
    }
  }, []);

  const markTutorialAsCompleted = (name: TutorialName) => {
    const completed = getCompletedTutorials();
    if (!completed.includes(name)) {
      try {
        localStorage.setItem(COMPLETED_TUTORIALS_KEY, JSON.stringify([...completed, name]));
      } catch (error) {
        console.warn('Não foi possível salvar os tutoriais concluídos no localStorage', error);
      }
    }
  };
  
  const hasCompletedTutorial = useCallback((name: TutorialName): boolean => {
      return getCompletedTutorials().includes(name);
  }, [getCompletedTutorials]);

  const clearCompletedTutorials = useCallback(() => {
    try {
        localStorage.removeItem(COMPLETED_TUTORIALS_KEY);
    } catch (error) {
        console.warn('Não foi possível limpar os tutoriais concluídos do localStorage', error);
    }
  }, []);


  const startTutorial = (name: TutorialName) => {
    setActiveTutorial(tutorials[name]);
    setCurrentStepIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const endTutorial = () => {
    if (activeTutorial) {
      // Descobre qual tutorial estava ativo para marcá-lo como concluído
      const activeTutorialName = Object.keys(tutorials).find(
        name => tutorials[name as TutorialName] === activeTutorial
      ) as TutorialName | undefined;
      
      if (activeTutorialName) {
        markTutorialAsCompleted(activeTutorialName);
      }
    }
    setActiveTutorial(null);
    setCurrentStepIndex(0);
    document.body.style.overflow = '';
  };

  const goToNextStep = () => {
    if (activeTutorial && currentStepIndex < activeTutorial.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const value: TutorialContextType = {
    isTutorialActive: !!activeTutorial,
    activeTutorial,
    currentStepIndex,
    startTutorial,
    endTutorial,
    goToNextStep,
    goToPrevStep,
    hasCompletedTutorial,
    clearCompletedTutorials,
  };

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
};

export const useTutorial = (): TutorialContextType => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial deve ser usado dentro de um TutorialProvider');
  }
  return context;
};