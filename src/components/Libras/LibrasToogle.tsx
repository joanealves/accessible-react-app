import React from 'react';
import { useA11y } from '../../contexts/A11yContext';
import Button from '../Button/Button';

interface LibrasToggleProps {
  className?: string;
  showLabel?: boolean;
}

const LibrasToggle: React.FC<LibrasToggleProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const { preferences, updatePreferences, announce } = useA11y();

  const toggleLibras = () => {
    const newValue = !preferences.libras;
    updatePreferences({ libras: newValue });
    
    if (newValue) {
      announce('Intérprete de Libras ativado', 'polite');
    } else {
      announce('Intérprete de Libras desativado', 'polite');
    }
  };

  return (
    <div 
      className={`libras-toggle-container ${className}`} 
      role="toolbar" 
      aria-label="Controle do intérprete de Libras"
    >
      <Button
        variant={preferences.libras ? 'primary' : 'secondary'}
        onClick={toggleLibras}
        ariaLabel={preferences.libras ? 'Desativar intérprete de Libras' : 'Ativar intérprete de Libras'}
        className="libras-toggle-button"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2Z"
            fill="currentColor"
          />
          <path
            d="M19 10V12C19 15.9 15.9 19 12 19S5 15.9 5 12V10H7V12C7 14.8 9.2 17 12 17S17 14.8 17 12V10H19Z"
            fill="currentColor"
          />
          <path
            d="M12 19V22M8 22H16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {showLabel && (
          <span className="libras-toggle-text">
            {preferences.libras ? 'Libras Ativo' : 'Ativar Libras'}
          </span>
        )}
      </Button>
      
      {preferences.libras && (
        <small 
          className="libras-status" 
          aria-live="polite"
          role="status"
        >
          Intérprete de Libras disponível
        </small>
      )}
    </div>
  );
};

export default LibrasToggle;