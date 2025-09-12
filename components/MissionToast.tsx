import React from 'react';

interface MissionToastProps {
  missionName: string;
}

const MissionToast: React.FC<MissionToastProps> = ({ missionName }) => {
  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 w-full max-w-md z-50 animate-mission-toast"
      role="alert"
      aria-live="assertive"
    >
      <div className="spaceship-panel p-3 flex items-center justify-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2.5a.75.75 0 01.696.459l1.42 2.882 3.181.463a.75.75 0 01.416 1.279l-2.3 2.242.543 3.17a.75.75 0 01-1.088.791L10 12.347l-2.85 1.5a.75.75 0 01-1.088-.79l.543-3.17-2.3-2.242a.75.75 0 01.416-1.28l3.181-.462 1.42-2.882A.75.75 0 0110 2.5z" clipRule="evenodd" />
        </svg>
        <div className="text-center">
          <h3 className="font-bold text-[var(--color-accent)]">Missão Concluída!</h3>
          <p className="text-sm text-[var(--color-text-base)] truncate">
            Você explorou: {missionName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionToast;