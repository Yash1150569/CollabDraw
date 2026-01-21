# CollabDraw Architecture Document (v2)

This document outlines the architecture for the **CollabDraw** real-time collaborative drawing application, refactored to a dedicated client-server model.

## 1. Project Overview

CollabDraw is a multi-user drawing application where participants can draw simultaneously on a shared, synchronized canvas. The architecture is designed to be simple, robust, and authoritative, ensuring a consistent experience for all users.

## 2. Tech Stack

-   **Backend**: Node.js with Express.
-   **Real-time Layer**: Socket.io for WebSocket communication.
-   **Frontend**: Vanilla HTML, CSS, and JavaScript. No frameworks.
-   **Client-Server Communication**: The Express server serves the static client files and establishes a Socket.io connection.

## 3. Backend Architecture (`server/`)

The backend is authoritative, meaning it holds the canonical state of the application and validates all actions.

-   **`server.js`**: The main entry point. It sets up an Express server to serve the `client/` directory and initializes Socket.io. It handles all WebSocket events, delegating state management to the appropriate `Room` instance.
-   **`rooms.js`**: Manages drawing sessions (rooms). It contains a `Room` class that encapsulates the state and logic for a single canvas, including user management and drawing history.
-   **`drawing-state.js`**: The core of the state logic. The `DrawingState` class manages the `historyStack` and `redoStack` for all drawing operations. This is central to implementing global, conflict-safe undo/redo.

## 4. Frontend Architecture (`client/`)

The frontend is built with plain web technologies for simplicity and performance.

-   **`index.html`**: The single HTML file containing the page structure: a `<canvas>`, a toolbar for controls, and containers for user lists and cursors.
-   **`style.css`**: Provides all styling for the application.
-   **`main.js`**: The main application script. It initializes the UI, sets up event listeners for the toolbar, and establishes the WebSocket connection. It acts as the orchestrator for the client-side application.
-   **`websocket.js`**: A dedicated module to encapsulate all Socket.io communication logic, providing a clean API for sending and receiving events.
-   **`canvas.js`**: Manages all HTML Canvas API interactions, including drawing paths, handling pointer events, and redrawing the canvas based on the history received from the server.

## 5. Data Flow & Protocol

The system uses an event-driven, operational-transform-inspired model.

1.  A user's pointer event on the canvas is captured.
2.  The `canvas.js` script converts this into a `stroke` object.
3.  The `stroke` object is sent to the server via WebSocket (`"stroke"` event).
    -   **Protocol**: A stroke is a JSON object: `{ id, path: [{x, y}], tool, options: { color, width } }`
4.  The server receives the stroke, adds it to the room's authoritative history.
5.  The server broadcasts the stroke to all other clients in the room.
6.  Receiving clients append the stroke to their local history and draw it on their canvas.

## 6. Conflict Resolution & Synchronization

**Strategy: Operation-based, server-ordered model.**

-   The canvas state is simply a visual replay of the stroke history array.
-   The server is the single source of truth for the order of operations. Strokes are added to the history in the order they are received.
-   There is no "locking" of canvas regions. Strokes can overlap. The last one drawn (based on server order) appears on top.
-   This model is deterministic, simple to implement, and guarantees that all clients will eventually converge to the exact same state.

## 7. Global Undo/Redo

The server-authoritative model makes global undo/redo straightforward and robust.

1.  A client sends an `"undo"` event to the server.
2.  The server's `DrawingState` pops the last operation from its `historyStack` and pushes it onto the `redoStack`. This action is global, regardless of which user created the stroke.
3.  The server **broadcasts the entire, updated history** to all clients via a `"history-update"` event.
4.  Each client, upon receiving the new history, **clears its canvas completely and redraws the scene** from scratch by replaying the updated history array.
5.  This ensures perfect synchronization and consistency across all clients after an undo or redo operation.
