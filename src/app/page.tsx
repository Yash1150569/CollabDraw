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
    setDrawingHistory(prev => [...prev, path]);
    setRedoStack([]); // Clear redo stack on new action
  }, []);

  const handleUndo = useCallback(() => {
    setDrawingHistory(prevHistory => {
        if (prevHistory.length === 0) {
            return prevHistory;
        }
        const newHistory = prevHistory.slice(0, -1);
        const lastPath = prevHistory[prevHistory.length - 1];
        setRedoStack(prevRedoStack => [...prevRedoStack, lastPath]);
        return newHistory;
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack(prevRedoStack => {
        if (prevRedoStack.length === 0) {
            return prevRedoStack;
        }
        const newRedoStack = prevRedoStack.slice(0, -1);
        const path_to_redo = prevRedoStack[prevRedoStack.length - 1];
        setDrawingHistory(prevHistory => [...prevHistory, path_to_redo]);
        return newRedoStack;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  const handleColorChange = (color: string) => {
    setTool('brush');
    setDrawOptions(prev => ({ ...prev, color }));
  };

  const handleStrokeWidthChange = (strokeWidth: number) => {
    setDrawOptions(prev => ({ ...prev, strokeWidth }));
  };

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
        drawOptions={drawOptions}
        onNewPath={handleNewPath}
        history={drawingHistory}
        tool={tool}
      />
      
      <UserCursors 
        cursors={otherUserCursors} 
        users={users} 
        currentUserId={currentUser?.id || ''}
      />
    </main>
  );
}
