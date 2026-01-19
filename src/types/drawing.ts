export type Point = {
  x: number;
  y: number;
};

export type DrawOptions = {
  color: string;
  strokeWidth: number;
};

export type Path = {
  points: Point[];
  options: DrawOptions;
  tool: 'brush' | 'eraser';
};

export type User = {
  id: string;
  name: string;
  color: string;
};
