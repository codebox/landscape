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
        }
    };
    canvas.clear();

    return canvas;
}