
import React from 'react';
import CosmusIcon from './CosmusIcon';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-10 h-10 bg-[var(--color-muted-surface)] flex items-center justify-center border-2 border-[var(--color-accent)] relative hexagon-clip">
        <CosmusIcon />
        <div className="absolute inset-0 border-2 border-t-[var(--color-accent)] border-r-[var(--color-accent)] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;