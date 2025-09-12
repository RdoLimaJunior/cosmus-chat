import React, { useState, useEffect, useRef, useId } from 'react';

const HelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-12 flex justify-start">
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-[var(--color-muted-surface)] transition-colors duration-200"
          aria-label="Ajuda"
          aria-expanded={isOpen}
          aria-describedby={tooltipId}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs px-2 py-1 bg-[var(--color-background)] text-[var(--color-text-base)] text-xs font-semibold text-center rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20"
        >
          Ajuda
        </div>
      </div>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-72 spaceship-panel p-4 text-[var(--color-text-base)] z-10"
          role="dialog"
          aria-labelledby="help-title"
        >
          <h3 id="help-title" className="font-bold text-lg text-[var(--color-accent)] mb-2">Como conversar com Cosmus</h3>
          <p className="text-sm mb-3">
            Cosmus é um guia que usa o <strong>Método Socrático</strong>. Em vez de dar respostas diretas, ele faz perguntas para te ajudar a descobrir o conhecimento por conta própria!
          </p>
          <p className="text-sm">
            Use os <strong>botões de sugestão</strong> que aparecem após as respostas dele para explorar os tópicos mais a fundo.
          </p>
        </div>
      )}
    </div>
  );
};

export default HelpButton;