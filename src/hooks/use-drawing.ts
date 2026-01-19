"use client";

import { useState, useCallback, type RefObject } from 'react';
import type { DrawOptions, Path, Point } from '@/types/drawing';

export function useDrawing(
  canvasRef: RefObject<HTMLCanvasElement>,
  options: DrawOptions,
  onNewPath: (path: Path) => void
) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  const getCanvasContext = useCallback(() => {
    return canvasRef.current?.getContext('2d');
  }, [canvasRef]);

  const getMousePosition = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (point: Point) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.strokeStyle = options.color;
    ctx.lineWidth = options.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    setCurrentPath([point]);
    setIsDrawing(true);
  };

  const draw = (point: Point) => {
    const ctx = getCanvasContext();
    if (!ctx || !isDrawing) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    setCurrentPath(prev => [...prev, point]);
  };

  const finishDrawing = () => {
    if (currentPath.length > 1) {
      onNewPath({ points: currentPath, options });
    }
    setCurrentPath([]);
    setIsDrawing(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startDrawing(getMousePosition(e));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing) {
      draw(getMousePosition(e));
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      finishDrawing();
    }
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      finishDrawing();
    }
  };
  
  const drawPath = useCallback((ctx: CanvasRenderingContext2D, path: Path) => {
    if (path.points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);
    
    ctx.strokeStyle = path.options.color;
    ctx.lineWidth = path.options.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    ctx.stroke();
  }, []);

  const redrawCanvas = useCallback((history: Path[]) => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history.forEach(path => drawPath(ctx, path));
  }, [canvasRef, getCanvasContext, drawPath]);

  const drawExternalPath = useCallback((path: Path) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    drawPath(ctx, path);
  }, [getCanvasContext, drawPath]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    redrawCanvas,
    drawExternalPath,
  };
}
