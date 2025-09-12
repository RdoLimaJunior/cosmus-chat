import React from 'react';
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

  return (
    <ul className="space-y-2">
      {themeOptions.map((option) => (
        <li key={option.value}>
          <button
            onClick={() => setTheme(option.value)}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
              theme === option.value
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-base)] bg-[var(--color-muted-surface)] hover:bg-opacity-70'
            }`}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ThemeSwitcher;