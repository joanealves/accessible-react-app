import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface A11yPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  announcements: boolean;
  libras: boolean;
  keyboardNavigation: boolean;
  screenReader: boolean;
  magnifier: boolean;
  magnificationLevel: number;
  readingGuide: boolean;
  focusIndicator: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  dyslexiaFont: boolean;
  speechRate: number;
  speechVolume: number;
  autoPlay: boolean;
}

const defaultPreferences: A11yPreferences = {
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  announcements: true,
  libras: false,
  keyboardNavigation: true,
  screenReader: false,
  magnifier: false,
  magnificationLevel: 2,
  readingGuide: false,
  focusIndicator: true,
  colorBlindness: 'none',
  dyslexiaFont: false,
  speechRate: 1,
  speechVolume: 0.8,
  autoPlay: false
};

const fontSizeMap = {
  'small': 14,
  'medium': 16,
  'large': 20,
  'extra-large': 24
};

interface A11yContextType {
  preferences: A11yPreferences;
  updatePreferences: (prefs: Partial<A11yPreferences>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  getFontSize: () => number;
}

const A11yContext = createContext<A11yContextType | null>(null);

export const useA11y = () => {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within A11yProvider');
  }
  return context;
};

interface A11yProviderProps {
  children: ReactNode;
}

export const A11yProvider: React.FC<A11yProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<A11yPreferences>(() => {
    // Tentar carregar preferências do localStorage se disponível
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('a11y-preferences');
        return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
      } catch {
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  });
  
  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null);

  // Criar elemento para anúncios de screen reader
  useEffect(() => {
    const announcerElement = document.createElement('div');
    announcerElement.setAttribute('aria-live', 'polite');
    announcerElement.setAttribute('aria-atomic', 'true');
    announcerElement.style.cssText = `
      position: absolute !important;
      left: -10000px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
    `;
    document.body.appendChild(announcerElement);
    setAnnouncer(announcerElement);

    return () => {
      if (document.body.contains(announcerElement)) {
        document.body.removeChild(announcerElement);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('a11y-preferences', JSON.stringify(preferences));
      } catch (error) {
        console.warn('Não foi possível salvar as preferências de acessibilidade:', error);
      }
    }
  }, [preferences]);

  useEffect(() => {
    const body = document.body;
    
    // Movimento reduzido
    if (preferences.reducedMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }

    // Alto contraste
    if (preferences.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Fonte para dislexia
    if (preferences.dyslexiaFont) {
      body.classList.add('dyslexia-font');
    } else {
      body.classList.remove('dyslexia-font');
    }

    // Daltonismo
    body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (preferences.colorBlindness !== 'none') {
      body.classList.add(preferences.colorBlindness);
    }

    // Indicador de foco aprimorado
    if (preferences.focusIndicator) {
      body.classList.add('enhanced-focus');
    } else {
      body.classList.remove('enhanced-focus');
    }

  }, [preferences]);

  const updatePreferences = useCallback((newPrefs: Partial<A11yPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!preferences.announcements || !announcer) return;
    
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;
    
    setTimeout(() => {
      if (announcer) {
        announcer.textContent = '';
      }
    }, 3000);
  }, [preferences.announcements, announcer]);

  const getFontSize = useCallback(() => {
    return fontSizeMap[preferences.fontSize];
  }, [preferences.fontSize]);

  const value: A11yContextType = {
    preferences,
    updatePreferences,
    announce,
    getFontSize
  };

  return (
    <A11yContext.Provider value={value}>
      {children}
    </A11yContext.Provider>
  );
};