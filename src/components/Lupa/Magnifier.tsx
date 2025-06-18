import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Settings, X } from 'lucide-react';

const MagnifierComponent = () => {
  const [isActive, setIsActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [magnifierSize, setMagnifierSize] = useState(200);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [followMouse, setFollowMouse] = useState(false);
  const [magnifierShape, setMagnifierShape] = useState('circle'); // circle or square
  
  const magnifierRef = useRef(null);
  const contentRef = useRef(null);

  // Simulated content for demonstration
  const sampleContent = {
    text: "Este é um exemplo de texto que pode ser ampliado usando a lupa. O componente permite diferentes níveis de zoom e configurações personalizáveis para melhor acessibilidade.",
    buttons: ["Botão 1", "Botão 2", "Botão 3"],
    images: ["🖼️", "📷", "🎨"]
  };

  // Handle mouse movement for magnifier following
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (followMouse && isActive) {
        setPosition({
          x: e.clientX - magnifierSize / 2,
          y: e.clientY - magnifierSize / 2
        });
      }
    };

    if (followMouse) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [followMouse, isActive, magnifierSize]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!followMouse) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !followMouse) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const increaseZoom = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
  };

  const decreaseZoom = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const increaseMagnifierSize = () => {
    setMagnifierSize(prev => Math.min(prev + 20, 400));
  };

  const decreaseMagnifierSize = () => {
    setMagnifierSize(prev => Math.max(prev - 20, 100));
  };

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden">
      {/* Main Content Area */}
      <div ref={contentRef} className="p-8 space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Software de Acessibilidade - Demonstração da Lupa
          </h1>
          
          <div className="space-y-4">
            <p className="text-lg text-gray-700 leading-relaxed">
              {sampleContent.text}
            </p>
            
            <div className="flex gap-4">
              {sampleContent.buttons.map((btn, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {btn}
                </button>
              ))}
            </div>
            
            <div className="flex gap-4 text-4xl">
              {sampleContent.images.map((img, index) => (
                <div key={index} className="p-4 bg-gray-200 rounded">
                  {img}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-yellow-100 rounded">
                <strong>Pequeno:</strong> Texto em tamanho pequeno para testar a lupa
              </div>
              <div className="p-3 bg-green-100 rounded">
                <strong>Médio:</strong> Texto em tamanho médio para demonstração
              </div>
              <div className="p-3 bg-purple-100 rounded">
                <strong>Detalhes:</strong> Elementos pequenos que podem precisar de ampliação
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-3 z-50">
        <h3 className="font-semibold text-gray-800">Controles da Lupa</h3>
        
        <button
          onClick={() => setIsActive(!isActive)}
          className={`w-full px-4 py-2 rounded font-medium transition-colors ${
            isActive 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isActive ? 'Desativar Lupa' : 'Ativar Lupa'}
        </button>

        {isActive && (
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Zoom: {zoomLevel}x</span>
              <div className="flex gap-1">
                <button
                  onClick={decreaseZoom}
                  className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  title="Diminuir zoom"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={increaseZoom}
                  className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  title="Aumentar zoom"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Tamanho: {magnifierSize}px</span>
              <div className="flex gap-1">
                <button
                  onClick={decreaseMagnifierSize}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                >
                  -
                </button>
                <button
                  onClick={increaseMagnifierSize}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              Configurações
            </button>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-4 left-4 bg-white rounded-lg shadow-lg p-4 space-y-3 z-50 w-64">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Configurações</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={followMouse}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFollowMouse(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Seguir o mouse</span>
            </label>
            
            <div>
              <label className="block text-sm font-medium mb-1">Formato:</label>
              <select
                value={magnifierShape}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMagnifierShape(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="circle">Circular</option>
                <option value="square">Quadrado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Zoom: {zoomLevel}x
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={zoomLevel}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setZoomLevel(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Tamanho: {magnifierSize}px
              </label>
              <input
                type="range"
                min="100"
                max="400"
                step="20"
                value={magnifierSize}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMagnifierSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Magnifier */}
      {isActive && (
        <div
          ref={magnifierRef}
          className={`fixed pointer-events-none z-40 border-4 border-blue-500 shadow-lg ${
            magnifierShape === 'circle' ? 'rounded-full' : 'rounded-lg'
          }`}
          style={{
            left: position.x,
            top: position.y,
            width: magnifierSize,
            height: magnifierSize,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center',
            background: 'white',
            overflow: 'hidden'
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${1/zoomLevel}) translate(${-position.x * zoomLevel}px, ${-position.y * zoomLevel}px)`,
              transformOrigin: 'top left',
              width: `${window.innerWidth * zoomLevel}px`,
              height: `${window.innerHeight * zoomLevel}px`
            }}
          >
            <div className="w-full h-screen bg-gray-100 p-8 space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Software de Acessibilidade - Demonstração da Lupa
                </h1>
                
                <div className="space-y-4">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {sampleContent.text}
                  </p>
                  
                  <div className="flex gap-4">
                    {sampleContent.buttons.map((btn, index) => (
                      <button
                        key={index}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 text-4xl">
                    {sampleContent.images.map((img, index) => (
                      <div key={index} className="p-4 bg-gray-200 rounded">
                        {img}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-yellow-100 rounded">
                      <strong>Pequeno:</strong> Texto em tamanho pequeno para testar a lupa
                    </div>
                    <div className="p-3 bg-green-100 rounded">
                      <strong>Médio:</strong> Texto em tamanho médio para demonstração
                    </div>
                    <div className="p-3 bg-purple-100 rounded">
                      <strong>Detalhes:</strong> Elementos pequenos que podem precisar de ampliação
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag Handle for Magnifier */}
      {isActive && !followMouse && (
        <div
          className="fixed z-50 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-move shadow-lg hover:bg-blue-600 transition-colors"
          style={{
            left: position.x + magnifierSize - 16,
            top: position.y - 16
          }}
          onMouseDown={handleMouseDown}
          title="Arrastar lupa"
        >
          <Move size={16} className="text-white" />
        </div>
      )}

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm max-w-md">
        <h4 className="font-semibold mb-2">Como usar a Lupa:</h4>
        <ul className="space-y-1 text-xs">
          <li>• Clique em "Ativar Lupa" para iniciar</li>
          <li>• Use os controles para ajustar zoom e tamanho</li>
          <li>• Arraste pela alça azul ou ative "Seguir o mouse"</li>
          <li>• Configure formato e outras opções</li>
          <li>• Ideal para usuários com baixa visão</li>
        </ul>
      </div>
    </div>
  );
};

export default MagnifierComponent;