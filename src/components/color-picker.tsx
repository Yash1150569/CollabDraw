"use client";

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PRESET_COLORS } from '@/lib/constants';

type ColorPickerProps = {
  selectedColor: string;
  onColorChange: (color: string) => void;
};

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {PRESET_COLORS.map(color => (
          <Tooltip key={color} delayDuration={100}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onColorChange(color)}
                className={cn(
                  'h-6 w-6 rounded-full border-2 transition-transform duration-150 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  selectedColor === color ? 'border-primary' : 'border-transparent'
                )}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              >
                {selectedColor === color && (
                  <Check className="h-4 w-4 text-white mix-blend-difference" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{color}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
