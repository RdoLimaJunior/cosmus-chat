import React from 'react';
import Modal from './Modal';
import AstronautIcon from './AstronautIcon';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { userName, rank, missionsCompleted, lastMission, avatar } = useUser();
  const { clearChatHistory } = useChat();

  const handleClearHistory = () => {
    if (window.confirm("Tem certeza de que deseja apagar todo o histórico de conversas? Esta ação não pode ser desfeita.")) {
      clearChatHistory();
      onClose(); // Fecha o modal após a ação
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className="spaceship-panel w-full max-w-sm p-6 text-center relative"
        aria-labelledby="user-profile-title"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 bg-transparent text-[var(--color-text-muted)] rounded-full flex items-center justify-center text-2xl font-bold hover:bg-[var(--color-muted-surface)] hover:text-[var(--color-accent)] transition-colors"
          aria-label="Fechar perfil"
        >
          &times;
        </button>

        <div className="w-24 h-24 mx-auto mb-4 bg-[var(--color-muted-surface)] flex items-center justify-center border-4 border-[var(--color-accent)] hexagon-clip overflow-hidden">
           {avatar ? (
             <img src={avatar} alt="Avatar do explorador" className="w-full h-full object-cover" />
           ) : (
             <AstronautIcon className="h-16 w-16 text-[var(--color-accent)]" />
           )}
        </div>
        
        <h2 id="user-profile-title" className="text-2xl font-bold text-[var(--color-accent)] glow-text px-4 truncate">
          {userName || 'Jovem Explorador'}
        </h2>
        
        <div className="mt-6 border-t border-[var(--color-border)] pt-4 space-y-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Patente:</span>
            <span className="font-bold text-lg">{rank}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Missões Concluídas:</span>
            <span className="font-bold text-lg">{missionsCompleted}</span>
          </div>
           <div className="flex justify-between items-center">
            <span className="text-[var(--color-text-muted)]">Última Missão Concluída:</span>
            <span className="font-bold text-lg truncate">{lastMission?.name || 'Nenhuma'}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--color-border)] pt-4">
            <h3 className="font-bold text-lg text-left text-[var(--color-text-muted)] mb-3">Ações</h3>
            <button
                onClick={handleClearHistory}
                className="w-full spaceship-button"
                aria-label="Limpar histórico de conversas"
            >
                Limpar Histórico de Conversas
            </button>
        </div>

      </div>
    </Modal>
  );
};

export default UserProfile;