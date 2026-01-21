class DrawingState {
  constructor() {
    this.history = [];
    this.redoStack = [];
  }

  add(stroke) {
    this.history.push(stroke);
    this.redoStack = [];
  }

  undo() {
    if (!this.history.length) return null;
    const action = this.history.pop();
    this.redoStack.push(action);
    return action;
  }

  redo() {
    if (!this.redoStack.length) return null;
    const action = this.redoStack.pop();
    this.history.push(action);
    return action;
  }

  snapshot() {
    return this.history;
  }
}

module.exports = { DrawingState };
