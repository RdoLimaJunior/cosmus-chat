import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from './Modal';
import type { ChatMedia } from '../types';

interface MediaModalProps {
  media: ChatMedia;
  onClose: () => void;
}

const MediaModal: React.FC<MediaModalProps> = ({ media, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);

  // Redefine o estado quando a mídia muda
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [media]);

  const handleInteractionStart = useCallback((clientX: number, clientY: number) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      onClose();
      return;
    }
    lastTapRef.current = now;
    
    // Apenas permite o arraste se a imagem estiver ampliada (escala > 1).
    if (media.type === 'image' && scale > 1) {
      isDraggingRef.current = true;
      startPosRef.current = {
        x: clientX - position.x,
        y: clientY - position.y,
      };
      if (containerRef.current) {
        // O cursor é gerenciado pelo estilo do elemento da imagem, mas isso garante 'grabbing' durante o arraste
        containerRef.current.style.cursor = 'grabbing';
      }
    }
  }, [onClose, position.x, position.y, media.type, scale]); // Adiciona 'scale' às dependências

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Apenas botão principal
    e.preventDefault();
    handleInteractionStart(e.clientX, e.clientY);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current || media.type !== 'image') return;
    
    const newX = clientX - startPosRef.current.x;
    const newY = clientY - startPosRef.current.y;
    
    setPosition({ x: newX, y: newY });
  }, [media.type]);


  const handleInteractionEnd = useCallback(() => {
    if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (containerRef.current) {
            // Retorna o cursor para 'grab' se ainda for possível arrastar, senão padrão.
            containerRef.current.style.cursor = scale > 1 ? 'grab' : 'default';
        }
    }
  }, [scale]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleGlobalTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 1) {
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    };
    
    // Usa window para capturar eventos mesmo que o cursor saia do modal
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchmove', handleGlobalTouchMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchend', handleInteractionEnd);

    return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('touchmove', handleGlobalTouchMove);
        window.removeEventListener('mouseup', handleInteractionEnd);
        window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [handleMove, handleInteractionEnd]);

  const handleWheel = (e: React.WheelEvent) => {
    if (media.type !== 'image') return;
    e.preventDefault();
    
    const scaleAmount = -e.deltaY * 0.01;
    let newScale = scale + scaleAmount;
    // Garante que a escala esteja entre 1x (mínimo) e 5x (máximo).
    const clampedScale = Math.max(1, Math.min(newScale, 5));
    
    setScale(clampedScale);
    if (clampedScale <= 1) {
      // Reseta a posição se a imagem voltar ao tamanho original.
      setPosition({ x: 0, y: 0 });
    }
  };
  
  // Define o cursor apropriado para a imagem com base no nível de zoom.
  const imageCursor = scale > 1 ? 'grab' : 'default';

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div 
        ref={containerRef}
        className="relative w-screen h-screen flex items-center justify-center overflow-hidden"
        style={{ touchAction: 'none' }} // Previne ações de toque padrão do navegador
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onWheel={handleWheel}
        aria-labelledby="media-modal-title"
      >
        {media.type === 'image' ? (
          <img 
            src={media.full} 
            alt={media.title} 
            className="max-w-none max-h-none transition-transform duration-100 ease-out"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: imageCursor,
              width: 'auto',
              height: 'auto',
              maxWidth: '100vw',
              maxHeight: '100vh',
              userSelect: 'none',
            }}
            draggable="false"
          />
        ) : (
          <video 
            src={media.full} 
            controls 
            autoPlay 
            muted 
            loop
            playsInline
            className="w-full h-full object-cover"
            // A propagação de eventos é permitida para que o 'toque duplo para fechar' no contêiner pai funcione.
            // Os controles nativos do vídeo ainda funcionarão.
          >
            Seu navegador não suporta a tag de vídeo.
          </video>
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm text-white bg-black/50 px-3 py-1 rounded-md pointer-events-none">
            <p id="media-modal-title">NASA: {media.title}</p>
            <p className="text-xs text-gray-300 mt-1">
              {media.type === 'image' 
                ? 'Toque duas vezes para fechar. Arraste para mover quando ampliado. Role para ampliar.' 
                : 'Toque duas vezes para fechar.'}
            </p>
        </div>
      </div>
    </Modal>
  );
};

export default MediaModal;