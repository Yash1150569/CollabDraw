"use client";

import { useRef, useEffect } from 'react';
import type { DrawOptions, Path } from '@/types/drawing';
import { useDrawing } from '@/hooks/use-drawing';

type DrawingCanvasProps = {
  drawOptions: DrawOptions;
  onNewPath: (path: Path) => void;
  history: Path[];
  externalPath: Path | null;
};

export default function DrawingCanvas({
  drawOptions,
  onNewPath,
  history,
  externalPath,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    redrawCanvas,
    drawExternalPath
  } = useDrawing(canvasRef, drawOptions, onNewPath);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Handle window resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawCanvas(history);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial size

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [redrawCanvas, history]);

  useEffect(() => {
    redrawCanvas(history);
  }, [history, redrawCanvas]);
  
  useEffect(() => {
    if (externalPath) {
      drawExternalPath(externalPath);
    }
  }, [externalPath, drawExternalPath]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className="absolute top-0 left-0 w-full h-full bg-transparent cursor-crosshair"
    />
  );
}
