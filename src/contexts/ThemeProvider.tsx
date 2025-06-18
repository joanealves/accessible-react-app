import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'high-contrast';
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
  isDark: boolean;
  isHighContrast: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'high-contrast';
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (mediaQuery.matches) {
      setTheme('dark');
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.remove('light', 'dark', 'high-contrast');
    
    root.classList.add(theme);
    
    const themes = {
      light: {
        '--color-primary': '#007bff',
        '--color-secondary': '#6c757d',
        '--color-success': '#28a745',
        '--color-warning': '#ffc107',
        '--color-danger': '#dc3545',
        '--color-info': '#17a2b8',
        '--color-background': '#ffffff',
        '--color-surface': '#f8f9fa',
        '--color-text': '#212529',
        '--color-text-secondary': '#6c757d',
        '--color-border': '#dee2e6',
        '--color-focus': '#007bff',
        '--shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
        '--shadow-lg': '0 8px 25px rgba(0, 0, 0, 0.15)'
      },
      dark: {
        '--color-primary': '#0d6efd',
        '--color-secondary': '#6c757d',
        '--color-success': '#198754',
        '--color-warning': '#ffc107',
        '--color-danger': '#dc3545',
        '--color-info': '#0dcaf0',
        '--color-background': '#121212',
        '--color-surface': '#1e1e1e',
        '--color-text': '#ffffff',
        '--color-text-secondary': '#adb5bd',
        '--color-border': '#343a40',
        '--color-focus': '#0d6efd',
        '--shadow': '0 2px 4px rgba(0, 0, 0, 0.3)',
        '--shadow-lg': '0 8px 25px rgba(0, 0, 0, 0.4)'
      },
      'high-contrast': {
        '--color-primary': '#ffffff',
        '--color-secondary': '#ffffff',
        '--color-success': '#ffffff',
        '--color-warning': '#ffffff',
        '--color-danger': '#ffffff',
        '--color-info': '#ffffff',
        '--color-background': '#000000',
        '--color-surface': '#000000',
        '--color-text': '#ffffff',
        '--color-text-secondary': '#ffffff',
        '--color-border': '#ffffff',
        '--color-focus': '#ffff00',
        '--shadow': '0 0 0 2px #ffffff',
        '--shadow-lg': '0 0 0 3px #ffffff'
      }
    };

    const currentTheme = themes[theme];
    Object.entries(currentTheme).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSetTheme = (newTheme: 'light' | 'dark' | 'high-contrast') => {
    setTheme(newTheme);
  };

  const contextValue: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    isDark: theme === 'dark',
    isHighContrast: theme === 'high-contrast'
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};