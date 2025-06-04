import React, { useState, useEffect, useRef } from 'react';
import { useA11y } from '../../contexts/A11yContext';
import Button  from '../Button/Button';
import './LibrasInterpreter.css';

interface LibrasInterpreterProps {
  text: string;
  className?: string;
  autoStart?: boolean;
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
}

interface LibrasWord {
  word: string;
  videoUrl?: string;
  gesture: string;
  description: string;
  handShape: string;
  movement: string;
}

const LibrasInterpreter: React.FC<LibrasInterpreterProps> = ({
  text,
  className = '',
  autoStart = false,
  size = 'medium',
  position = 'bottom-right',
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState<LibrasWord | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [librasData, setLibrasData] = useState<LibrasWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { announce, preferences } = useA11y();

  const baseLibrasDict: { [key: string]: LibrasWord } = {
    'olá': { 
      word: 'olá', 
      gesture: '👋', 
      description: 'Mão direita aberta, movimento de vai e vem',
      handShape: 'Mão aberta',
      movement: 'Lateral'
    },
    'oi': { 
      word: 'oi', 
      gesture: '👋', 
      description: 'Mão direita aberta, movimento curto lateral',
      handShape: 'Mão aberta',
      movement: 'Rápido lateral'
    },
    'tchau': { 
      word: 'tchau', 
      gesture: '👋', 
      description: 'Mão direita aberta, movimento de despedida',
      handShape: 'Mão aberta',
      movement: 'Vai e vem'
    },
    'obrigado': { 
      word: 'obrigado', 
      gesture: '🙏', 
      description: 'Mãos juntas próximas ao peito',
      handShape: 'Mãos juntas',
      movement: 'Para frente'
    },
    'obrigada': { 
      word: 'obrigada', 
      gesture: '🙏', 
      description: 'Mãos juntas próximas ao peito',
      handShape: 'Mãos juntas',
      movement: 'Para frente'
    },
    'por favor': { 
      word: 'por favor', 
      gesture: '🤲', 
      description: 'Mãos abertas em súplica',
      handShape: 'Mãos abertas',
      movement: 'Para cima'
    },
    'sim': { 
      word: 'sim', 
      gesture: '👍', 
      description: 'Mão fechada com polegar para cima',
      handShape: 'Polegar estendido',
      movement: 'Para cima'
    },
    'não': { 
      word: 'não', 
      gesture: '✋', 
      description: 'Mão aberta, movimento negativo horizontal',
      handShape: 'Mão aberta',
      movement: 'Horizontal'
    },
    'casa': { 
      word: 'casa', 
      gesture: '🏠', 
      description: 'Mãos formando telhado triangular',
      handShape: 'Mãos em triângulo',
      movement: 'Estático'
    },
    'água': { 
      word: 'água', 
      gesture: '💧', 
      description: 'Letra A próxima à boca',
      handShape: 'Letra A',
      movement: 'Próximo à boca'
    },
    'bom': { 
      word: 'bom', 
      gesture: '👌', 
      description: 'Mão direita em OK próxima ao rosto',
      handShape: 'OK',
      movement: 'Próximo ao rosto'
    },
    'amor': { 
      word: 'amor', 
      gesture: '❤️', 
      description: 'Mãos cruzadas sobre o coração',
      handShape: 'Mãos cruzadas',
      movement: 'Sobre o peito'
    }
  };

  const fetchFromVLibras = async (word: string): Promise<LibrasWord | null> => {
    try {
      const response = await fetch(`https://vlibras.gov.br/api/traduzir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          texto: word,
          formato: 'json'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.traducao) {
          return {
            word,
            videoUrl: data.video_url,
            gesture: '🤟',
            description: data.descricao || `Sinal para ${word}`,
            handShape: data.configuracao_mao || 'Não especificado',
            movement: data.movimento || 'Não especificado'
          };
        }
      }
    } catch (err) {
      console.warn(`Erro VLibras para "${word}":`, err);
    }
    return null;
  };

  const fetchFromINES = async (word: string): Promise<LibrasWord | null> => {
    try {
      const response = await fetch(`https://dicionariolibras.ines.gov.br/api/buscar/${encodeURIComponent(word)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.resultados && data.resultados.length > 0) {
          const resultado = data.resultados[0];
          return {
            word,
            videoUrl: resultado.video,
            gesture: '🤟',
            description: resultado.definicao || `Sinal para ${word}`,
            handShape: resultado.configuracao_mao || 'Não especificado',
            movement: resultado.movimento || 'Não especificado'
          };
        }
      }
    } catch (err) {
      console.warn(`Erro INES para "${word}":`, err);
    }
    return null;
  };

  const fetchLibrasData = async (words: string[]): Promise<LibrasWord[]> => {
    const results: LibrasWord[] = [];
    
    for (const word of words) {
      const cleanWord = word.toLowerCase().trim();
      
      if (baseLibrasDict[cleanWord]) {
        results.push(baseLibrasDict[cleanWord]);
        continue;
      }

      let librasWord = await fetchFromVLibras(cleanWord);
      
      if (!librasWord) {
        librasWord = await fetchFromINES(cleanWord);
      }

      if (!librasWord) {
        librasWord = {
          word: cleanWord,
          gesture: '✋',
          description: `Palavra "${cleanWord}" soletrada datilogicamente`,
          handShape: 'Alfabeto manual',
          movement: 'Soletração'
        };
      }

      results.push(librasWord);
    }
    
    return results;
  };

  const interpretText = async (textToInterpret: string) => {
    if (!textToInterpret.trim()) return;
    
    setCurrentText(textToInterpret);
    setIsLoading(true);
    setError(null);
    
    const words = textToInterpret
      .toLowerCase()
      .replace(/[^\w\sáàâãéêíóôõúûüç]/gi, '')
      .split(/\s+/)
      .filter(word => word.length > 0);

    try {
      const librasWords = await fetchLibrasData(words);
      setLibrasData(librasWords);
      setWordIndex(0);
      setIsPlaying(true);
      announce('Iniciando interpretação em Libras', 'polite');
    } catch (error) {
      console.error('Erro ao interpretar texto:', error);
      setError('Erro ao carregar interpretação em Libras');
      announce('Erro ao iniciar interpretação em Libras', 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPlaying && librasData.length > 0 && wordIndex < librasData.length) {
      const currentWordData = librasData[wordIndex];
      setCurrentWord(currentWordData);
      
      announce(`Interpretando: ${currentWordData.word}`, 'polite');
      
      const timer = setTimeout(() => {
        if (wordIndex < librasData.length - 1) {
          setWordIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setCurrentWord(null);
          setWordIndex(0);
          announce('Interpretação em Libras concluída', 'polite');
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, librasData, wordIndex, announce]);

  useEffect(() => {
    if (autoStart && text) {
      setIsActive(true);
      interpretText(text);
    }
  }, [text, autoStart]);

  const toggleInterpreter = () => {
    setIsActive(!isActive);
    if (!isActive) {
      announce('Intérprete de Libras ativado', 'polite');
    } else {
      announce('Intérprete de Libras desativado', 'polite');
      stopInterpretation();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    announce(isMinimized ? 'Intérprete expandido' : 'Intérprete minimizado', 'polite');
  };

  const stopInterpretation = () => {
    setIsPlaying(false);
    setCurrentWord(null);
    setWordIndex(0);
    announce('Interpretação interrompida', 'polite');
  };

  const restartInterpretation = () => {
    if (currentText) {
      interpretText(currentText);
    }
  };

  if (!preferences.libras) {
    return null;
  }

  return (
    <>
      <button
        className={`libras-toggle ${isActive ? 'libras-toggle--active' : ''}`}
        onClick={toggleInterpreter}
        aria-label={isActive ? 'Desativar intérprete de Libras' : 'Ativar intérprete de Libras'}
        title={isActive ? 'Desativar intérprete de Libras' : 'Ativar intérprete de Libras'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
        <span className="libras-toggle__text">Libras</span>
      </button>

      {isActive && (
        <div className={`libras-interpreter libras-interpreter--${size} libras-interpreter--${position} ${isMinimized ? 'libras-interpreter--minimized' : ''} ${className}`}>
          <div className="libras-interpreter__header">
            <h3 className="libras-interpreter__title">
              Intérprete de Libras
            </h3>
            
            <div className="libras-interpreter__controls">
              <Button
                variant="ghost"
                size="small"
                onClick={toggleMinimize}
                ariaLabel={isMinimized ? 'Expandir intérprete' : 'Minimizar intérprete'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {isMinimized ? (
                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </svg>
              </Button>
              
              <Button
                variant="ghost"
                size="small"
                onClick={() => setIsActive(false)}
                ariaLabel="Fechar intérprete"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <div className="libras-interpreter__content">
              <div className="libras-interpreter__video">
                {isLoading ? (
                  <div className="libras-interpreter__loading">
                    <div className="libras-interpreter__spinner" aria-hidden="true">⏳</div>
                    <span>Carregando sinais...</span>
                  </div>
                ) : error ? (
                  <div className="libras-interpreter__error">
                    <span>❌ {error}</span>
                  </div>
                ) : currentWord && isPlaying ? (
                  <div className="libras-interpreter__gesture">
                    <div className="libras-interpreter__gesture-display">
                      <span 
                        className="libras-interpreter__gesture-emoji" 
                        role="img" 
                        aria-label={currentWord.description}
                      >
                        {currentWord.gesture}
                      </span>
                      {currentWord.videoUrl && (
                        <video
                          ref={videoRef}
                          src={currentWord.videoUrl}
                          autoPlay
                          muted
                          loop
                          className="libras-interpreter__video-element"
                          aria-label={`Vídeo do sinal para ${currentWord.word}`}
                        />
                      )}
                    </div>
                    
                    <div className="libras-interpreter__word-info">
                      <strong>{currentWord.word.toUpperCase()}</strong>
                      <small>{currentWord.description}</small>
                      <div className="libras-interpreter__details">
                        <span>Configuração: {currentWord.handShape}</span>
                        <span>Movimento: {currentWord.movement}</span>
                      </div>
                    </div>
                    
                    <div className="libras-interpreter__progress">
                      <span>Palavra {wordIndex + 1} de {librasData.length}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${((wordIndex + 1) / librasData.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="libras-interpreter__standby">
                    <div className="libras-interpreter__avatar">👤</div>
                    <span>Aguardando texto para interpretar</span>
                  </div>
                )}
              </div>

              <div className="libras-interpreter__actions">
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => interpretText(text)}
                  disabled={!text || isPlaying || isLoading}
                  ariaLabel="Iniciar interpretação"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 5V19L19 12L8 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {isLoading ? 'Carregando...' : 'Interpretar'}
                </Button>

                {isPlaying && (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={stopInterpretation}
                    ariaLabel="Parar interpretação"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="6" y="6" width="12" height="12" fill="currentColor"/>
                    </svg>
                    Parar
                  </Button>
                )}

                {currentText && !isPlaying && (
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={restartInterpretation}
                    ariaLabel="Reiniciar interpretação"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Reiniciar
                  </Button>
                )}
              </div>

              {currentText && (
                <div className="libras-interpreter__text">
                  <strong>Texto sendo interpretado:</strong>
                  <p>{currentText}</p>
                </div>
              )}
            </div>
          )}

          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {isPlaying ? `Interpretando palavra ${wordIndex + 1} de ${librasData.length}` : 'Intérprete pronto'}
          </div>
        </div>
      )}
    </>
  );
};

export default LibrasInterpreter;