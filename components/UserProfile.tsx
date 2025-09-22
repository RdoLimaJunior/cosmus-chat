import React from 'react';
import Modal from './Modal';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import { useTutorial } from '../contexts/TutorialContext';
import AstronautIcon from './AstronautIcon';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { userName, avatar, missionsCompleted, rank, missionHistory, signOut } = useUser();
  const { clearChatHistory } = useChat();
  const { clearCompletedTutorials } = useTutorial();

  const handleSignOut = () => {
    if (window.confirm('Tem certeza de que deseja sair? Todo o seu progresso, incluindo missões e histórico de conversas, será perdido.')) {
        signOut();
        clearChatHistory();
        clearCompletedTutorials();
        onClose();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Tem certeza de que deseja apagar todo o histórico de conversas? Esta ação não pode ser desfeita.')) {
      clearChatHistory();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="spaceship-panel w-full max-w-md p-6 relative text-center" aria-labelledby="user-profile-title">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 bg-transparent text-[var(--color-text-muted)] rounded-full flex items-center justify-center text-2xl font-bold hover:bg-[var(--color-muted-surface)] hover:text-[var(--color-accent)] transition-colors"
          aria-label="Fechar perfil"
        >
          &times;
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[var(--color-muted-surface)] border-2 border-[var(--color-border)] flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="Avatar do usuário" className="w-full h-full object-cover" />
            ) : (
              <AstronautIcon className="w-16 h-16" />
            )}
          </div>
          <h2 id="user-profile-title" className="text-2xl font-bold text-[var(--color-accent)] glow-text">{userName || 'Explorador Anônimo'}</h2>
          <p className="text-base text-[var(--color-text-base)] font-semibold">{rank}</p>
        </div>

        <div className="border-t border-[var(--color-border)] my-6"></div>

        <div className="text-left space-y-4">
          <div>
            <h3 className="font-bold text-lg text-[var(--color-text-muted)] mb-2">Estatísticas da Exploração</h3>
            <div className="flex justify-between items-center bg-[var(--color-surface)] p-3 rounded-md">
              <span className="text-sm">Missões Concluídas</span>
              <span className="font-bold text-[var(--color-primary)] text-lg">{missionsCompleted}</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg text-[var(--color-text-muted)] mb-2">Histórico de Missões</h3>
            {missionHistory && missionHistory.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {[...missionHistory].reverse().map((mission, index) => (
                        <div key={index} className="bg-[var(--color-surface)] p-3 rounded-md animate-ai-message" style={{ animationDelay: `${index * 50}ms` }}>
                            <p className="text-sm font-semibold">{mission.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                {new Date(mission.timestamp).toLocaleString('pt-BR')}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[var(--color-surface)] p-3 rounded-md">
                    <p className="text-sm text-[var(--color-text-muted)] italic">Nenhuma missão concluída ainda. Comece a explorar!</p>
                </div>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] my-6"></div>

        <div className="flex flex-col gap-3">
          <button onClick={handleClearHistory} className="spaceship-button w-full bg-[var(--color-muted-surface)] hover:bg-opacity-80 text-[var(--color-text-base)]">
            Limpar Histórico de Conversa
          </button>
          <button onClick={handleSignOut} className="spaceship-button w-full bg-red-600/80 hover:bg-red-500 text-white">
            Sair e Reiniciar Missão
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UserProfile;