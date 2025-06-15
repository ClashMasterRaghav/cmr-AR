import React, { ReactNode, useState, useRef, useEffect } from 'react';

interface AppWindowProps {
  id: string;
  title: string;
  children: ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

const AppWindow: React.FC<AppWindowProps> = ({ 
  id, 
  title, 
  children, 
  onClose,
  onMinimize,
  onMaximize,
  initialPosition,
  initialSize = { width: 600, height: 400 }
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState(() => {
    if (initialPosition) return initialPosition;
    
    // Calculate center position of the screen
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    return { 
      x: Math.max(0, (vw - initialSize.width) / 2),
      y: Math.max(0, (vh - initialSize.height) / 3)
    };
  });
  const [size, setSize] = useState(initialSize);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [initialSizeState, setInitialSizeState] = useState({ width: 0, height: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeSize, setPreMaximizeSize] = useState(initialSize);
  const [preMaximizePosition, setPreMaximizePosition] = useState(() => {
    if (initialPosition) return initialPosition;
    
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    return { 
      x: Math.max(0, (vw - initialSize.width) / 2),
      y: Math.max(0, (vh - initialSize.height) / 3)
    };
  });
  const [isAnimatingMinimize, setIsAnimatingMinimize] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  // Handle mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
    e.stopPropagation();
  };

  // Handle mouse down to start resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    
    if (windowRef.current) {
      setResizeStart({
        x: e.clientX,
        y: e.clientY
      });
      setInitialSizeState({
        width: size.width,
        height: size.height
      });
      setIsResizing(true);
    }
    e.stopPropagation();
    e.preventDefault();
  };

  // Handle mouse move during dragging or resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    } else if (isResizing) {
      const deltaWidth = e.clientX - resizeStart.x;
      const deltaHeight = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(300, initialSizeState.width + deltaWidth);
      const newHeight = Math.max(200, initialSizeState.height + deltaHeight);
      
      setSize({
        width: newWidth,
        height: newHeight
      });
    }
  };

  // Handle mouse up to stop dragging or resizing
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Handle minimize window
  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAnimatingMinimize) {
      setIsAnimatingMinimize(true);
      setTimeout(() => {
        onMinimize?.();
        setIsAnimatingMinimize(false);
      }, 500);
    } else {
      onMinimize?.();
    }
  };

  // Handle maximize window
  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isMaximized) {
      setPreMaximizeSize({ width: size.width, height: size.height });
      setPreMaximizePosition({ x: position.x, y: position.y });
      
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      
      setSize({ width: vw - 10, height: vh - 50 });
      setPosition({ x: 5, y: 5 });
    } else {
      setSize(preMaximizeSize);
      setPosition(preMaximizePosition);
    }
    
    setIsMaximized(!isMaximized);
    onMaximize?.();
  };

  // Double click on header to maximize/restore
  const handleHeaderDoubleClick = () => {
    handleMaximize({ stopPropagation: () => {} } as React.MouseEvent);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, initialSizeState]);

  // Calculate taskbar position for minimize animation
  const getTaskbarTarget = () => {
    const taskbarApp = document.querySelector(`.taskbar-app[data-id="${id}"]`);
    if (taskbarApp) {
      const rect = taskbarApp.getBoundingClientRect();
      return { x: rect.left, y: rect.bottom };
    }
    return { x: window.innerWidth / 2, y: window.innerHeight };
  };

  // Don't render if minimizing (and not animating)
  if (isAnimatingMinimize) {
    const taskbarTarget = getTaskbarTarget();
    return (
      <div 
        ref={windowRef}
        className="app-window app-window-minimizing"
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          transform: `translate(${taskbarTarget.x - position.x}px, ${taskbarTarget.y - position.y}px) scale(0.05)`,
          zIndex: 500,
          opacity: 0,
          transition: 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out, box-shadow 0.5s ease-in-out',
        }}
      />
    );
  }

  return (
    <div 
      ref={windowRef}
      className={`app-window ${isMaximized ? 'app-window-maximized' : ''}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: isDragging ? 'scale(1.01)' : 'scale(1)',
        zIndex: 1000,
        transition: isDragging || isResizing 
          ? 'none' 
          : 'transform 0.2s ease, box-shadow 0.3s ease',
      }}
    >
      <div 
        className="app-window-header"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleHeaderDoubleClick}
      >
        <h3 className="app-window-title">{title}</h3>
        <div className="app-window-controls">
          <button className="app-window-minimize" onClick={handleMinimize}>
            –
          </button>
          <button className="app-window-maximize" onClick={handleMaximize}>
            {isMaximized ? '❐' : '◻'}
          </button>
          <button className="app-window-close" onClick={onClose}>
            × 
          </button>
        </div>
      </div>
      <div className="app-window-content" style={{ height: 'calc(100% - 30px)', overflow: 'hidden' }}>
        {children}
      </div>
      {!isMaximized && (
        <div 
          className="resize-handle"
          onMouseDown={handleResizeMouseDown}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 9L9 1M5 9L9 5M9 9L9 9" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AppWindow; 