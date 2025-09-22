import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { sendMessageToAI, getInitialMessage, getChat } from '../services/geminiService';
import { fetchNasaMedia, fetchRandomNasaMedia } from '../services/nasaService';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import { useTutorial } from '../contexts/TutorialContext';
import Message from './Message';
import ChatInput from './ChatInput';
import LoadingSpinner from './LoadingSpinner';

const loadingPhrases = [
  'Consultando os mapas estelares',
  'Ajustando a frequência de comunicação',
  'Decodificando sinais cósmicos',
  'Calibrando os propulsores de dobra',
  'Navegando por um cinturão de asteroides',
];

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Cosmus está processando');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userName, completeMission } = useUser();
  const { chatHistory, saveChatHistory } = useChat();
  const { startTutorial, hasCompletedTutorial } = useTutorial();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchInitialMessage = useCallback(async () => {
    setIsLoading(true);
    try {
      const { text, suggestions } = await getInitialMessage();
      const initialMessage: ChatMessage = {
        id: 'initial-message',
        text,
        sender: 'ai',
        suggestions,
      };
      setMessages([initialMessage]);
    } catch (error) {
      console.error("Falha ao obter mensagem inicial:", error);
      const errorMessage: ChatMessage = {
        id: 'initial-error',
        text: "Oh, não! Parece que minhas antenas cósmicas não estão funcionando bem. Tente recarregar a página para me chamar novamente!",
        sender: 'ai',
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setMessages(chatHistory);
      // Inicializa a sessão de chat do Gemini com o histórico existente para manter o contexto.
      // Esta chamada configura o 'chat' singleton no serviço para que as mensagens subsequentes
      // tenham o histórico completo.
      getChat(userName, chatHistory);
      setIsLoading(false);
    } else {
      fetchInitialMessage();
    }
  // Apenas executa na montagem inicial, não depende do chatHistory para re-executar.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchInitialMessage]);
  
  useEffect(() => {
    // Se o histórico do contexto for limpo (comprimento 0) mas o componente ainda tiver mensagens,
    // significa que o botão "limpar histórico" foi pressionado. Então, reiniciamos a visão do chat.
    if (chatHistory.length === 0 && messages.length > 0) {
      fetchInitialMessage();
    }
  }, [chatHistory, messages.length, fetchInitialMessage]);

  useEffect(() => {
    // Apenas salva se houver mensagens e não estiver carregando para evitar salvar estados parciais
    if (messages.length > 0 && !isLoading) {
      saveChatHistory(messages);
    }
  }, [messages, isLoading, saveChatHistory]);


  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Efeito para animar o texto de carregamento com frases variadas e pontos mais rápidos
  useEffect(() => {
    let dotInterval: number | undefined;
    // Usa uma ref para a frase de carregamento para que ela não mude a cada renderização durante o carregamento
    const loadingPhrase = useRef(loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]);

    if (isLoading) {
      let dotCount = 0;
      // Define a frase inicial sem os pontos
      setLoadingText(loadingPhrase.current); 

      dotInterval = window.setInterval(() => {
        dotCount = (dotCount + 1) % 4; // Cicla de 0 a 3
        const dots = '.'.repeat(dotCount);
        setLoadingText(`${loadingPhrase.current}${dots}`);
      }, 300); // Acelera a animação dos pontos para 300ms
    } else {
      setLoadingText(''); // Limpa o texto quando não está carregando
    }

    // Limpa o intervalo na desmontagem ou quando isLoading muda
    return () => {
      if (dotInterval) {
        clearInterval(dotInterval);
      }
    };
  }, [isLoading]);


  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      const { text: aiResponseText, suggestions, imageQuery, source, missionCompleted, challenge } = await sendMessageToAI(inputText, userName);
      const aiMessageId = (Date.now() + 1).toString();

      if (missionCompleted) {
        completeMission(missionCompleted);
        // Dispara o tutorial de desafios se for a primeira vez
        if (challenge && !hasCompletedTutorial('challenges')) {
            // Pequeno atraso para garantir que a mensagem seja renderizada antes do tutorial começar
            setTimeout(() => startTutorial('challenges'), 500);
        }
      }

      const aiMessage: ChatMessage = {
        id: aiMessageId,
        text: aiResponseText,
        sender: 'ai',
        suggestions: suggestions,
        source: source,
        challenge: challenge,
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);

      // Dispara o tutorial socrático se for a primeira vez que sugestões aparecem
      if (suggestions && suggestions.length > 0 && !hasCompletedTutorial('socratic')) {
        // Pequeno atraso para garantir que a mensagem seja renderizada antes do tutorial começar
        setTimeout(() => startTutorial('socratic'), 500);
      }

      if (imageQuery) {
        const media = await fetchNasaMedia(imageQuery);
        if (media) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === aiMessageId ? { ...msg, media: media } : msg
            )
          );
        }
      }

    } catch (error) {
      console.error("Falha ao obter resposta da IA:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Oh, não! Uma rajada de raios cósmicos parece ter interrompido nossa conexão. Acontece até com os melhores exploradores espaciais! Gostaria de tentar enviar sua última mensagem novamente?",
        sender: 'ai',
        suggestions: [inputText], 
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShowMeAnImage = async () => {
    setIsLoading(true);
    
    try {
        const media = await fetchRandomNasaMedia();

        if (media) {
            const mediaMessage: ChatMessage = {
                id: Date.now().toString(),
                text: `Aqui está uma maravilha cósmica para você, jovem explorador: ${media.title}`,
                sender: 'ai',
                media: media,
                source: "NASA Image & Video Library"
            };
            setMessages((prevMessages) => [...prevMessages, mediaMessage]);
        } else {
            // This case handles when NASA API returns no usable images
            throw new Error("Não foi possível encontrar uma maravilha cósmica desta vez.");
        }

    } catch (error) {
        console.error("Falha ao buscar mídia aleatória:", error);
        const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            text: "Oh, não! Meus telescópios parecem estar desalinhados. Não consegui encontrar uma imagem agora. Que tal tentarmos de novo?",
            sender: 'ai',
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const lastMessage = messages[messages.length - 1];
  const activeSuggestions = !isLoading && lastMessage?.sender === 'ai' && lastMessage.suggestions && lastMessage.suggestions.length > 0
    ? lastMessage.suggestions
    : [];

  return (
    <div className="w-full h-full flex flex-col spaceship-panel overflow-hidden animate-chat-window p-0">
      <div id="chat-history" className="flex-grow p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start items-center gap-3">
             <LoadingSpinner />
             <p className="text-[var(--color-text-muted)] italic text-sm w-56 text-left">{loadingText}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t-2 border-[var(--color-border)] p-4 space-y-4">
        <div className="flex justify-center">
            <button
                id="cosmic-wonder-button"
                onClick={handleShowMeAnImage}
                disabled={isLoading}
                className="spaceship-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                aria-label="Pedir a Cosmus para revelar uma maravilha cósmica"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Revelar Maravilha Cósmica</span>
            </button>
        </div>
        
        {activeSuggestions.length > 0 && (
          <div id="suggestion-area" className="flex flex-wrap justify-center gap-2">
            {activeSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => handleSendMessage(suggestion)}
                disabled={isLoading}
                className="spaceship-button px-3 py-1 text-sm disabled:opacity-50 animate-suggestion"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatWindow;