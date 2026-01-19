# CollabDraw Architecture Document

This document outlines the architecture for the **CollabDraw** real-time collaborative drawing application, built with Next.js.

## 1. Project Overview

CollabDraw is a multi-user drawing application where participants can draw simultaneously on a shared canvas. The application is designed to be highly interactive, providing a seamless and real-time collaborative experience.

## 2. Tech Stack

-   **Frontend Framework**: Next.js 14 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS with shadcn/ui components for a modern, accessible, and professionally designed user interface.
-   **Icons**: `lucide-react` for clean and simple iconography.
-   **Real-time Layer**: `socket.io-client` for frontend communication with a proposed WebSocket backend.

## 3. Frontend Architecture

The frontend is structured using the Next.js App Router paradigm, prioritizing Server Components where possible, with Client Components used for interactive UI.

-   **`app/page.tsx`**: The main entry point of the application. It is a Client Component responsible for:
    -   Managing the overall application state (e.g., selected tool, color, stroke width, user list).
    -   Orchestrating the different UI components (`Toolbar`, `DrawingCanvas`, `UserList`).
    -   Initializing the WebSocket connection and handling real-time events.

-   **`components/`**: Contains reusable React components.
    -   `drawing-canvas.tsx`: Renders the HTML `<canvas>` element and handles user input for drawing. It uses the `useDrawing` hook to manage all canvas operations.
    -   `toolbar.tsx`: Provides the UI for selecting drawing tools (brush, eraser), colors, stroke width, and triggering undo/redo actions.
    -   `user-list.tsx`: Displays the list of currently active users in the session.
    -   `user-cursors.tsx`: Renders indicators for other users' cursor positions on the canvas.

-   **`hooks/`**: Contains custom React hooks for encapsulating complex logic.
    -   `use-drawing.ts`: The core of the drawing functionality. This hook abstracts away all direct HTML5 Canvas API interactions. It manages drawing paths, handling mouse events (`mousedown`, `mousemove`, `mouseup`), and redrawing the canvas based on a history of operations. This design keeps the canvas logic decoupled from the React components and the real-time layer.

## 4. Canvas & Drawing Logic

-   **Path Optimization**: Drawing operations are captured as a series of points (`{x, y}`). For smooth drawing, paths are rendered in real-time on `mousemove`. Only the completed path is "committed" to the history upon `mouseup`.
-   **Data Structure**: A single drawing operation (a path) is stored as an object containing an array of points and the drawing options used (color, stroke width). Example: `{ points: [...], options: { color: '#ff0000', strokeWidth: 5 } }`.
-   **Efficient Redrawing**: To handle undo/redo or to render state received from the server, the canvas is cleared and the entire history of drawing operations is re-played in order. This ensures perfect state consistency across all clients.

## 5. Backend & Real-time Synchronization (Proposed)

The current scaffold simulates real-time functionality on the client-side. For true multi-user collaboration, a dedicated backend is required.

-   **Recommended Technology**: A stateful Node.js server running **Socket.io**. Serverless environments (like Vercel's default API routes) are not suitable for maintaining persistent WebSocket connections. Alternatively, a third-party real-time service like Ably or Pusher could be used.

-   **Server Responsibilities**:
    1.  **Room Management**: Isolate drawing sessions by managing rooms. Users joining the same room can collaborate.
    2.  **Event Broadcasting**: Relay drawing events (`start-drawing`, `drawing`, `end-drawing`) from one client to all other clients in the same room.
    3.  **User Presence**: Track connected users and broadcast cursor position updates.
    4.  **Centralized State**: Maintain the canonical (authoritative) state of the canvas, including the full drawing history.

## 6. Global Undo/Redo (Proposed Architecture)

The global undo/redo feature is a complex requirement that necessitates a centralized state manager on the server.

1.  The Node.js server maintains two arrays for each room: `historyStack` and `redoStack`.
2.  When a user finishes drawing a path, the client sends the complete path object to the server. The server pushes this object onto the `historyStack` and clears the `redoStack`.
3.  A user client sends an `undo-request` event to the server.
4.  The server pops the last operation from `historyStack` and pushes it onto `redoStack`.
5.  The server then broadcasts a `canvas-state` event to **all clients** in the room. This event contains the entire updated `historyStack`.
6.  Upon receiving the `canvas-state` event, each client clears its local canvas and redraws the scene from scratch using the authoritative history provided by the server. This guarantees that all users see the exact same canvas state.
7.  A `redo-request` event works similarly, moving an operation from `redoStack` back to `historyStack` and broadcasting the new state.

This server-authoritative approach is crucial for preventing desynchronization and resolving conflicts in stateful operations like undo/redo.
