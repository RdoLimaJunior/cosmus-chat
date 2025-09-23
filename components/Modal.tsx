import React, { useEffect, useRef, ReactNode, useCallback, useState } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const modalRoot = document.getElementById('modal-root');

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [isMounted, setIsMounted] = useState(isOpen);

  // Gerencia a montagem/desmontagem com um atraso para as animações de saída
  useEffect(() => {
    if (isOpen && !isMounted) {
      setIsMounted(true);
    } else if (!isOpen && isMounted) {
      const timer = setTimeout(() => setIsMounted(false), 300); // Deve corresponder à duração da animação
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMounted]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Captura de foco e manipulação de eventos de teclado
  useEffect(() => {
    if (isMounted && isOpen) { // Quando o modal se torna totalmente visível
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      const modalElement = modalRef.current;
      if (!modalElement) return;

      const focusableElements = modalElement.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];

      if (firstFocusableElement) {
        firstFocusableElement.focus();
      } else {
        modalElement.focus();
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleClose();
          return;
        }

        if (event.key === 'Tab' && firstFocusableElement && lastFocusableElement) {
          if (event.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
              lastFocusableElement.focus();
              event.preventDefault();
            }
          } else {
            if (document.activeElement === lastFocusableElement) {
              firstFocusableElement.focus();
              event.preventDefault();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousFocusRef.current?.focus();
      };
    }
  }, [isMounted, isOpen, handleClose]);

  if (!isMounted || !modalRoot) {
    return null;
  }

  const backdropClass = isOpen ? 'animate-modal-fade-in' : 'animate-modal-fade-out';
  const contentClass = isOpen ? 'animate-modal-zoom-in' : 'animate-modal-zoom-out';
  
  return ReactDOM.createPortal(
    <div 
      className={`fixed inset-0 bg-[var(--color-background)]/80 flex items-center justify-center z-50 ${backdropClass}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={modalRef} 
        className={contentClass}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;