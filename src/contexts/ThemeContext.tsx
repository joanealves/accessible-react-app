import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'high-contrast';
type ThemePreference = Theme | 'system';

interface ThemeContextType {
  theme: Theme;
  preference: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  isDark: boolean;
  isHighContrast: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const getSystemTheme = (): Theme =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'system';

    const saved = localStorage.getItem('theme-preference');
    if (saved && ['light', 'dark', 'high-contrast', 'system'].includes(saved)) {
      return saved as ThemePreference;
    }
    return 'system';
  });

  const [theme, setThemeState] = useState<Theme>(getSystemTheme());

  useEffect(() => {
    const newTheme =
      preference === 'system' ? getSystemTheme() : preference;

    setThemeState(newTheme);
    localStorage.setItem('theme-preference', preference);

    const root = document.documentElement;

    root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');

    root.classList.add(`theme-${newTheme}`);

    const themes = {
      light: {
        '--color-primary': '#007bff',
        '--color-primary-hover': '#0056b3',
        '--color-background': '#ffffff',
        '--color-surface': '#f8f9fa',
        '--color-text': '#212529',
        '--color-text-secondary': '#6c757d',
        '--color-border': '#dee2e6',
        '--color-focus': '#80bdff',
        '--color-success': '#28a745',
        '--color-warning': '#ffc107',
        '--color-danger': '#dc3545',
        '--shadow': '0 2px 10px rgba(0, 0, 0, 0.1)',
        '--shadow-lg': '0 4px 20px rgba(0, 0, 0, 0.15)'
      },
      dark: {
        '--color-primary': '#4dabf7',
        '--color-primary-hover': '#339af0',
        '--color-background': '#121212',
        '--color-surface': '#1e1e1e',
        '--color-text': '#ffffff',
        '--color-text-secondary': '#b3b3b3',
        '--color-border': '#333333',
        '--color-focus': '#74c0fc',
        '--color-success': '#51cf66',
        '--color-warning': '#ffd43b',
        '--color-danger': '#ff6b6b',
        '--shadow': '0 2px 10px rgba(0, 0, 0, 0.3)',
        '--shadow-lg': '0 4px 20px rgba(0, 0, 0, 0.4)'
      },
      'high-contrast': {
        '--color-primary': '#0000ff',
        '--color-primary-hover': '#0000cc',
        '--color-background': '#ffffff',
        '--color-surface': '#ffffff',
        '--color-text': '#000000',
        '--color-text-secondary': '#000000',
        '--color-border': '#000000',
        '--color-focus': '#ff0000',
        '--color-success': '#008000',
        '--color-warning': '#ff8c00',
        '--color-danger': '#ff0000',
        '--shadow': '0 2px 10px rgba(0, 0, 0, 0.5)',
        '--shadow-lg': '0 4px 20px rgba(0, 0, 0, 0.7)'
      }
    };

    const currentTheme = themes[newTheme];

    Object.entries(currentTheme).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [preference]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (preference === 'system') {
        const newTheme = getSystemTheme();
        setThemeState(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);

  const setTheme = (newPreference: ThemePreference) => {
    setPreference(newPreference);
  };

  const toggleTheme = () => {
    setPreference((prev) => {
      switch (prev) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'high-contrast';
        case 'high-contrast':
          return 'system';
        default:
          return 'light';
      }
    });
  };

  const value = {
    theme,
    preference,
    setTheme,
    isDark: theme === 'dark',
    isHighContrast: theme === 'high-contrast',
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};