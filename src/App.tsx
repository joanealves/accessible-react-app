import React, { useState, useEffect, useRef } from 'react';
import { A11yProvider, useA11y } from './contexts/A11yContext';
import { ThemeProvider } from './contexts/ThemeContext';
import SkipToContent from './components/SkipToContent/SkipToContent';
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
  const [isOpen, setIsOpen] = useState(false);
  const floatingButtonRef = useRef<HTMLDivElement>(null);

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

  const openInfoModal = (title: string, content: string) => {
    setModalContent({ title, content });
    setModalOpen(true);
    announce(`Modal de informações aberto: ${title}`, 'polite');
  };

  const closeModal = () => {
    setModalOpen(false);
    announce('Modal fechado', 'polite');
  };

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
        fontSize: `${preferences.fontSize === 'small' ? 14 : preferences.fontSize === 'medium' ? 16 : preferences.fontSize === 'large' ? 20 : 24}px`,
        filter: preferences.highContrast ? 'contrast(150%) brightness(120%)' : 'none',
        minHeight: '100vh',
        background: 'var(--color-background)',
        color: 'var(--color-text)',
        fontFamily: preferences.dyslexiaFont ? 'OpenDyslexic, Arial, sans-serif' : 'Arial, sans-serif'
      }}
    >
      <SkipToContent targetId="main-content" />
      <KeyboardNavigation onAnnounce={announce} />

      {preferences.libras && selectedText && <LibrasInterpreter text={selectedText} />}
      {preferences.screenReader && selectedText && (
        <SpeechReader text={selectedText} autoStart={preferences.autoPlay} />
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
            Tecnologia inclusiva para todos - Teste e experimente os recursos
          </p>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            marginBottom: '60px'
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '20px',
              color: 'var(--color-text)',
              textAlign: 'center'
            }}
          >
            Recursos de Acessibilidade
          </h2>

          <p style={{ 
            textAlign: 'center', 
            marginBottom: '30px', 
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            maxWidth: '800px',
            margin: '0 auto 30px auto'
          }}>
            Ative os recursos abaixo e teste-os na área de demonstração. 
            Cada funcionalidade pode ser ligada/desligada individualmente para você experimentar.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '50px'
            }}
          >
            <InteractiveCard
              title="Leitor de Tela"
              description="Converte texto selecionado em áudio"
              icon="🔊"
              isActive={preferences.screenReader}
              onToggle={() => {
                updatePreferences({ screenReader: !preferences.screenReader });
                announce(preferences.screenReader ? 'Leitor de tela desativado' : 'Leitor de tela ativado');
              }}
              onInfo={() => openInfoModal('Leitor de Tela', 'Selecione qualquer texto na área de demonstração e o sistema irá converter para áudio. Você pode controlar a velocidade e volume da fala.')}
            />

            <InteractiveCard
              title="Intérprete de Libras"
              description="Traduz texto para Língua Brasileira de Sinais"
              icon="🤟"
              isActive={preferences.libras}
              onToggle={() => {
                updatePreferences({ libras: !preferences.libras });
                announce(preferences.libras ? 'Intérprete de Libras desativado' : 'Intérprete de Libras ativado');
              }}
              onInfo={() => openInfoModal('Intérprete de Libras', 'Selecione texto na área de demonstração para ver a tradução em Libras aparecer na tela.')}
            />

            <InteractiveCard
              title="Alto Contraste"
              description="Melhora a visibilidade com contraste aumentado"
              icon="🎨"
              isActive={preferences.highContrast}
              onToggle={() => {
                updatePreferences({ highContrast: !preferences.highContrast });
                announce(preferences.highContrast ? 'Alto contraste desativado' : 'Alto contraste ativado');
              }}
              onInfo={() => openInfoModal('Alto Contraste', 'Aplica filtros visuais para melhorar o contraste e facilitar a leitura para pessoas com baixa visão.')}
            />

            <InteractiveCard
              title="Navegação por Teclado"
              description="Navegue usando apenas o teclado"
              icon="⌨️"
              isActive={preferences.keyboardNavigation}
              onToggle={() => {
                updatePreferences({ keyboardNavigation: !preferences.keyboardNavigation });
                announce(preferences.keyboardNavigation ? 'Navegação por teclado desativada' : 'Navegação por teclado ativada');
              }}
              onInfo={() => openInfoModal('Navegação por Teclado', 'Use Tab para navegar, Enter para selecionar, Escape para fechar modais. Teste na área de demonstração abaixo.')}
            />

            <InteractiveCard
              title="Fonte para Dislexia"
              description="Aplica fonte especial para facilitar leitura"
              icon="📖"
              isActive={preferences.dyslexiaFont}
              onToggle={() => {
                updatePreferences({ dyslexiaFont: !preferences.dyslexiaFont });
                announce(preferences.dyslexiaFont ? 'Fonte para dislexia desativada' : 'Fonte para dislexia ativada');
              }}
              onInfo={() => openInfoModal('Fonte para Dislexia', 'Aplica uma fonte especialmente projetada para pessoas com dislexia, facilitando a distinção entre letras.')}
            />

            <InteractiveCard
              title="Guia de Leitura"
              description="Destaca a linha sendo lida"
              icon="📏"
              isActive={preferences.readingGuide}
              onToggle={() => {
                updatePreferences({ readingGuide: !preferences.readingGuide });
                announce(preferences.readingGuide ? 'Guia de leitura desativado' : 'Guia de leitura ativado');
              }}
              onInfo={() => openInfoModal('Guia de Leitura', 'Destaca a linha de texto onde o cursor está posicionado, facilitando o acompanhamento da leitura.')}
            />
          </div>

          <section
            style={{
              background: 'var(--color-surface)',
              borderRadius: '12px',
              padding: '30px',
              marginBottom: '40px',
              border: '2px solid var(--color-border)',
              position: 'relative'
            }}
          >
            <h3
              style={{
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '20px',
                color: 'var(--color-primary)',
                textAlign: 'center'
              }}
            >
              🧪 Área de Demonstração e Testes
            </h3>

            <div style={{ marginBottom: '20px', padding: '20px', background: 'rgba(0, 123, 255, 0.1)', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--color-primary)', marginBottom: '10px' }}>Sobre WCAG e Acessibilidade Web</h4>
              <p style={{ lineHeight: '1.6', marginBottom: '15px' }}>
                A <strong>WCAG (Web Content Accessibility Guidelines)</strong> é um conjunto de diretrizes internacionais que define como tornar o conteúdo web mais acessível para pessoas com deficiências. As diretrizes são baseadas em quatro princípios fundamentais:
              </p>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                <li><strong>Perceptível:</strong> A informação deve ser apresentada de forma que os usuários possam percebê-la</li>
                <li><strong>Operável:</strong> Os componentes da interface devem ser operáveis por todos os usuários</li>
                <li><strong>Compreensível:</strong> A informação e operação da interface devem ser compreensíveis</li>
                <li><strong>Robusto:</strong> O conteúdo deve ser robusto o suficiente para diferentes tecnologias assistivas</li>
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: 'var(--color-text)', marginBottom: '15px' }}>Conteúdo para Teste</h4>
              <p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
                <strong>Selecione este texto</strong> para testar o leitor de tela e intérprete de Libras. 
                A acessibilidade digital é fundamental para garantir que todas as pessoas, independentemente de suas 
                habilidades ou limitações, possam navegar, compreender e interagir com conteúdo web de forma eficaz.
              </p>
              
              <p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
                Este parágrafo contém <button
                  onClick={() => announce('Você clicou em um link de demonstração. Use Tab para navegar.')} 
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--color-primary)',
                    textDecoration: 'underline',
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                    outline: 'none' 
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = '3px solid var(--color-focus)';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                >links clicáveis</button> que podem ser navegados usando o teclado.
                Pressione <kbd style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px', fontSize: '0.9em' }}>Tab</kbd> para navegar entre os elementos focáveis.
              </p>

              <blockquote style={{ 
                borderLeft: '4px solid var(--color-primary)', 
                paddingLeft: '20px', 
                fontStyle: 'italic',
                margin: '20px 0',
                color: 'var(--color-text-secondary)'
              }}>
                "A tecnologia deve adaptar-se às pessoas, e não o contrário. Quando criamos soluções acessíveis, 
                beneficiamos toda a sociedade, não apenas pessoas com deficiências."
              </blockquote>

              <div style={{ marginTop: '20px' }}>
                <h5 style={{ marginBottom: '10px' }}>Formulário de Teste:</h5>
                <div style={{ marginBottom: '15px' }}>
                  <label htmlFor="test-input" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Nome completo:
                  </label>
                  <input
                    id="test-input"
                    type="text"
                    placeholder="Digite seu nome"
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      padding: '10px',
                      border: '2px solid var(--color-border)',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <fieldset style={{ border: '1px solid var(--color-border)', padding: '15px', borderRadius: '6px' }}>
                    <legend style={{ fontWeight: '500' }}>Preferência de contato:</legend>
                    <label style={{ display: 'block', marginBottom: '8px' }}>
                      <input type="radio" name="contact" value="email" style={{ marginRight: '8px' }} />
                      E-mail
                    </label>
                    <label style={{ display: 'block' }}>
                      <input type="radio" name="contact" value="phone" style={{ marginRight: '8px' }} />
                      Telefone
                    </label>
                  </fieldset>
                </div>

                <button
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                  onClick={() => announce('Formulário enviado com sucesso!')}
                >
                  Enviar Formulário
                </button>

                <button
                  style={{
                    background: 'transparent',
                    color: 'var(--color-primary)',
                    border: '2px solid var(--color-primary)',
                    padding: '10px 22px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                  onClick={() => announce('Formulário limpo')}
                >
                  Limpar
                </button>
              </div>

              <table style={{ 
                width: '100%', 
                marginTop: '20px',
                borderCollapse: 'collapse',
                border: '1px solid var(--color-border)'
              }}>
                <caption style={{ 
                  padding: '10px',
                  fontWeight: '600',
                  textAlign: 'left',
                  background: 'var(--color-background)'
                }}>
                  Recursos de Acessibilidade Implementados
                </caption>
                <thead>
                  <tr style={{ background: 'var(--color-surface)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--color-border)' }}>Recurso</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--color-border)' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid var(--color-border)' }}>Benefício</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--color-border)' }}>Leitor de Tela</td>
                    <td style={{ padding: '12px', border: '1px solid var(--color-border)' }}>
                      {preferences.screenReader ? '✅ Ativo' : '❌ Inativo'}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid var(--color-border)' }}>Usuários com deficiência visual</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--color-border)' }}>Navegação por Teclado</td>
                    <td style={{ padding: '12px', border: '1px solid var(--color-border)' }}>
                      {preferences.keyboardNavigation ? '✅ Ativo' : '❌ Inativo'}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid var(--color-border)' }}>Usuários com limitações motoras</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px', border: '1px solid var(--color-border)' }}>Alto Contraste</td>
                    <td style={{ padding: '12px', border: '1px solid var(--color-border)' }}>
                      {preferences.highContrast ? '✅ Ativo' : '❌ Inativo'}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid var(--color-border)' }}>Usuários com baixa visão</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ 
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(40, 167, 69, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(40, 167, 69, 0.3)'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                💡 <strong>Dica:</strong> Use as teclas Tab, Enter, Escape e setas para navegar. 
                Selecione diferentes partes do texto para testar o leitor de tela e Libras.
              </p>
            </div>
          </section>

          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >
            <Button 
              variant="primary" 
              onClick={() => openInfoModal('Guia Completo', 'Este portal demonstra recursos de acessibilidade em ação. Ative os recursos acima e teste-os na área de demonstração. Cada funcionalidade implementa diretrizes WCAG para diferentes necessidades de acessibilidade.')}
            >
              📖 Guia Completo
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => openInfoModal('Sobre WCAG', 'WCAG (Web Content Accessibility Guidelines) são diretrizes internacionais para tornar conteúdo web acessível. Baseiam-se em 4 princípios: Perceptível, Operável, Compreensível e Robusto.')}
            >
              🌐 Sobre WCAG
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => openInfoModal('Suporte', 'Para dúvidas ou sugestões sobre acessibilidade, entre em contato através dos canais oficiais de suporte.')}
            >
              📞 Suporte
            </Button>
          </div>
        </section>
      </main>

      <div
        ref={floatingButtonRef}
        role="button"
        tabIndex={0}
        aria-label="Abrir painel de configurações avançadas"
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
          zIndex: 2000,
          border: '2px solid transparent'
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = '3px solid var(--color-focus)';
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
      >
        ⚙️
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
          aria-label="Painel de configurações avançadas"
        >
          <h3
            style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              color: 'var(--color-text)',
              fontWeight: '600'
            }}
          >
            ⚙️ Configurações Avançadas
          </h3>

          <OptionCard
            title="Tamanho da Fonte"
            description="Ajuste o tamanho da fonte para melhor legibilidade."
          >
            <select
              value={preferences.fontSize}
              onChange={(e) => {
                updatePreferences({ fontSize: e.target.value as any });
                announce(`Tamanho da fonte alterado para ${e.target.value}`);
              }}
              aria-label="Tamanho da fonte"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-text)'
              }}
            >
              <option value="small">Pequeno (14px)</option>
              <option value="medium">Médio (16px)</option>
              <option value="large">Grande (20px)</option>
              <option value="extra-large">Extra Grande (24px)</option>
            </select>
          </OptionCard>

          <OptionCard
            title="Velocidade da Fala"
            description="Controle a velocidade do leitor de tela."
          >
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={preferences.speechRate}
              onChange={(e) => {
                updatePreferences({ speechRate: parseFloat(e.target.value) });
                announce(`Velocidade da fala: ${e.target.value}`);
              }}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', fontSize: '14px', marginTop: '5px' }}>
              {preferences.speechRate}x
            </div>
          </OptionCard>

          <OptionCard
            title="Volume da Fala"
            description="Ajuste o volume do leitor de tela."
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={preferences.speechVolume}
              onChange={(e) => {
                updatePreferences({ speechVolume: parseFloat(e.target.value) });
                announce(`Volume da fala: ${Math.round(parseFloat(e.target.value) * 100)}%`);
              }}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', fontSize: '14px', marginTop: '5px' }}>
              {Math.round(preferences.speechVolume * 100)}%
            </div>
          </OptionCard>

          <OptionCard
            title="Reprodução Automática"
            description="Inicia a leitura automaticamente ao selecionar texto."
          >
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={preferences.autoPlay}
                onChange={(e) => {
                  updatePreferences({ autoPlay: e.target.checked });
                  announce(e.target.checked ? 'Reprodução automática ativada' : 'Reprodução automática desativada');
                }}
                style={{ marginRight: '10px', transform: 'scale(1.2)' }}
              />
              {preferences.autoPlay ? 'Ativado' : 'Desativado'}
            </label>
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

interface InteractiveCardProps {
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  onToggle: () => void;
  onInfo: () => void;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({ 
  title, 
  description, 
  icon, 
  isActive, 
  onToggle, 
  onInfo 
}) => (
  <div
    style={{
      background: 'var(--color-surface)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: 'var(--shadow)',
      border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
      transition: 'all 0.3s ease'
    }}
  >
    <div
      style={{
        fontSize: '36px',
        textAlign: 'center',
        marginBottom: '12px',
        filter: isActive ? 'none' : 'grayscale(50%)'
      }}
    >
      {icon}
    </div>
    
    <h3
      style={{
        margin: '0 0 8px 0',
        fontSize: '18px',
        color: 'var(--color-text)',
        fontWeight: '600',
        textAlign: 'center'
      }}
    >
      {title}
    </h3>
    
    <p
      style={{
        margin: '0 0 16px 0',
        fontSize: '14px',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.4',
        textAlign: 'center'
      }}
    >
      {description}
    </p>

    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={onToggle}
        style={{
          flex: 1,
          padding: '10px',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          background: isActive ? 'var(--color-primary)' : 'var(--color-border)',
          color: isActive ? 'white' : 'var(--color-text)',
          transition: 'all 0.2s ease'
        }}
        aria-pressed={isActive}
        aria-label={`${isActive ? 'Desativar' : 'Ativar'} ${title}`}
      >
        {isActive ? 'Ativo' : 'Ativar'}
      </button>
      
      <button onClick={onInfo}
        style={{
          padding: '10px 12px',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: 'pointer',
          background: 'var(--color-background)',
          color: 'var(--color-text)',
          transition: 'all 0.2s ease'
        }}
        aria-label={`Informações sobre ${title}`}
        title={`Mais informações sobre ${title}`}
      >
        ℹ️
      </button>
    </div>
  </div>
);

interface OptionCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const OptionCard: React.FC<OptionCardProps> = ({ title, description, children }) => (
  <div
    style={{
      marginBottom: '20px',
      padding: '16px',
      background: 'var(--color-surface)',
      borderRadius: '8px',
      border: '1px solid var(--color-border)'
    }}
  >
    <h4
      style={{
        margin: '0 0 8px 0',
        fontSize: '16px',
        color: 'var(--color-text)',
        fontWeight: '600'
      }}
    >
      {title}
    </h4>
    <p
      style={{
        margin: '0 0 12px 0',
        fontSize: '14px',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.3'
      }}
    >
      {description}
    </p>
    {children}
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <A11yProvider>
        <AccessibilityApp />
      </A11yProvider>
    </ThemeProvider>
  );
};

export default App;