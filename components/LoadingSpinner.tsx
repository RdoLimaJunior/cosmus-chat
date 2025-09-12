

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-14 h-14 relative">
        <img src="/cosmus.webp" alt="Avatar de Cosmus" className="w-full h-full rounded-full object-cover" />
        <div className="absolute inset-0 border-2 border-t-[var(--color-accent)] border-r-[var(--color-accent)] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;