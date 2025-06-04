import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useA11y } from '../../contexts/A11yContext';
import Button from '../Button/Button';

interface SpeechUtteranceOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface SpeechReaderProps {
  text?: string;
  autoStart?: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  highlightText?: boolean;
}

const SpeechReader: React.FC<SpeechReaderProps> = ({
  text = '',
  autoStart = false,
  rate = 1,
  pitch = 1,
  volume = 1,
  className = '',
  size = 'medium',
  highlightText = true,
}) => {
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState(rate);
  const [speechPitch, setSpeechPitch] = useState(pitch);
  const [speechVolume, setSpeechVolume] = useState(volume);
  const [isSupported, setIsSupported] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef<string>('');

  const { announce, preferences } = useA11y();

  const loadVoices = useCallback(() => {
    try {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length === 0) return;

      setVoices(availableVoices);

      const ptBrVoice = availableVoices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR'));
      const defaultVoice = availableVoices.find(v => v.default);

      if (ptBrVoice) {
        setSelectedVoice(ptBrVoice);
      } else if (defaultVoice) {
        setSelectedVoice(defaultVoice);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0]);
      }
    } catch (err) {
      console.warn('Erro ao carregar vozes:', err);
      setError('Erro ao carregar vozes disponíveis');
    }
  }, []);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      loadVoices();
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
    } else {
      setIsSupported(false);
      setError('Síntese de voz não é suportada neste navegador.');
    }

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      if (utteranceRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [loadVoices]);

  const createUtterance = useCallback(
    (options: SpeechUtteranceOptions = {}) => {
      if (!text.trim() || !isSupported) return null;

      const utterance = new SpeechSynthesisUtterance(text);
      const { voice = selectedVoice } = options;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      utterance.volume = speechVolume;
      utterance.lang = voice?.lang || selectedVoice?.lang || 'pt-BR';

      utterance.onstart = () => {
        setIsReading(true);
        setIsPaused(false);
        setError(null);
        announce('Iniciando leitura do texto', 'polite');
      };

      utterance.onend = () => {
        setIsReading(false);
        setIsPaused(false);
        setCurrentPosition(0);
        announce('Leitura concluída', 'polite');
      };

      utterance.onerror = (event) => {
        setIsReading(false);
        setIsPaused(false);
        setCurrentPosition(0);
        const errorMsg = `Erro na síntese de voz: ${event.error}`;
        setError(errorMsg);
        announce(errorMsg, 'assertive');
        console.error('Speech synthesis error:', event);
      };

      utterance.onpause = () => {
        setIsPaused(true);
        announce('Leitura pausada', 'polite');
      };

      utterance.onresume = () => {
        setIsPaused(false);
        announce('Leitura retomada', 'polite');
      };

      utterance.onboundary = (event) => {
        if (event.name === 'word' || event.name === 'sentence') {
          setCurrentPosition(event.charIndex || 0);
        }
      };

      return utterance;
    },
    [
      text,
      isSupported,
      selectedVoice,
      speechRate,
      speechPitch,
      speechVolume,
      announce,
    ]
  );

  const startReading = useCallback(() => {
    if (!isSupported || !text.trim() || !selectedVoice) {
      setError('Texto ou voz não disponível para leitura');
      return;
    }

    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (!cleanText) {
      setError('Texto vazio para leitura');
      return;
    }

    const utterance = createUtterance({ voice: selectedVoice });
    if (!utterance) return;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
  }, [isSupported, text, selectedVoice, createUtterance]);

  const pauseReading = useCallback(() => {
    if (!isReading || isPaused) return;
    speechSynthesis.pause();
    setIsPaused(true);
  }, [isReading, isPaused]);

  const resumeReading = useCallback(() => {
    if (!isReading || !isPaused) return;
    speechSynthesis.resume();
    setIsPaused(false);
  }, [isReading, isPaused]);

  const stopReading = useCallback(() => {
    speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    setCurrentPosition(0);
    announce('Leitura interrompida', 'polite');
  }, [announce]);

  const handleVoiceChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const voiceName = e.target.value;
    const voice = voices.find((v) => v.name === voiceName) || null;
    setSelectedVoice(voice);
  };

  const handleRateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSpeechRate(parseFloat(e.target.value));
  };

  const handlePitchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSpeechPitch(parseFloat(e.target.value));
  };

  const handleVolumeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSpeechVolume(parseFloat(e.target.value));
  };

  useEffect(() => {
    if (autoStart && text && isSupported && selectedVoice && preferences.announcements) {
      const timer = setTimeout(() => {
        startReading();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoStart, text, isSupported, selectedVoice, preferences.announcements]);

  const getReadingProgress = () => {
    if (!textRef.current || currentPosition === 0) return 0;
    return Math.min(Math.round((currentPosition / textRef.current.length) * 100), 100);
  };

  if (!preferences.announcements) return null;

  return (
    <div
      className={`speech-reader ${className}`}
      role="region"
      aria-label="Leitor de texto"
    >
      {error && (
        <div
          className="speech-reader__error"
          role="alert"
          aria-live="assertive"
        >
          ❌ {error}
          <button
            onClick={() => setError(null)}
            aria-label="Fechar mensagem de erro"
            className="error-close"
          >
            ×
          </button>
        </div>
      )}

      <div
        className="speech-reader__controls"
        role="toolbar"
        aria-label="Controles de leitura"
      >
        <Button
          variant="primary"
          size="small"
          onClick={isReading ? pauseReading : startReading}
          disabled={!text.trim() || !selectedVoice}
          ariaLabel={
            isReading && !isPaused
              ? 'Pausar leitura'
              : 'Iniciar leitura do texto'
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            {!isReading || isPaused ? (
              <path
                d="M8 5V19L19 12L8 5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z"
                fill="currentColor"
              />
            )}
          </svg>
          {isReading && !isPaused ? 'Pausar' : 'Ler Texto'}
        </Button>

        {isReading && !isPaused && (
          <Button
            variant="secondary"
            size="small"
            onClick={pauseReading}
            ariaLabel="Pausar leitura"
          >
            ⏸️ Pausar
          </Button>
        )}

        {isPaused && (
          <Button
            variant="primary"
            size="small"
            onClick={resumeReading}
            ariaLabel="Retomar leitura"
          >
            ▶️ Continuar
          </Button>
        )}

        {isReading && (
          <Button
            variant="ghost"
            size="small"
            onClick={stopReading}
            ariaLabel="Parar leitura"
          >
            ◼ Parar
          </Button>
        )}
      </div>

      <details className="speech-reader__settings" open>
        <summary>Ajustes de Voz</summary>
        <div className="speech-reader__setting">
          <label htmlFor="speech-voice">Voz:</label>
          <select
            id="speech-voice"
            value={selectedVoice?.name || ''}
            onChange={handleVoiceChange}
            aria-describedby="speech-voice-desc"
            disabled={!voices.length}
          >
            {voices.length === 0 ? (
              <option value="">Carregando vozes...</option>
            ) : (
              voices.map((voice, index) => (
                <option key={index} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))
            )}
          </select>
          <small id="speech-voice-desc">
            Selecione a voz para síntese
          </small>
        </div>

        <div className="speech-reader__setting">
          <label htmlFor="speech-rate">
            Velocidade: {speechRate.toFixed(1)}x
          </label>
          <input
            id="speech-rate"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speechRate}
            onChange={handleRateChange}
            aria-describedby="speech-rate-desc"
          />
          <small id="speech-rate-desc">
            0.5x (lento) até 2x (rápido)
          </small>
        </div>

        <div className="speech-reader__setting">
          <label htmlFor="speech-pitch">
            Tom: {speechPitch.toFixed(1)}
          </label>
          <input
            id="speech-pitch"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speechPitch}
            onChange={handlePitchChange}
            aria-describedby="speech-pitch-desc"
          />
          <small id="speech-pitch-desc">
            0.5 (grave) até 2 (agudo)
          </small>
        </div>

        <div className="speech-reader__setting">
          <label htmlFor="speech-volume">
            Volume: {Math.round(speechVolume * 100)}%
          </label>
          <input
            id="speech-volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={speechVolume}
            onChange={handleVolumeChange}
            aria-describedby="speech-volume-desc"
          />
          <small id="speech-volume-desc">
            0% (mudo) até 100% (máximo)
          </small>
        </div>
      </details>

      {highlightText && isReading && (
        <div
          className="speech-reader__status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>Lendo: "{text.substring(currentPosition - 30, currentPosition + 30)}"</span>
          <div className="speech-reader__progress">
            <div
              className="speech-reader__progress-bar"
              style={{ width: `${getReadingProgress()}%` }}
              role="progressbar"
              aria-valuenow={getReadingProgress()}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progresso da leitura: ${getReadingProgress()}%`}
            />
            <span>{getReadingProgress()}%</span>
          </div>
        </div>
      )}

      {!isReading && (
        <div className="speech-reader__preview">
          <strong>Texto para leitura:</strong>
          <p>{text.substring(0, 200)}{text.length > 200 ? '...' : ''}</p>
          <small>{text.length} caracteres</small>
        </div>
      )}
    </div>
  );
};

export default SpeechReader;