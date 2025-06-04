import React from 'react';

interface SkipToContentProps {
  targetId?: string;
  children?: React.ReactNode;
  className?: string;
}

export const SkipToContent: React.FC<SkipToContentProps> = ({ 
  targetId = 'main-content', 
  children = 'Pular para o conteúdo principal',
  className = ''
}) => {
  return (
    <a 
      href={`#${targetId}`} 
      className={`skip-to-content ${className}`}
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        background: 'var(--color-primary)',
        color: 'var(--color-background)',
        padding: '12px 20px',
        textDecoration: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 'bold',
        zIndex: 10000,
        transition: 'all 0.3s ease',
        border: '2px solid transparent',
        fontFamily: 'inherit'
      }}
      onFocus={(e) => {
        const target = e.target as HTMLAnchorElement;
        target.style.position = 'fixed';
        target.style.top = '20px';
        target.style.left = '20px';
        target.style.width = 'auto';
        target.style.height = 'auto';
        target.style.border = '2px solid var(--color-focus)';
        target.style.outline = '2px solid var(--color-background)';
        target.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        const target = e.target as HTMLAnchorElement;
        target.style.position = 'absolute';
        target.style.left = '-9999px';
        target.style.width = '1px';
        target.style.height = '1px';
        target.style.border = '2px solid transparent';
        target.style.outline = 'none';
      }}
      onClick={(e) => {
        setTimeout(() => {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.focus();
          }
        }, 100);
      }}
    >
      {children}
    </a>
  );
};