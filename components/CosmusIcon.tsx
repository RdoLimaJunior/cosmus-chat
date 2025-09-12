import React from 'react';

interface CosmusIconProps {
  className?: string;
}

const CosmusIcon: React.FC<CosmusIconProps> = ({ className = 'h-full w-full p-1' }) => {
  return (
    <img 
      src="/cosmus.webp" 
      alt="Avatar de Cosmus" 
      className={className} 
      aria-label="Avatar de Cosmus"
      role="img"
    />
  );
};

export default CosmusIcon;