import React from 'react';
import InstallButton from './InstallButton';

const Header: React.FC = () => {

  return (
    <>
      <header className="w-full bg-transparent p-4 text-center border-b-2 border-[var(--color-border)] grid grid-cols-3 items-center">
        <div className="flex justify-start">
          {/* Espaço reservado para manter o título centralizado */}
        </div>
        <h1 className="col-start-2 text-2xl font-bold text-[var(--color-accent)] tracking-wider flex items-center justify-center gap-2 glow-text">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Cosmus: Companheiro IA
        </h1>
        <div className="flex justify-end items-center gap-2">
          <InstallButton />
        </div>
      </header>
    </>
  );
};

export default Header;