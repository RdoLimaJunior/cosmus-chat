import React from 'react';
import CosmusIcon from './CosmusIcon';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[var(--color-background)] flex flex-col items-center justify-center z-[9999] animate-splash-fade-out">
      <div className="w-48 h-48 animate-splash-enter">
        <CosmusIcon className="w-full h-full p-1" />
      </div>
      <p className="mt-4 text-xl text-[var(--color-accent)] glow-text tracking-widest animate-splash-text-fade-in">
        INICIALIZANDO...
      </p>
    </div>
  );
};

export default SplashScreen;