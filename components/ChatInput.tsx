import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const { isListening, transcript, interimTranscript, startListening, isSupported } = useSpeechRecognition({ interimResults: true });

  useEffect(() => {
    if (transcript) {
        // Anexa a transcrição final ao texto existente
        setText(prev => (prev ? prev.trim() + ' ' : '') + transcript);
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = isListening ? (text.trim() + ' ' + interimTranscript).trim() : text.trim();
    if (textToSend && !isLoading) {
      onSendMessage(textToSend);
      setText('');
    }
  };

  const displayValue = isListening ? (text ? text.trim() + ' ' : '') + interimTranscript : text;

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {isSupported && (
            <button 
                type="button" 
                onClick={startListening}
                disabled={isLoading}
                className={`mic-button flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-[var(--color-muted-surface)] border border-[var(--color-border)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isListening ? 'is-listening' : ''}`}
                aria-label="Usar comando de voz"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </button>
        )}
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
              if (!isListening) {
                setText(e.target.value);
              }
          }}
          placeholder={isListening ? "Escutando..." : "Transmitir comando para Cosmus..."}
          disabled={isLoading}
          className="flex-grow bg-transparent text-[var(--color-text-base)] placeholder-[var(--color-text-muted)] px-3 py-3 border-0 border-b-2 border-[var(--color-border)] focus:outline-none focus:ring-0 focus:border-[var(--color-accent)] transition-all duration-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex-shrink-0 w-12 h-12 bg-[var(--color-muted-surface)] text-[var(--color-accent)] flex items-center justify-center hover:bg-[var(--color-accent)] hover:text-[var(--color-background)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] focus:ring-[var(--color-primary)]"
          aria-label="Enviar mensagem"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;