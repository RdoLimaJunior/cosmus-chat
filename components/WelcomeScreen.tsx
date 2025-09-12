import React, { useEffect, useState } from 'react';
import { fetchRandomNasaMedia } from '../services/nasaService';
import { useUser } from '../contexts/UserContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import type { ChatMedia } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CameraCaptureModal from './CameraCaptureModal';

interface WelcomeScreenProps {
  onNameSubmit: (name: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNameSubmit }) => {
  const [media, setMedia] = useState<ChatMedia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explorerName, setExplorerName] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const { avatar, setAvatar } = useUser();
  const { isListening, transcript, startListening, isSupported } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
        setExplorerName(transcript);
    }
  }, [transcript]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (explorerName.trim()) {
      onNameSubmit(explorerName.trim());
    }
  };

  const loadMedia = async () => {
    setIsLoading(true);
    setIsHighResLoaded(false);
    setError(null);
    try {
      let randomMedia = null;
      for (let i = 0; i < 3; i++) {
        randomMedia = await fetchRandomNasaMedia();
        if (randomMedia) break;
      }
      
      if (randomMedia) {
        setMedia(randomMedia);
      } else {
        throw new Error("Não foi possível encontrar uma maravilha cósmica para exibir. Por favor, tente novamente.");
      }
    } catch (e: any) {
      setError(e.message || "Ocorreu um erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);
  
  const handlePhotoCaptured = (imageDataUrl: string) => {
    setAvatar(imageDataUrl);
    setIsCameraOpen(false);
  }

  const renderMediaBackground = () => {
    if (!media) return null;

    if (media.type === 'video') {
      return (
        <video 
          key={media.display}
          src={media.display} 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        >
          Seu navegador não suporta vídeos.
        </video>
      );
    }

    if (media.type === 'image') {
      return (
        <>
          <div 
            style={{ backgroundImage: `url(${media.preview})` }}
            className={`w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${isHighResLoaded ? 'opacity-0' : 'opacity-100 blur-md'}`}
            aria-hidden="true"
          />
          <img 
            src={media.display} 
            alt={media.title} 
            onLoad={() => setIsHighResLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isHighResLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </>
      );
    }

    return null;
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center flex flex-col items-center gap-6 p-6 spaceship-panel z-10 animate-chat-window">
          <h2 className="text-2xl font-bold text-red-400">Interferência Cósmica!</h2>
          <p className="text-[var(--color-text-muted)] max-w-sm">{error}</p>
          <button onClick={loadMedia} className="spaceship-button">
            Tentar Novamente
          </button>
        </div>
      );
    }

    return (
      <>
        <CameraCaptureModal
            isOpen={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onPhotoCaptured={handlePhotoCaptured}
        />

        {media && (
          <div className="absolute inset-0 w-full h-full z-0" aria-hidden="true">
            {renderMediaBackground()}
            <div className="absolute inset-0 bg-[var(--color-background)]/80 backdrop-blur-sm"></div>
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
            <div className="w-full max-w-md lg:max-w-lg spaceship-panel p-8 flex flex-col items-center gap-4 animate-chat-window">
                <div className="w-28 h-28 bg-[var(--color-muted-surface)] flex items-center justify-center mb-2 rounded-full overflow-hidden">
                  {avatar ? (
                      <img src={avatar} alt="Avatar do explorador" className="w-full h-full object-cover" />
                  ) : (
                      <img src="/cosmus2.webp" alt="Avatar padrão de Cosmus" className="w-full h-full object-cover" />
                  )}
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-accent)] glow-text">Identifique-se, Explorador!</h1>
                <p className="text-base text-[var(--color-text-base)] leading-relaxed">
                    Qual é o seu nome de astronauta? Cosmus usará isso para se dirigir a você em sua jornada cósmica.
                </p>
                <form onSubmit={handleNameSubmit} className="w-full flex flex-col items-center mt-6">
                    <div className="w-full max-w-xs flex items-center gap-2">
                      <input
                          type="text"
                          value={explorerName}
                          onChange={(e) => setExplorerName(e.target.value)}
                          placeholder={isListening ? "Escutando..." : "Digite ou dite seu nome..."}
                          required
                          className="flex-grow bg-transparent text-[var(--color-text-base)] placeholder-[var(--color-text-muted)] text-center px-3 py-3 border-0 border-b-2 border-[var(--color-border)] focus:outline-none focus:ring-0 focus:border-[var(--color-accent)] transition-all duration-300"
                          aria-label="Nome do explorador"
                      />
                       {isSupported && (
                           <button 
                                type="button" 
                                onClick={startListening} 
                                className={`mic-button flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-muted-surface)] border border-[var(--color-border)] transition-colors ${isListening ? 'is-listening' : ''}`}
                                aria-label="Usar comando de voz"
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                               </svg>
                           </button>
                       )}
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={() => setIsCameraOpen(true)}
                        className="mt-4 spaceship-button py-1 px-3 text-xs flex items-center gap-2"
                        aria-label="Tirar foto para o avatar"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                         </svg>
                        <span>{avatar ? 'Mudar Foto' : 'Tirar Foto'}</span>
                    </button>
                    
                    <button type="submit" className="mt-6 px-8 py-4 spaceship-button text-lg uppercase font-bold">
                      Iniciar Exploração
                    </button>
                </form>
            </div>
        </div>

        {media && (
          <footer className="absolute bottom-2 left-4 right-4 z-20 flex justify-between items-end">
             <div className="flex flex-col items-end gap-2 ml-auto">
                <p className="text-xs text-[var(--color-accent)] bg-[var(--color-surface)] px-2 py-1 border border-[var(--color-border)]" aria-label="Legenda da imagem de fundo">
                  NASA: {media.title}
                </p>
                <button
                    onClick={loadMedia}
                    disabled={isLoading}
                    className="spaceship-button text-xs px-2 py-1 disabled:opacity-50 disabled:cursor-wait"
                    aria-label="Carregar nova imagem de fundo"
                >
                  {isLoading ? 'Carregando...' : 'Nova Mídia'}
                </button>
             </div>
          </footer>
        )}
      </>
    );
  };

  const renderInitialLoader = () => (
    <div className="text-center flex flex-col items-center gap-4 z-10">
        <LoadingSpinner />
        <p className="text-[var(--color-text-muted)] italic text-lg animate-pulse">Estabelecendo conexão com o cosmos...</p>
    </div>
  );

  return (
    <main className="relative flex-grow flex items-center justify-center p-4 overflow-hidden">
      {isLoading && !media ? renderInitialLoader() : renderContent()}
    </main>
  );
};

export default WelcomeScreen;