import React from 'react';
import CosmusIcon from './CosmusIcon';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-14 h-14 relative">
        <div className="w-full h-full rounded-full bg-[var(--color-muted-surface)] flex items-center justify-center">
            <CosmusIcon className="w-10 h-10 animate-cosmus-pulse" />
        </div>
        <div className="absolute inset-0 border-2 border-t-[var(--color-accent)] border-r-[var(--color-accent)] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;