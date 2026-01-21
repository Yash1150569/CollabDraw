const { DrawingState } = require("./drawing-state");

const rooms = new Map();

class Room {
    constructor(id) {
        this.id = id;
        this.state = new DrawingState();
        this._users = new Map();
    }

    addUser(user) {
        this._users.set(user.id, user);
    }

    removeUser(userId) {
        this._users.delete(userId);
    }

    users() {
        return Array.from(this._users.values());
    }

    addStroke(stroke) {
        this.state.add(stroke);
    }

    undo() {
        const action = this.state.undo();
        if (action) {
            return { action, newHistory: this.state.snapshot() };
        }
        return { action: null };
    }

    redo() {
        const action = this.state.redo();
        if (action) {
            return { action, newHistory: this.state.snapshot() };
        }
        return { action: null };
    }
}

function getRoom(id) {  
  if (!rooms.has(id)) {
    rooms.set(id, new Room(id));
  }
  return rooms.get(id);
}

module.exports = { getRoom };
