"use client";

import { Paintbrush, Eraser, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ColorPicker from './color-picker';

type ToolbarProps = {
  tool: 'brush' | 'eraser';
  setTool: (tool: 'brush' | 'eraser') => void;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export default function Toolbar({
  tool,
  setTool,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <TooltipProvider>
      <Card className="shadow-lg">
        <CardContent className="p-2 flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === 'brush' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setTool('brush')}
                aria-label="Select brush"
              >
                <Paintbrush className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Brush</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === 'eraser' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setTool('eraser')}
                aria-label="Select eraser"
              >
                <Eraser className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eraser</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-8 mx-2" />

          <ColorPicker selectedColor={color} onColorChange={onColorChange} />
          
          <Separator orientation="vertical" className="h-8 mx-2" />

          <div className="flex items-center gap-2 w-32">
            <Slider
              min={1}
              max={50}
              step={1}
              value={[strokeWidth]}
              onValueChange={(value) => onStrokeWidthChange(value[0])}
              aria-label="Stroke width"
            />
            <span className="text-sm font-medium w-6 text-center">{strokeWidth}</span>
          </div>

          <Separator orientation="vertical" className="h-8 mx-2" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
                <Undo className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} aria-label="Redo">
                <Redo className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>

        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
