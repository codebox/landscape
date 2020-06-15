function buildView(scale) {
    "use strict";
    const elCanvas = document.getElementById('canvas');
    let canvas;

    function getElevationColour(elevation) {
        console.assert(elevation >= -1 && elevation <= 1);
        return `rgba(0,0,0,${0.5 + elevation/2})`;
    }

    function drawElevationSquare(x, y, v) {
        canvas.drawRectangle(x * scale, y * scale, scale, scale, getElevationColour(v));
    }

    function renderElevation(grid) {
        grid.forEach((x,y,v) => {
            drawElevationSquare(x,y,v); 
        });
    }

    const view = {
        init() {

        },
        render(model) {
            canvas = buildCanvas(elCanvas, scale * model.gridWidth, scale * model.gridHeight);
            renderElevation(model.getElevationGrid());
        }
    };

    return view;
}