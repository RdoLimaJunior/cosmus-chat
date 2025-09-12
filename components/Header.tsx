import React, { useState, useId } from 'react';
import HelpButton from './HelpButton';
import UserProfile from './UserProfile';
import AstronautIcon from './AstronautIcon';
import InstallButton from './InstallButton';
import ThemeSwitcher from './ThemeSwitcher';

const Header: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileTooltipId = useId();

  return (
    <>
      <header className="w-full bg-transparent p-4 text-center border-b-2 border-[var(--color-border)] grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <HelpButton />
        </div>
        <h1 className="col-start-2 text-2xl font-bold text-[var(--color-accent)] tracking-wider flex items-center justify-center gap-2 glow-text">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Cosmus: Companheiro IA
        </h1>
        <div className="flex justify-end items-center gap-2">
          <InstallButton />
          <ThemeSwitcher />
          <div className="relative group">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="p-2 rounded-full hover:bg-[var(--color-muted-surface)] transition-colors duration-200"
              aria-label="Ver perfil do usuário"
              aria-describedby={profileTooltipId}
            >
              <AstronautIcon className="h-6 w-6 text-[var(--color-accent)]" />
            </button>
            <div
              id={profileTooltipId}
              role="tooltip"
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs px-2 py-1 bg-[var(--color-background)] text-[var(--color-text-base)] text-xs font-semibold text-center rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20"
            >
              Perfil
            </div>
          </div>
        </div>
      </header>
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export default Header;