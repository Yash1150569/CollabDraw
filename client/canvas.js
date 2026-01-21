window.CollabDraw = window.CollabDraw || {};

(function (app) {
 
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');

    let isDrawing = false;
    let currentPath = [];
    let currentTool = 'brush';
    let currentColor = '#000000';
    let currentStrokeWidth = 5;

    function initializeCanvas() {
        resizeCanvas();

        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointerleave', handlePointerUp);

        window.addEventListener('resize', () => {
            const history = app.main.getHistory();
            resizeCanvas();
            redrawAll(history);
        });
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function setTool(tool) {
        currentTool = tool;
    }

    function setColor(color) {
        currentColor = color;
    }

    function setStrokeWidth(width) {
        currentStrokeWidth = width;
    }

    function handlePointerDown(e) {
        isDrawing = true;

        const point = { x: e.offsetX, y: e.offsetY };
        currentPath = [point];

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        applyPathOptions({
            tool: currentTool,
            options: { color: currentColor, strokeWidth: currentStrokeWidth }
        });
    }

    function handlePointerMove(e) {
        // send cursor position
        app.websocket.sendCursor({ x: e.clientX, y: e.clientY });

        if (!isDrawing) return;

        const point = { x: e.offsetX, y: e.offsetY };
        currentPath.push(point);

        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }

    function handlePointerUp() {
        if (!isDrawing) return;
        isDrawing = false;

        if (currentPath.length > 1) {
            const stroke = {
                id: crypto.randomUUID(),
                path: currentPath,
                tool: currentTool,
                options: {
                    color: currentColor,
                    strokeWidth: currentStrokeWidth
                }
            };

            // ✅ LOCAL DRAW + HISTORY UPDATE
            app.main.addLocalStroke(stroke);
            drawStroke(stroke);

            // ✅ SEND TO SERVER
            app.websocket.sendStroke(stroke);
        }

        currentPath = [];
    }

    function applyPathOptions(stroke) {
        if (stroke.tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = stroke.options.color;
        }

        ctx.lineWidth = stroke.options.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    function drawStroke(stroke) {
        if (!stroke.path || stroke.path.length < 2) return;

        ctx.save();
        ctx.beginPath();
        applyPathOptions(stroke);

        ctx.moveTo(stroke.path[0].x, stroke.path[0].y);
        for (let i = 1; i < stroke.path.length; i++) {
            ctx.lineTo(stroke.path[i].x, stroke.path[i].y);
        }

        ctx.stroke();
        ctx.restore();
    }

    function redrawAll(history) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (history && history.length) {
            history.forEach(drawStroke);
        }
    }

    app.canvas = {
        initializeCanvas,
        setTool,
        setColor,
        setStrokeWidth,
        redrawAll,
        drawStroke
    };

})(window.CollabDraw);

