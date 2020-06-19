function buildCanvas(elCanvas, width, height) {
    "use strict";
    const ctx = elCanvas.getContext('2d');

    ctx.canvas.width = elCanvas.clientWidth;
    ctx.canvas.height = elCanvas.clientHeight;



    const canvas = {
        clear() {
            ctx.fillStyle = "white";
            canvas.drawRectangle(0, 0, elCanvas.width, elCanvas.height);
        },
        drawRectangle(x, y, w, h, colour) {
            ctx.fillStyle = colour;
            ctx.fillRect(x, y, w, h);
        },
        drawLines(lines, colour='black') {
            ctx.beginPath();
            ctx.strokeStyle = colour;
            lines.forEach(l => {
                ctx.moveTo(l.x1, l.y1);
                ctx.lineTo(l.x2, l.y2);
            });
            ctx.stroke();
        }
    };
    canvas.clear();

    return canvas;
}