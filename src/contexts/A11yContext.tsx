import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';

interface A11yPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  announcements: boolean;
  libras: boolean;
  keyboardNavigation: boolean;
  screenReader: boolean;
}

interface A11yContextType {
  preferences: A11yPreferences;
  updatePreferences: (preferences: Partial<A11yPreferences>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  isScreenReaderActive: boolean;
}

const A11yContext = createContext<A11yContextType | undefined>(undefined);

interface A11yProviderProps {
  children: ReactNode;
}

export const A11yProvider: React.FC<A11yProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<A11yPreferences>(() => {
    const defaultPrefs: A11yPreferences = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: false,
      fontSize: 'medium',
      announcements: true,
      libras: false,
      keyboardNavigation: true,
      screenReader: false,
    };

    if (typeof window === 'undefined') return defaultPrefs;

    const isProduction = process.env.NODE_ENV === 'production';
    let saved = null;

    try {
      saved = localStorage.getItem('a11y-preferences');
    } catch (e) {
      console.warn('localStorage não disponível');
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultPrefs, ...parsed };
      } catch {
        return defaultPrefs;
      }
    }

    return defaultPrefs;
  });

  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null);
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  useEffect(() => {
    const detectScreenReader = () => {
      const hasLiveRegion = !!document.querySelector('[aria-live]');
      const isKnownSR = /NVDA|JAWS|VoiceOver|Talkback/i.test(navigator.userAgent);

      setIsScreenReaderActive(isKnownSR || hasLiveRegion);

      if (isKnownSR || hasLiveRegion) {
        setPreferences((prev) => ({
          ...prev,
          announcements: true,
          screenReader: true,
        }));
      }
    };

    detectScreenReader();

    const handleFocusIn = () => {
      setIsScreenReaderActive(true);
    };

    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  useEffect(() => {
    const announcerElement = document.createElement('div');
    announcerElement.setAttribute('aria-live', 'polite');
    announcerElement.setAttribute('aria-atomic', 'true');
    announcerElement.setAttribute('id', 'a11y-announcer');
    announcerElement.style.cssText = `
      position: absolute !important;
      left: -10000px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
      clip: rect(1px, 1px, 1px, 1px) !important;
      white-space: nowrap !important;
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
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('a11y-preferences', JSON.stringify(preferences));
      } catch (e) {
        console.warn('Não foi possível salvar preferências');
      }
    }

    const root = document.documentElement;

    root.classList.toggle('reduce-motion', preferences.reducedMotion);
    root.classList.toggle('high-contrast', preferences.highContrast);
    root.classList.toggle('keyboard-navigation', preferences.keyboardNavigation);
    root.classList.toggle('screen-reader-active', preferences.screenReader);

    root.setAttribute('data-font-size', preferences.fontSize);
    root.setAttribute('data-libras-enabled', String(preferences.libras));
    root.setAttribute('data-announcements-enabled', String(preferences.announcements));

    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px',
    };

    root.style.setProperty('--base-font-size', fontSizeMap[preferences.fontSize]);
    root.style.setProperty(
      '--font-scale',
      preferences.fontSize === 'small'
        ? '0.875'
        : preferences.fontSize === 'large'
        ? '1.125'
        : preferences.fontSize === 'extra-large'
        ? '1.25'
        : '1'
    );

    if (preferences.highContrast) {
      root.style.setProperty('--color-background', '#000000');
      root.style.setProperty('--color-text', '#ffffff');
      root.style.setProperty('--color-primary', '#ffff00');
      root.style.setProperty('--color-focus', '#ff00ff');
    } else {
      root.style.removeProperty('--color-background');
      root.style.removeProperty('--color-text');
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-focus');
    }
  }, [preferences]);

  const updatePreferences = useCallback((newPrefs: Partial<A11yPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!preferences.announcements || !announcer) return;

    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;

    setTimeout(() => {
      announcer.textContent = '';
    }, 3000);
  }, [preferences.announcements, announcer]);

  const value = {
    preferences,
    updatePreferences,
    announce,
    isScreenReaderActive,
  };

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
};

export const useA11y = () => {
  const context = useContext(A11yContext);
  if (context === undefined) {
    throw new Error('useA11y must be used within an A11yProvider');
  }
  return context;
};