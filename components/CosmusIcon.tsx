import React from 'react';

interface CosmusIconProps {
  className?: string;
}

const CosmusIcon: React.FC<CosmusIconProps> = ({ className = 'h-full w-full p-1' }) => {
  return (
    <img 
      src="/cosmus-icon.svg" 
      alt="Ícone de Cosmus" 
      className={className} 
      aria-label="Ícone de Cosmus"
      role="img"
    />
  );
};

export default CosmusIcon;