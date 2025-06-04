import React, { useEffect, useRef } from 'react';
import { useA11y } from '../../contexts/A11yContext';

interface KeyboardNavigationProps {
  enabled?: boolean;
  onAnnounce?: (message: string) => void;
}

const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({ 
  enabled = true,
  onAnnounce 
}) => {
  const { announce } = useA11y();
  const isHandlingRef = useRef(false);

  useEffect(() => {
    if (!enabled || isHandlingRef.current) return;

    isHandlingRef.current = true;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          onAnnounce?.('Navegando para o conteúdo principal');
          announce('Navegando para o conteúdo principal', 'polite');
        }
      }

      else if (e.altKey && e.key === '2') {
        e.preventDefault();
        const navElement = document.querySelector('nav') || document.querySelector('[role="navigation"]');
        if (navElement instanceof HTMLElement) {
          navElement.focus();
          onAnnounce?.('Navegando para o menu de navegação');
          announce('Navegando para o menu de navegação', 'polite');
        }
      }

      else if (e.altKey && e.key === '3') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') || 
                           document.querySelector('[role="search"] input');
        if (searchInput instanceof HTMLElement) {
          searchInput.focus();
          onAnnounce?.('Navegando para o campo de busca');
          announce('Navegando para o campo de busca', 'polite');
        }
      }

      else if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const accessibilityButton = document.querySelector(
          '[aria-label*="acessibilidade"], [aria-label*="accessibility"]'
        );
        if (accessibilityButton instanceof HTMLElement) {
          accessibilityButton.click();
          onAnnounce?.('Abrindo painel de acessibilidade');
          announce('Abrindo painel de acessibilidade', 'polite');
        }
      }

      else if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const header = document.querySelector('header') || document.querySelector('h1');
        if (header instanceof HTMLElement) {
          header.focus();
        }
        onAnnounce?.('Navegando para o topo da página');
        announce('Navegando para o topo da página', 'polite');
      }

      else if (e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const footer = document.querySelector('footer');
        if (footer instanceof HTMLElement) {
          footer.scrollIntoView({ behavior: 'smooth' });
          footer.focus();
          onAnnounce?.('Navegando para o rodapé');
          announce('Navegando para o rodapé', 'polite');
        }
      }

      else if (e.key === 'Escape') {
        const openModal = document.querySelector('[role="dialog"][aria-modal="true"]');
        const openDropdown = document.querySelector('[aria-expanded="true"]');

        if (openModal) {
          const closeButton = openModal.querySelector('[aria-label*="fechar"], [aria-label*="close"]');
          if (closeButton instanceof HTMLElement) {
            closeButton.click();
            onAnnounce?.('Modal fechado');
            announce('Modal fechado', 'polite');
          }
        } else if (openDropdown) {
          openDropdown.setAttribute('aria-expanded', 'false');
          if (openDropdown instanceof HTMLElement) {
            openDropdown.focus();
          }
          onAnnounce?.('Menu fechado');
          announce('Menu fechado', 'polite');
        }
      }

      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
        setTimeout(() => {
          const focusedElement = document.activeElement;
          if (focusedElement && focusedElement.tagName) {
            const elementName = focusedElement.tagName.toLowerCase();
            const elementRole = focusedElement.getAttribute('role') || '';
            const elementLabel = focusedElement.getAttribute('aria-label') || 
                               focusedElement.getAttribute('title') ||
                               (focusedElement as HTMLElement).innerText?.substring(0, 50);
            
            if (elementLabel) {
              const message = `Foco em ${elementRole || elementName}: ${elementLabel}`;
              onAnnounce?.(message);
              announce(message, 'polite');
            }
          }
        }, 100);
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      isHandlingRef.current = false;
    };
  }, [enabled, onAnnounce, announce]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Indicadores de foco melhorados */
      body.keyboard-navigation *:focus {
        outline: 3px solid var(--color-focus) !important;
        outline-offset: 2px !important;
        border-radius: 4px;
      }

      body:not(.keyboard-navigation) *:focus {
        outline: none;
      }

      a:focus {
        background: var(--color-focus);
        color: var(--color-background);
        text-decoration: underline;
      }

      button:focus {
        box-shadow: 0 0 0 3px var(--color-focus);
      }

      .skip-to-content:focus {
        position: fixed !important;
        top: 20px !important;
        left: 20px !important;
        width: auto !important;
        height: auto !important;
        z-index: 10000 !important;
        outline: 2px solid var(--color-focus) !important;
      }

      [role="button"]:focus,
      [tabindex="0"]:focus {
        outline: 3px solid var(--color-focus) !important;
        outline-offset: 2px !important;
      }

      [data-theme="high-contrast"] *:focus {
        outline: 4px solid #ff0000 !important;
        outline-offset: 2px !important;
      }
    `;
    
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return null;
};

export default KeyboardNavigation;