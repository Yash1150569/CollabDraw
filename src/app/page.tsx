"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User, DrawOptions, Path, Point } from '@/types/drawing';
import DrawingCanvas from '@/components/drawing-canvas';
import Toolbar from '@/components/toolbar';
import UserList from '@/components/user-list';
import UserCursors from '@/components/user-cursors';
import { DEFAULT_COLOR, DEFAULT_STROKE_WIDTH } from '@/lib/constants';

// Mock data and simulation
const MOCK_USERS: User[] = [
  { id: '1', name: 'You', color: '#29ABE2' },
  { id: '2', name: 'Alex', color: '#F26C6D' },
  { id: '3', name: 'Maria', color: '#77C9A4' },
];

const MOCK_OTHER_CURSORS: Record<string, Point> = {
  '2': { x: 0, y: 0 },
  '3': { x: 0, y: 0 },
};

export default function Home() {
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [drawOptions, setDrawOptions] = useState<DrawOptions>({
    color: DEFAULT_COLOR,
    strokeWidth: DEFAULT_STROKE_WIDTH,
  });
  
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [drawingHistory, setDrawingHistory] = useState<Path[]>([]);
  const [redoStack, setRedoStack] = useState<Path[]>([]);

  // State for simulating other users' actions
  const [otherUserCursors, setOtherUserCursors] = useState<Record<string, Point>>(MOCK_OTHER_CURSORS);
  const [externalPath, setExternalPath] = useState<Path | null>(null);

  const currentUser = useMemo(() => users.find(u => u.id === '1'), [users]);

  // Simulate cursor movement from other users
  useEffect(() => {
    const interval = setInterval(() => {
      setOtherUserCursors(prev => {
        const newCursors: Record<string, Point> = {};
        Object.keys(prev).forEach(id => {
          newCursors[id] = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          };
        });
        return newCursors;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleNewPath = useCallback((path: Path) => {
    // In a real app, this would be emitted via WebSockets
    console.log('New path drawn, would emit to server:', path);
    setDrawingHistory(prev => [...prev, path]);
    setRedoStack([]); // Clear redo stack on new action
  }, []);

  const handleUndo = () => {
    // In a real app, this would send an 'undo' event to the server
    if (drawingHistory.length === 0) return;
    const lastPath = drawingHistory[drawingHistory.length - 1];
    setDrawingHistory(drawingHistory.slice(0, -1));
    setRedoStack(prev => [...prev, lastPath]);
    console.log('Undo action, would emit to server');
  };

  const handleRedo = () => {
    // In a real app, this would send a 'redo' event to the server
    if (redoStack.length === 0) return;
    const lastRedoPath = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setDrawingHistory(prev => [...prev, lastRedoPath]);
    console.log('Redo action, would emit to server');
  };

  const handleColorChange = (color: string) => {
    setTool('brush');
    setDrawOptions(prev => ({ ...prev, color }));
  };

  const handleStrokeWidthChange = (strokeWidth: number) => {
    setDrawOptions(prev => ({ ...prev, strokeWidth }));
  };

  const effectiveDrawOptions = useMemo(() => ({
    ...drawOptions,
    color: tool === 'eraser' ? '#F0F0F0' : drawOptions.color, // Eraser uses background color
  }), [tool, drawOptions]);

  // TODO: Implement WebSocket connection in a useEffect hook here
  // It would manage users, receive drawing data, and update states.

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background font-body">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <Toolbar
          tool={tool}
          setTool={setTool}
          color={drawOptions.color}
          onColorChange={handleColorChange}
          strokeWidth={drawOptions.strokeWidth}
          onStrokeWidthChange={handleStrokeWidthChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={drawingHistory.length > 0}
          canRedo={redoStack.length > 0}
        />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <UserList users={users} />
      </div>

      <DrawingCanvas
        drawOptions={effectiveDrawOptions}
        onNewPath={handleNewPath}
        history={drawingHistory}
        externalPath={externalPath}
      />
      
      <UserCursors 
        cursors={otherUserCursors} 
        users={users} 
        currentUserId={currentUser?.id || ''}
      />

      <div className="absolute bottom-4 left-4 z-10 bg-card p-2 rounded-lg shadow-md text-xs text-muted-foreground">
        <p>User: {currentUser?.name}</p>
        <p>Tool: {tool}</p>
        <p>Color: {drawOptions.color}</p>
        <p>Stroke: {drawOptions.strokeWidth}</p>
      </div>
    </main>
  );
}
