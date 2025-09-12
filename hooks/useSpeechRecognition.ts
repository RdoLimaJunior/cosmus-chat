import { useState, useEffect, useRef, useCallback } from 'react';

// Define a interface para o objeto de reconhecimento de fala para abranger implementações com e sem prefixo.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  // Adiciona os manipuladores de eventos
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

// Define o construtor do reconhecimento de fala.
interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

// Estende a interface Window para incluir as possíveis implementações da API.
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
}

const defaultOptions: SpeechRecognitionOptions = {
  continuous: false,
  interimResults: false,
};

export const useSpeechRecognition = (options: SpeechRecognitionOptions = {}) => {
  const { continuous, interimResults } = { ...defaultOptions, ...options };
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const continuousTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("A API de Reconhecimento de Fala não é suportada neste navegador.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      
      setInterimTranscript(interim);

      if (final) {
        if(continuous) {
            continuousTranscriptRef.current = (continuousTranscriptRef.current ? continuousTranscriptRef.current + ' ' : '') + final.trim();
            setTranscript(continuousTranscriptRef.current)
        } else {
            setTranscript(final.trim());
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de fala:', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [continuous, interimResults]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setInterimTranscript('');
      continuousTranscriptRef.current = '';
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  };
};
