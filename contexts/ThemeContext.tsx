import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'cosmic-blue' | 'deep-nebula' | 'aurora-borealis' | 'stardust';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from local storage or default to 'cosmic-blue'
    const savedTheme = localStorage.getItem('cosmus-theme');
    return (savedTheme as Theme) || 'cosmic-blue';
  });

  useEffect(() => {
    // Apply theme to the body and save to local storage
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('cosmus-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};