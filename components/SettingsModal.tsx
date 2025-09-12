import React from 'react';
import Modal from './Modal';
import ThemeSwitcher from './ThemeSwitcher';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className="spaceship-panel w-full max-w-sm p-6 text-center relative"
        aria-labelledby="settings-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 bg-transparent text-[var(--color-text-muted)] rounded-full flex items-center justify-center text-2xl font-bold hover:bg-[var(--color-muted-surface)] hover:text-[var(--color-accent)] transition-colors"
          aria-label="Fechar configurações"
        >
          &times;
        </button>
        
        <h2 id="settings-modal-title" className="text-2xl font-bold text-[var(--color-accent)] glow-text mb-6">
          Configurações da Interface
        </h2>

        <div className="border-t border-[var(--color-border)] pt-4 text-left">
          <h3 className="font-bold text-lg text-[var(--color-text-muted)] mb-3">Esquema de Cores</h3>
          <ThemeSwitcher />
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
