function buildCanvas(elCanvas) {
    "use strict";
    const ctx = elCanvas.getContext('2d'),
        scale = config.renderScale,
        {width, height} = elCanvas.getBoundingClientRect();

    ctx.canvas.width = elCanvas.width = width;
    ctx.canvas.height = elCanvas.height = height;

    const canvas = {
        clear() {
            ctx.fillStyle = "white";
            canvas.drawRectangle(0, 0, width, height);
        },
        drawRectangle(x, y, w, h, colour) {
            ctx.fillStyle = colour;
            ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
        },
        drawLines(lines, colour='black') {
            ctx.beginPath();
            ctx.strokeStyle = colour;
            lines.forEach(l => {
                ctx.moveTo(l.x1 * scale, l.y1 * scale);
                ctx.lineTo(l.x2 * scale, l.y2 * scale);
            });
            ctx.stroke();
        },
        drawPath(path, colour='black') {
            ctx.beginPath();
            // ctx.strokeStyle = colour;
            // ctx.moveTo(path[0].x, path[0].y);
            path.forEach(p => {
                this.drawRectangle(p.x * scale, p.y * scale, scale, scale, colour);
            });
            ctx.stroke();
        }
    };
    canvas.clear();

    return canvas;
}