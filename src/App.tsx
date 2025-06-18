import React, { useState, useEffect, useRef } from 'react';
import { A11yProvider, useA11y } from './contexts/A11yContext';
import { ThemeProvider } from './contexts/ThemeContext';
import  SkipToContent  from './components/SkipToContent/SkipToContent';
import KeyboardNavigation from './components/KeyboardNavigation/KeyBoardNavigation';
import LibrasInterpreter from './components/Libras/LibrasInterpreter';
import SpeechReader from './components/Speech/SpeechReader';
import Modal from './components/Modal/Modal';
import Button from './components/Button/Button';

const AccessibilityApp: React.FC = () => {
  const { preferences, updatePreferences, announce } = useA11y();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const text = selection.toString().substring(0, 200);
        setSelectedText(text);
        if (preferences.announcements) {
          announce(`Texto selecionado: ${text.substring(0, 50)}...`);
        }
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('keyup', handleTextSelection);
    };
  }, [preferences.announcements, announce]);

  const cards = [
    {
      title: 'Recursos de Navegação',
      description: 'Navegue pelo site usando apenas o teclado.',
      content: 'Use Tab para navegar, Enter para selecionar, Escape para fechar modais.',
      image: '⌨️'
    },
    {
      title: 'Leitor de Tela',
      description: 'Converta texto em áudio com controle de velocidade e volume.',
      content: 'Selecione qualquer texto na página e use o leitor de tela para ouvi-lo.',
      image: '🔊'
    },
    {
      title: 'Intérprete de Libras',
      description: 'Traduza texto para Língua Brasileira de Sinais (Libras).',
      content: 'Ative o intérprete de Libras para ver gestos e sinais em tempo real.',
      image: '🤟'
    },
    {
      title: 'Alto Contraste',
      description: 'Melhore a visibilidade com temas de alto contraste.',
      content: 'Ative o modo de alto contraste para melhor legibilidade.',
      image: '🎨'
    }
  ];

  const openModal = (title: string, content: string) => {
    setModalContent({ title, content });
    setModalOpen(true);
    announce(`Modal aberto: ${title}`, 'polite');
  };

  const closeModal = () => {
    setModalOpen(false);
    announce('Modal fechado', 'polite');
  };

  const [isOpen, setIsOpen] = useState(false);
  const floatingButtonRef = useRef<HTMLDivElement>(null);

  const togglePanel = () => {
    const newValue = !isOpen;
    setIsOpen(newValue);
    announce(
      newValue ? 'Painel de acessibilidade aberto' : 'Painel de acessibilidade fechado',
      'polite'
    );
  };

  return (
    <div
      style={{
        fontSize: `${preferences.fontSize}px`,
        filter: preferences.highContrast ? 'contrast(150%) brightness(120%)' : 'none',
        minHeight: '100vh',
        background: 'var(--color-background)',
        color: 'var(--color-text)',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <SkipToContent targetId="main-content" />

      <KeyboardNavigation onAnnounce={announce} />

      {preferences.libras && selectedText && <LibrasInterpreter text={selectedText} />}

      {preferences.announcements && selectedText && (
        <SpeechReader text={selectedText} autoStart={false} />
      )}

      <header
        style={{
          background: 'var(--color-surface)',
          padding: '20px 0',
          borderBottom: '2px solid var(--color-border)',
          marginBottom: '40px'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: '700',
              color: 'var(--color-primary)',
              textAlign: 'center'
            }}
          >
            Portal de Acessibilidade Digital
          </h1>
          <p
            style={{
              margin: '10px 0 0 0',
              fontSize: '18px',
              color: 'var(--color-text-secondary)',
              textAlign: 'center'
            }}
          >
            Tecnologia inclusiva para todos
          </p>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px 100px 20px',
            marginBottom: '60px'
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '30px',
              color: 'var(--color-text)',
              textAlign: 'center'
            }}
          >
            Recursos Disponíveis
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '30px',
              marginBottom: '50px'
            }}
          >
            {cards.map((card, index) => (
              <Card key={index} {...card} onClick={() => openModal(card.title, card.content)} />
            ))}
          </div>

          <div
            style={{
              textAlign: 'center',
              fontSize: '16px',
              marginBottom: '50px',
              color: 'var(--color-text-secondary)'
            }}
          >
            <p>Selecione qualquer texto para usar o leitor de tela ou intérprete de Libras.</p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >
            <Button variant="primary" onClick={() => openModal('Ajuda', 'Use os recursos de acessibilidade conforme sua necessidade')}>
              📖 Guia de Uso
            </Button>
            <Button variant="secondary" onClick={() => openModal('Contato', 'Entre em contato conosco para sugestões ou dúvidas')}>
              📞 Suporte
            </Button>
          </div>
        </section>
      </main>

      <div
        ref={floatingButtonRef}
        role="button"
        tabIndex={0}
        aria-label="Abrir painel de acessibilidade"
        onClick={togglePanel}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            togglePanel();
          }
        }}
        style={{
          position: 'fixed',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--color-primary)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: 'var(--shadow-lg)',
          transition: 'all 0.3s ease',
          zIndex: 2000
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = '3px solid var(--color-focus)';
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
      >
        🔧
      </div>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '80px',
            background: 'var(--color-background)',
            border: '2px solid var(--color-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            width: '320px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '20px',
            zIndex: 1999,
            transition: 'all 0.3s ease-in-out'
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Painel de acessibilidade"
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '20px',
              color: 'var(--color-text)',
              fontWeight: '600'
            }}
          >
            Opções de Acessibilidade
          </h3>

          <OptionCard
            title="Tamanho da Fonte"
            description="Escolha um tamanho de fonte maior para facilitar a leitura."
          >
            <select
              value={preferences.fontSize}
              onChange={(e) =>
                updatePreferences({
                  fontSize: e.target.value as any
                })
              }
              aria-label="Tamanho da fonte"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                boxSizing: 'border-box'
              }}
            >
              <option value="small">Pequeno</option>
              <option value="medium">Médio</option>
              <option value="large">Grande</option>
              <option value="extra-large">Extra Grande</option>
            </select>
          </OptionCard>

          <OptionCard
            title="Modo Alto Contraste"
            description="Ative o modo de alto contraste para melhorar a visibilidade."
          >
            <button
              onClick={() => updatePreferences({ highContrast: !preferences.highContrast })}
              aria-pressed={preferences.highContrast}
              aria-label={`Modo alto contraste ${preferences.highContrast ? 'ativado' : 'desativado'}`}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: preferences.highContrast ? '#ccc' : 'transparent',
                color: preferences.highContrast ? '#000' : '#007bff',
                border: '2px solid #007bff',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {preferences.highContrast ? 'Desativar Alto Contraste' : 'Ativar Alto Contraste'}
            </button>
          </OptionCard>

          <OptionCard
            title="Libras"
            description="Ative o intérprete de Libras para traduzir texto em tempo real."
          >
            <button
              onClick={() => updatePreferences({ libras: !preferences.libras })}
              aria-pressed={preferences.libras}
              aria-label={`Intérprete de Libras ${preferences.libras ? 'ativo' : 'inativo'}`}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: preferences.libras ? '#ffc107' : 'transparent',
                color: preferences.libras ? '#000' : '#007bff',
                border: '2px solid #ffc107',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {preferences.libras ? 'Desativar Libras' : 'Ativar Libras'}
            </button>
          </OptionCard>

          <OptionCard
            title="Leitor de Tela"
            description="Ouça qualquer texto selecionado através do leitor de tela."
          >
            <button
              onClick={() => updatePreferences({ announcements: !preferences.announcements })}
              aria-pressed={preferences.announcements}
              aria-label={`Leitor de tela ${preferences.announcements ? 'ativo' : 'inativo'}`}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: preferences.announcements ? '#28a745' : 'transparent',
                color: preferences.announcements ? '#fff' : '#007bff',
                border: '2px solid #28a745',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {preferences.announcements ? 'Desativar Leitor' : 'Ativar Leitor'}
            </button>
          </OptionCard>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalContent?.title || ''}
      >
        <p
          style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: 'var(--color-text-secondary)'
          }}
        >
          {modalContent?.content}
        </p>
        <div style={{ marginTop: '30px', textAlign: 'right' }}>
          <Button variant="primary" onClick={closeModal}>
            Entendi
          </Button>
        </div>
      </Modal>
    </div>
  );
};

interface AccessCard {
  title: string;
  description: string;
  content: string;
  image: string;
  onClick: () => void;
}

const Card: React.FC<AccessCard> = ({ title, description, image, onClick }) => (
  <div
    style={{
      background: 'var(--color-surface)',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: 'var(--shadow)',
      transition: 'box-shadow 0.3s ease',
      cursor: 'pointer'
    }}
    onClick={onClick}
    tabIndex={0}
    role="button"
    aria-label={`Abrir informações sobre ${title}`}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
  >
    <div
      style={{
        fontSize: '48px',
        textAlign: 'center',
        marginBottom: '16px',
        color: 'var(--color-primary)'
      }}
    >
      {image}
    </div>
    <h3
      style={{
        margin: '0 0 12px 0',
        fontSize: '20px',
        color: 'var(--color-text)',
        fontWeight: '600'
      }}
    >
      {title}
    </h3>
    <p
      style={{
        margin: 0,
        fontSize: '16px',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.5'
      }}
    >
      {description}
    </p>
  </div>
);

interface OptionCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const OptionCard: React.FC<OptionCardProps> = ({ title, description, children }) => (
  <div style={{ marginBottom: '20px' }}>
    <h4
      style={{
        margin: 0,
        fontSize: '18px',
        fontWeight: 'bold',
        color: 'var(--color-text)'
      }}
    >
      {title}
    </h4>
    <small
      style={{
        display: 'block',
        marginBottom: '10px',
        fontSize: '14px',
        color: 'var(--color-text-secondary)'
      }}
    >
      {description}
    </small>
    {children}
  </div>
);

export default function App() {
  return (
    <A11yProvider>
      <ThemeProvider>
        <AccessibilityApp />
      </ThemeProvider>
    </A11yProvider>
  );
}