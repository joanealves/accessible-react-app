import React, { forwardRef, useState, useEffect, ButtonHTMLAttributes } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className = '',
      ariaLabel,
      ariaDescribedBy,
      onClick,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);
    const [hasFocus, setHasFocus] = useState(false);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        setIsPressed(true);
      }
    };

    const handleKeyUp = () => {
      setIsPressed(false);
    };

    useEffect(() => {
      const handleBlur = () => {
        setIsPressed(false);
        setHasFocus(false);
      };

      const button = document.activeElement as HTMLButtonElement;

      if (button && button.tagName === 'BUTTON') {
        button.addEventListener('blur', handleBlur);
      }

      return () => {
        if (button && button.tagName === 'BUTTON') {
          button.removeEventListener('blur', handleBlur);
        }
      };
    }, []);

    const baseClasses = `
      btn
      ${variant ? `btn--${variant}` : ''}
      ${size ? `btn--${size}` : ''}
      ${fullWidth ? 'btn--full-width' : ''}
      ${loading ? 'btn--loading' : ''}
      ${className}
      ${isPressed ? 'btn--pressed' : ''}
      ${hasFocus ? 'btn--focus' : ''}
    `.trim();

    return (
      <button
        ref={ref}
        type="button"
        className={baseClasses}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading}
        onClick={handleClick}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        {...props}
      >
        {loading && (
          <span className="btn__spinner" aria-hidden="true">
            <svg className="btn__spinner-icon" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="32"
                strokeDashoffset="32"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 12 12;360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </span>
        )}

        {leftIcon && !loading && (
          <span className="btn__icon btn__icon--left" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <span className="btn__content">{children}</span>

        {rightIcon && !loading && (
          <span className="btn__icon btn__icon--right" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {loading && <span className="sr-only">Carregando...</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;