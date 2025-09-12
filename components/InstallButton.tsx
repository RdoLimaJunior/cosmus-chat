import React, { useId } from 'react';
import { usePwaInstall } from '../contexts/PwaInstallContext';

const InstallButton: React.FC = () => {
  const { isInstallable, install } = usePwaInstall();
  const tooltipId = useId();

  return (
    <div className="relative group">
      <button
        onClick={install}
        disabled={!isInstallable}
        className={`p-2 rounded-full hover:bg-[var(--color-muted-surface)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isInstallable ? 'animate-install-ready' : ''}`}
        aria-label="Instalar Aplicativo"
        aria-describedby={tooltipId}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
      <div
        id={tooltipId}
        role="tooltip"
        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs px-2 py-1 bg-[var(--color-background)] text-[var(--color-text-base)] text-xs font-semibold text-center rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20"
      >
        {isInstallable ? 'Instalar Aplicativo' : 'Instalação Indisponível'}
      </div>
    </div>
  );
};

export default InstallButton;