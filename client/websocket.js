window.CollabDraw = window.CollabDraw || {};

(function(app) {
    const socket = io("http://localhost:3000");

    function connect(roomId, handlers) {
        socket.emit("join-room", roomId);

        socket.on("init-state", data => handlers.init(data.history, data.users));
        socket.on("stroke", handlers.stroke);
        socket.on("history-update", handlers.historyUpdate);
        socket.on("cursor", handlers.cursor);
        socket.on("users-update", handlers.usersUpdate);
        socket.on("user-left", handlers.userLeft);
    }

    function sendStroke(stroke) {
        socket.emit("stroke", stroke);
    }
    
    function sendCursor(position) {
        socket.emit("cursor", position);
    }

    function undo() {
        socket.emit("undo");
    }

    function redo() {
        socket.emit("redo");
    }
    
    app.websocket = { connect, sendStroke, sendCursor, undo, redo };

})(window.CollabDraw);

