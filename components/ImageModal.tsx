import React from 'react';
import Modal from './Modal';
import type { ChatMedia } from '../types';

interface MediaModalProps {
  media: ChatMedia;
  onClose: () => void;
}

const MediaModal: React.FC<MediaModalProps> = ({ media, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <div 
        className="relative w-screen h-screen flex items-center justify-center"
        aria-labelledby="media-modal-title"
      >
        {media.type === 'image' ? (
          <img src={media.full} alt={media.title} className="w-full h-full object-cover" />
        ) : (
          <video 
            src={media.full} 
            controls 
            autoPlay 
            muted 
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            Seu navegador não suporta a tag de vídeo.
          </video>
        )}
        <p id="media-modal-title" className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm text-white bg-black/50 px-3 py-1 rounded-md">
          NASA: {media.title}
        </p>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center text-3xl font-bold hover:bg-white/40 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Fechar mídia"
        >
          &times;
        </button>
      </div>
    </Modal>
  );
};

export default MediaModal;
