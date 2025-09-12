import React, { useState, useEffect, useRef, useId } from 'react';
import { useTutorial } from '../contexts/TutorialContext';
import { useUser } from '../contexts/UserContext';

interface SideNavProps {
  isProfileOpen: boolean;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ isProfileOpen, onOpenProfile, onOpenSettings }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const helpDropdownRef = useRef<HTMLDivElement>(null);
  const { startTutorial } = useTutorial();
  const { avatar } = useUser();

  // IDs para as dicas de ferramentas
  const profileTooltipId = useId();
  const settingsTooltipId = useId();
  const helpTooltipId = useId();

  // Fecha o menu suspenso de ajuda ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpDropdownRef.current && !helpDropdownRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartTutorial = (tutorialName: 'socratic' | 'nasa' | 'challenges') => {
    startTutorial(tutorialName);
    setIsHelpOpen(false);
  };

  return (
    <nav className="h-screen w-16 bg-transparent flex flex-col items-center py-4 gap-4 border-r-2 border-[var(--color-border)]">
      
      {/* Botão de Perfil/Histórico */}
      <div className="relative group">
        <button
          onClick={onOpenProfile}
          className={`w-12 h-12 flex items-center justify-center rounded-full hover:bg-[var(--color-muted-surface)] transition-all duration-200 overflow-hidden ${isProfileOpen ? 'animate-avatar-pulse' : ''}`}
          aria-label="Ver perfil e histórico"
          aria-describedby={profileTooltipId}
        >
          {avatar ? (
            <img src={avatar} alt="Avatar do usuário" className="w-full h-full object-cover" />
          ) : (
            <img src="/cosmus2.webp" alt="Avatar padrão de Cosmus" className="w-full h-full object-cover" />
          )}
        </button>
        <div
          id={profileTooltipId}
          role="tooltip"
          className="absolute top-1/2 -translate-y-1/2 left-full ml-2 w-max max-w-xs px-2 py-1 bg-[var(--color-background)] text-[var(--color-text-base)] text-xs font-semibold text-center rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20"
        >
          Perfil e Histórico
        </div>
      </div>
      
      {/* Botão de Configurações */}
      <div className="relative group">
        <button
          onClick={onOpenSettings}
          className="p-3 rounded-full hover:bg-[var(--color-muted-surface)] transition-colors duration-200"
          aria-label="Configurações"
          aria-describedby={settingsTooltipId}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <div
          id={settingsTooltipId}
          role="tooltip"
          className="absolute top-1/2 -translate-y-1/2 left-full ml-2 w-max max-w-xs px-2 py-1 bg-[var(--color-background)] text-[var(--color-text-base)] text-xs font-semibold text-center rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20"
        >
          Configurações
        </div>
      </div>
      
      {/* Botão de Ajuda com Menu Suspenso */}
      <div ref={helpDropdownRef} className="relative">
        <div className="relative group">
            <button
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              className="p-3 rounded-full hover:bg-[var(--color-muted-surface)] transition-colors duration-200"
              aria-label="Ajuda"
              aria-expanded={isHelpOpen}
              aria-describedby={helpTooltipId}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div
              id={helpTooltipId}
              role="tooltip"
              className="absolute top-1/2 -translate-y-1/2 left-full ml-2 w-max max-w-xs px-2 py-1 bg-[var(--color-background)] text-[var(--color-text-base)] text-xs font-semibold text-center rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20"
            >
              Ajuda
            </div>
        </div>

        {isHelpOpen && (
          <div 
            className="absolute top-0 left-full ml-2 w-72 spaceship-panel p-4 text-[var(--color-text-base)] z-10"
            role="dialog"
            aria-labelledby="help-title"
          >
            <h3 id="help-title" className="font-bold text-lg text-[var(--color-accent)] mb-3">Protocolos de Orientação</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleStartTutorial('socratic')} className="w-full text-left text-sm hover:text-[var(--color-accent)] transition-colors">
                  - Como Cosmus Ensina
                </button>
              </li>
               <li>
                <button onClick={() => handleStartTutorial('nasa')} className="w-full text-left text-sm hover:text-[var(--color-accent)] transition-colors">
                  - Revelando Maravilhas Cósmicas
                </button>
              </li>
               <li>
                <button onClick={() => handleStartTutorial('challenges')} className="w-full text-left text-sm hover:text-[var(--color-accent)] transition-colors">
                  - Missões e Desafios
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default SideNav;