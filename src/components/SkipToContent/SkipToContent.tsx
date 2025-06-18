import React from 'react';

interface SkipToContentProps {
  targetId?: string;
}

const SkipToContent: React.FC<SkipToContentProps> = ({ targetId = 'main-content' }) => {
  const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.left = '10px';
    e.currentTarget.style.position = 'fixed';
  };

  const handleBlur = (e: React.FocusEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.left = '-9999px';
    e.currentTarget.style.position = 'absolute';
  };

  return (
    <a
      href={`#${targetId}`}
      className="skip-to-content"
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      Pular para o conteúdo principal
    </a>
  );
};

export default SkipToContent;
