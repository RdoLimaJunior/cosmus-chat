import React, { useState, useEffect, useRef, useId } from 'react';
import { useTheme } from '../contexts/ThemeContext';

type Theme = 'cosmic-blue' | 'deep-nebula' | 'aurora-borealis' | 'stardust';

const themeOptions: { value: Theme; label: string }[] = [
  { value: 'cosmic-blue', label: 'Azul Cósmico' },
  { value: 'deep-nebula', label: 'Nebulosa Profunda' },
  { value: 'aurora-borealis', label: 'Aurora Boreal' },
  { value: 'stardust', label: 'Poeira Estelar' },
];

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
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

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-[var(--color-muted-surface)] transition-colors duration-200"
          aria-label="Mudar tema"
          aria-describedby={tooltipId}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-accent)]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 10a1 1 0 01-1-1H2a1 1 0 010-2h1a1 1 0 011 1zM16 10a1 1 0 01-1-1h-1a1 1 0 110-2h1a1 1 0 011 1zM9 16a1 1 0 011-1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3.536 6.464a1 1 0 00-1.414-1.414L1.414 5.76a1 1 0 001.414 1.414l.707-.707zM15.05 15.05a1 1 0 011.414 1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707zM16.464 3.536a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM5.05 15.05a1 1 0 01-1.414 1.414l-.707.707a1 1 0 011.414-1.414l.707-.707a1 1 0 010-1.414zM10 5a5 5 0 100 10 5 5 0 000-10z" />
          </svg>
        </button>
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs px-2 py-1 bg-[var(--color-background)] text-[var(--color-text-base)] text-xs font-semibold text-center rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20"
        >
          Mudar tema
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl z-10">
          <ul className="p-1">
            {themeOptions.map((option) => (
              <li key={option.value}>
                <button
                  onClick={() => handleThemeChange(option.value)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                    theme === option.value
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-base)] hover:bg-[var(--color-muted-surface)]'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;