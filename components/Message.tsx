import React, { useState } from 'react';
import type { ChatMessage } from '../types';
import CosmusIcon from './CosmusIcon';
import MediaModal from './ImageModal';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSourceUrl = message.source && (message.source.startsWith('http://') || message.source.startsWith('https://'));
  
  return (
    <>
      {/* O div externo agora lida apenas com o layout flexbox (alinhamento à esquerda/direita). */}
      <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          // O ícone tem sua própria animação para uma entrada consistente.
          <div className="flex-shrink-0 w-10 h-10 bg-[var(--color-muted-surface)] flex items-center justify-center border-2 border-[var(--color-accent)] hexagon-clip animate-ai-message">
            <CosmusIcon />
          </div>
        )}
        {/* Este é o 'div aninhado' que contém todo o conteúdo da mensagem e agora gerencia sua própria animação. */}
        <div
          className={`max-w-[70%] xl:max-w-4xl px-4 py-3 rounded-lg ${
            isUser
              ? 'bg-transparent border border-[var(--color-primary)] text-white rounded-br-none animate-user-message'
              : 'bg-[var(--color-muted-surface)] text-[var(--color-text-base)] rounded-bl-none animate-ai-message'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
          
          {message.challenge && (
            <div className="mt-4 p-3 border-l-4 border-[var(--color-primary)] bg-[var(--color-surface)] rounded-r-lg">
              <h4 className="font-bold text-[var(--color-primary)] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span>Desafio do Dia: {message.challenge.name}</span>
              </h4>
              <p className="mt-1 text-sm text-[var(--color-text-base)]">{message.challenge.description}</p>
            </div>
          )}

          {message.media && (
            <div className="mt-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="block w-full text-left group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-muted-surface)] focus:ring-[var(--color-accent)] rounded-md"
                aria-label={`Ampliar mídia sobre: ${message.media.title}`}
              >
                <div className="relative w-full aspect-video rounded-md overflow-hidden border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
                  {message.media.type === 'image' ? (
                    <>
                      {/* Placeholder de imagem de baixa resolução */}
                      <div
                        style={{ backgroundImage: `url(${message.media.preview})` }}
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-out ${isHighResLoaded ? 'opacity-0' : 'opacity-100 blur-md'}`}
                        aria-hidden="true"
                      />
                      {/* Imagem de resolução de exibição */}
                      <img
                        src={message.media.display}
                        alt={`Mídia do espaço relacionada a: ${message.media.title}`}
                        onLoad={() => setIsHighResLoaded(true)}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-out ${isHighResLoaded ? 'opacity-100' : 'opacity-0'}`}
                      />
                    </>
                  ) : (
                    // Player de vídeo para pré-visualização
                    <video
                        src={message.media.preview}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        Seu navegador não suporta a tag de vídeo.
                    </video>
                  )}
                  {/* Ícone de expansão no hover */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                </div>
              </button>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 text-right">Mídia da NASA</p>
            </div>
          )}
          {message.source && (
            <div className="mt-3 pt-2 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-muted)] italic">
                <span className="font-semibold">Fonte:</span>{' '}
                {isSourceUrl ? (
                  <a
                    href={message.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center underline hover:text-[var(--color-accent)] transition-colors"
                  >
                    <span>{message.source}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <span>{message.source}</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && message.media && (
        <MediaModal
          media={message.media}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default Message;