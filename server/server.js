const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { getRoom } = require("./rooms");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Serve static client files
app.use(express.static(path.join(__dirname, '../client')));

io.on("connection", socket => {
  let currentRoomId = null;
  const user = {
    id: socket.id,
    name: `User-${socket.id.substring(0, 4)}`,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  };

  socket.on("join-room", roomId => {
    currentRoomId = roomId;
    const room = getRoom(roomId);
    socket.join(roomId);
    room.addUser(user);

    socket.emit("init-state", { history: room.state.snapshot(), users: room.users() });
    io.to(roomId).emit("users-update", room.users());

    socket.on("stroke", stroke => {
      const completeStroke = { ...stroke, userId: user.id };
      room.addStroke(completeStroke);
      socket.to(roomId).emit("stroke", completeStroke);
    });

    socket.on("undo", () => {
      const { action, newHistory } = room.undo();
      if (action) {
        io.to(roomId).emit("history-update", newHistory);
      }
    });

    socket.on("redo", () => {
        const { action, newHistory } = room.redo();
        if (action) {
            io.to(roomId).emit("history-update", newHistory);
        }
    });

    socket.on("cursor", pos => {
      socket.to(roomId).emit("cursor", { id: user.id, name: user.name, color: user.color, pos });
    });

    socket.on("disconnect", () => {
      if (currentRoomId) {
        const room = getRoom(currentRoomId);
        room.removeUser(socket.id);
        io.to(currentRoomId).emit("user-left", socket.id);
        io.to(currentRoomId).emit("users-update", room.users());
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on :${PORT}`));
