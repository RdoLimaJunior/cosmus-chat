import React from 'react';

interface AstronautIconProps {
  className?: string;
}

const AstronautIcon: React.FC<AstronautIconProps> = ({ className = 'h-6 w-6' }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} text-[var(--color-accent)]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Um capacete de astronauta simples e reconhecível para representar o usuário/explorador. */}
      <path d="M15.5 14h.01" />
      <path d="M8.5 14h.01" />
      <path d="M12 17h.01" />
      <path d="M12 21a8 8 0 00-8-8v0a8 8 0 1016 0v0a8 8 0 00-8-8z" />
      <path d="M12 3a8 8 0 00-5.65 2.34" />
    </svg>
  );
};

export default AstronautIcon;