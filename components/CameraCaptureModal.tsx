import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (imageDataUrl: string) => void;
}

const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ isOpen, onClose, onPhotoCaptured }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    cleanupStream();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera: ", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      cleanupStream();
      setCapturedImage(null);
      setError(null);
    }

    return () => {
      cleanupStream();
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Desenha a imagem de vídeo sem espelhamento para salvar a imagem "verdadeira".
        // O espelhamento para a pré-visualização será feito via CSS.
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        cleanupStream();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
    startCamera();
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      onPhotoCaptured(capturedImage);
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center p-4">
          <p className="text-red-400 font-bold mb-4">{error}</p>
          <button onClick={onClose} className="spaceship-button">Fechar</button>
        </div>
      );
    }
    
    if (capturedImage) {
      return (
        <div className="relative">
          {/* Adiciona o espelhamento à pré-visualização da imagem capturada para corresponder ao feed de vídeo */}
          <img src={capturedImage} alt="Captura do avatar" className="max-w-full max-h-[80vh] rounded-md transform -scale-x-100" />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 flex justify-center gap-4">
            <button onClick={handleRetake} className="spaceship-button">Tirar Outra</button>
            <button onClick={handleUsePhoto} className="spaceship-button">Usar Foto</button>
          </div>
        </div>
      );
    }

    return (
        <div className="relative">
            <video ref={videoRef} autoPlay playsInline muted className="max-w-full max-h-[80vh] rounded-md transform -scale-x-100" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 flex justify-center">
                <button onClick={handleCapture} className="spaceship-button px-6 py-3">Capturar</button>
            </div>
        </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="spaceship-panel p-4">
        {renderContent()}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Modal>
  );
};

export default CameraCaptureModal;