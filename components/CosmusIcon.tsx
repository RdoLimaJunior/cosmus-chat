import React from 'react';

interface CosmusIconProps {
  className?: string;
}

const CosmusIcon: React.FC<CosmusIconProps> = ({ className = 'h-full w-full p-1' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className={`${className} text-[var(--color-accent)]`}
      aria-label="Ícone de Cosmus"
      role="img"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 8c-1.657 0-3 1.343-3 3v4c0 1.657 1.343 3 3 3h12c1.657 0 3-1.343 3-3v-4c0-1.657-1.343-3-3-3H6z M12 13a3 3 0 1 0-6 0a3 3 0 1 0 6 0z M18 13a3 3 0 1 0-6 0a3 3 0 1 0 6 0z"
      />
    </svg>
  );
};

export default CosmusIcon;
