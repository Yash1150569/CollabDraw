"use client";

import { MousePointer2 } from 'lucide-react';
import type { Point, User } from '@/types/drawing';

type UserCursorsProps = {
  cursors: Record<string, Point>;
  users: User[];
  currentUserId: string;
};

export default function UserCursors({ cursors, users, currentUserId }: UserCursorsProps) {
  return (
    <>
      {Object.entries(cursors).map(([userId, position]) => {
        if (userId === currentUserId) return null;
        const user = users.find(u => u.id === userId);
        if (!user) return null;

        return (
          <div
            key={userId}
            className="absolute top-0 left-0 transition-transform duration-100 ease-linear pointer-events-none"
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
          >
            <MousePointer2
              className="h-5 w-5 -translate-x-0.5 -translate-y-0.5"
              style={{ color: user.color }}
              strokeWidth={2}
            />
            <span
              className="ml-2 px-2 py-1 rounded-md text-sm text-white"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </span>
          </div>
        );
      })}
    </>
  );
}
