window.CollabDraw = window.CollabDraw || {};

(function(app) {
    let history = [];
    let users = [];
    
    const PRESET_COLORS = ['#000000', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#29ABE2', '#8E2DE2'];

    const brushBtn = document.getElementById('brush-tool');
    const eraserBtn = document.getElementById('eraser-tool');
    const colorPickerContainer = document.getElementById('color-picker');
    const strokeSlider = document.getElementById('stroke-width');
    const strokeLabel = document.getElementById('stroke-width-label');
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const userListContainer = document.getElementById('user-list');
    const cursorsContainer = document.getElementById('cursors-container');

    function initialize() {
        app.canvas.initializeCanvas();
        setupToolbar();
        setupKeyboardShortcuts();
        
        const roomId = window.location.hash.substring(1) || 'default-room';
        window.location.hash = roomId;
        
        app.websocket.connect(roomId, {
            init: handleInit,
            stroke: handleNewStroke,
            historyUpdate: handleHistoryUpdate,
            cursor: handleCursorUpdate,
            usersUpdate: handleUsersUpdate,
            userLeft: handleUserLeft
        });
    }

    function setupToolbar() {
        brushBtn.addEventListener('click', () => selectTool('brush'));
        eraserBtn.addEventListener('click', () => selectTool('eraser'));
        
        PRESET_COLORS.forEach(color => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'color-btn';
            colorBtn.style.backgroundColor = color;
            if (color === '#000000') colorBtn.classList.add('active');
            colorBtn.addEventListener('click', () => selectColor(color, colorBtn));
            colorPickerContainer.appendChild(colorBtn);
        });

        strokeSlider.addEventListener('input', e => {
            const width = e.target.value;
            strokeLabel.textContent = width;
            app.canvas.setStrokeWidth(width);
        });
        
        undoBtn.addEventListener('click', app.websocket.undo);
        redoBtn.addEventListener('click', app.websocket.redo);
    }

    function setupKeyboardShortcuts() {
        window.addEventListener('keydown', e => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    app.websocket.undo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    app.websocket.redo();
                }
            }
        });
    }

    function selectTool(tool) {
        app.canvas.setTool(tool);
        brushBtn.classList.toggle('active', tool === 'brush');
        eraserBtn.classList.toggle('active', tool === 'eraser');
    }

    function selectColor(color, btn) {
        app.canvas.setColor(color);
        selectTool('brush');
        document.querySelectorAll('.color-btn.active').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    
    function handleInit(serverHistory, serverUsers) {
        history = serverHistory;
        app.canvas.redrawAll(history);
        handleUsersUpdate(serverUsers);
    }
    
    function handleNewStroke(stroke) {
        history.push(stroke);
        app.canvas.drawStroke(stroke);
    }
    
    function handleHistoryUpdate(newHistory) {
        history = newHistory;
        app.canvas.redrawAll(history);
    }
    
    function handleUsersUpdate(serverUsers) {
        users = serverUsers;
        userListContainer.innerHTML = '';
        users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.className = 'user-avatar';
            userEl.textContent = user.name.charAt(0).toUpperCase();
            userEl.style.backgroundColor = user.color;
            userEl.title = user.name;
            userListContainer.appendChild(userEl);
        });
    }
    
    function handleCursorUpdate(cursorData) {
        let cursorEl = document.getElementById(`cursor-${cursorData.id}`);
        if (!cursorEl) {
            cursorEl = document.createElement('div');
            cursorEl.id = `cursor-${cursorData.id}`;
            cursorEl.className = 'cursor';
            const cursorIcon = document.createElement('span');
            cursorIcon.className = 'cursor-icon';
            cursorIcon.textContent = '👆';
            const cursorLabel = document.createElement('span');
            cursorLabel.className = 'cursor-label';
            cursorEl.appendChild(cursorIcon);
            cursorEl.appendChild(cursorLabel);
            cursorsContainer.appendChild(cursorEl);
        }
        
        cursorEl.style.transform = `translate(${cursorData.pos.x}px, ${cursorData.pos.y}px)`;
        cursorEl.querySelector('.cursor-icon').style.color = cursorData.color;
        const label = cursorEl.querySelector('.cursor-label');
        label.textContent = cursorData.name;
        label.style.backgroundColor = cursorData.color;
    }
    
    function handleUserLeft(userId) {
        const cursorEl = document.getElementById(`cursor-${userId}`);
        if (cursorEl) {
            cursorEl.remove();
        }
    }

    app.main = {
        getHistory: () => history,
        addLocalStroke: (stroke) => {
            history.push(stroke);
        }
    };

    initialize();

})(window.CollabDraw);
