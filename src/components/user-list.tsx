"use client";

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { User } from '@/types/drawing';

type UserListProps = {
  users: User[];
};

export default function UserList({ users }: UserListProps) {
  return (
    <Card className="shadow-lg w-48">
      <CardHeader className="p-4">
        <CardTitle className="text-base">Online Users</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <TooltipProvider>
          <div className="flex -space-x-2">
            {users.map(user => (
              <Tooltip key={user.id}>
                <TooltipTrigger asChild>
                  <Avatar className="border-2 border-background">
                    <AvatarFallback style={{ backgroundColor: user.color, color: 'white' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
