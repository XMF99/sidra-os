import { FC, ReactNode, useState, useRef, useCallback } from 'react';

interface Props {
  direction?: 'horizontal' | 'vertical';
  initialSize?: number;
  minSize?: number;
  maxSize?: number;
  onResize?: (newSize: number) => void;
  children: ReactNode;
}

export const ResizablePanel: FC<Props> = ({
  direction = 'horizontal',
  initialSize = 260,
  minSize = 180,
  maxSize = 480,
  onResize,
  children,
}) => {
  const [size, setSize] = useState<number>(initialSize);
  const isDragging = useRef<boolean>(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging.current) return;
      const newSize = direction === 'horizontal' ? event.clientX : event.clientY;
      if (newSize >= minSize && newSize <= maxSize) {
        setSize(newSize);
        onResize?.(newSize);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [direction, minSize, maxSize, onResize]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: direction === 'horizontal' ? `${size}px` : '100%', height: direction === 'vertical' ? `${size}px` : '100%', overflow: 'hidden' }}>
        {children}
      </div>
      <div
        role="separator"
        aria-label="Panel Resizer"
        onMouseDown={handleMouseDown}
        style={{
          width: direction === 'horizontal' ? '4px' : '100%',
          height: direction === 'vertical' ? '4px' : '100%',
          cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
          backgroundColor: 'var(--sd-color-border, rgba(255,255,255,0.1))',
          transition: 'background-color 0.2s ease',
          zIndex: 10,
        }}
      />
    </div>
  );
};
