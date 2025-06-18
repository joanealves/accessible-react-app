import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, EyeOff, Move, Settings, X } from 'lucide-react';

interface ReadingGuideProps {
  isActive: boolean;
  onToggle: () => void;
  color?: string;
  thickness?: number;
  opacity?: number;
}

const ReadingGuide: React.FC<ReadingGuideProps> = ({
  isActive,
  onToggle,
  color = '#007bff',
  thickness = 3,
  opacity = 0.8
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    color,
    thickness,
    opacity,
    followMouse: true,
    showVertical: false,
    showHorizontal: true
  });
  const guideRef = useRef<HTMLDivElement>(null);

  // Atualiza posição do mouse
  useEffect(() => {
    if (!isActive || !settings.followMouse) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isActive, settings.followMouse]);

  // Controles de teclado
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onToggle();
          break;
        case 'g':
        case 'G':
          if (e.ctrlKey) {
            e.preventDefault();
            setShowSettings(!showSettings);
          }
          break;
        case 'h':
        case 'H':
          if (e.ctrlKey) {
            e.preventDefault();
            setSettings(prev => ({ ...prev, showHorizontal: !prev.showHorizontal }));
          }
          break;
        case 'v':
        case 'V':
          if (e.ctrlKey) {
            e.preventDefault();
            setSettings(prev => ({ ...prev, showVertical: !prev.showVertical }));
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, showSettings, onToggle]);

  const handleColorChange = useCallback((newColor: string) => {
    setSettings(prev => ({ ...prev, color: newColor }));
  }, []);

  if (!isActive) return null;

  return (
    <>
      {/* Linha horizontal */}
      {settings.showHorizontal && (
        <div
          style={{
            position: 'fixed',
            top: `${mousePosition.y}px`,
            left: 0,
            right: 0,
            height: `${settings.thickness}px`,
            background: settings.color,
            opacity: settings.opacity,
            pointerEvents: 'none',
            zIndex: 9998,
            transition: settings.followMouse ? 'none' : 'top 0.2s ease'
          }}
        />
      )}

      {/* Linha vertical */}
      {settings.showVertical && (
        <div
          style={{
            position: 'fixed',
            left: `${mousePosition.x}px`,
            top: 0,
            bottom: 0,
            width: `${settings.thickness}px`,
            background: settings.color,
            opacity: settings.opacity,
            pointerEvents: 'none',
            zIndex: 9998,
            transition: settings.followMouse ? 'none' : 'left 0.2s ease'
          }}
        />
      )}

      {/* Botão de controle */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999
        }}
      >
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: settings.color,
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            marginBottom: '10px'
          }}
          aria-label="Configurações da guia de leitura"
          title="Configurações (Ctrl+G)"
        >
          <Settings size={20} />
        </button>

        <button
          onClick={onToggle}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: '#dc3545',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}
          aria-label="Fechar guia de leitura"
          title="Fechar (Esc)"
        >
          <X size={20} />
        </button>
      </div>

      {/* Painel de configurações */}
      {showSettings && (
        <div
          ref={guideRef}
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            background: 'white',
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            padding: '20px',
            width: '280px',
            zIndex: 9999
          }}
          role="dialog"
          aria-label="Configurações da guia de leitura"
        >
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#333' }}>
            Configurações da Guia
          </h3>

          {/* Cor */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              Cor:
            </label>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {['#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1', '#fd7e14', '#20c997'].map(colorOption => (
                <button
                  key={colorOption}
                  onClick={() => handleColorChange(colorOption)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: settings.color === colorOption ? '3px solid #333' : '2px solid #dee2e6',
                    background: colorOption,
                    cursor: 'pointer'
                  }}
                  aria-label={`Cor ${colorOption}`}
                />
              ))}
            </div>
          </div>

          {/* Espessura */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              Espessura: {settings.thickness}px
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.thickness}
              onChange={(e) => setSettings(prev => ({ ...prev, thickness: parseInt(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Opacidade */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
              Opacidade: {Math.round(settings.opacity * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={settings.opacity}
              onChange={(e) => setSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Opções de exibição */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={settings.showHorizontal}
                onChange={(e) => setSettings(prev => ({ ...prev, showHorizontal: e.target.checked }))}
                style={{ marginRight: '8px' }}
              />
              Linha Horizontal (Ctrl+H)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={settings.showVertical}
                onChange={(e) => setSettings(prev => ({ ...prev, showVertical: e.target.checked }))}
                style={{ marginRight: '8px' }}
              />
              Linha Vertical (Ctrl+V)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={settings.followMouse}
                onChange={(e) => setSettings(prev => ({ ...prev, followMouse: e.target.checked }))}
                style={{ marginRight: '8px' }}
              />
              Seguir o Mouse
            </label>
          </div>

          <div style={{ fontSize: '12px', color: '#666', borderTop: '1px solid #dee2e6', paddingTop: '10px' }}>
            <strong>Teclas de atalho:</strong><br />
            • Esc: Fechar guia<br />
            • Ctrl+G: Configurações<br />
            • Ctrl+H: Toggle horizontal<br />
            • Ctrl+V: Toggle vertical
          </div>
        </div>
      )}
    </>
  );
};

export default ReadingGuide;