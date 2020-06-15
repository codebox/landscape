function buildView(scale) {
    "use strict";
    const elCanvas = document.getElementById('canvas');
    let canvas;

    function buildRangeShifter(minIn, maxIn, minOut, maxOut) {
        return v => {
            console.assert(v>= minIn && v<= maxIn, v);
            return minOut + (maxOut - minOut) * (v - minIn) / (maxIn - minIn);
        };
    }

    const getElevationColour = (() => {
        const SEA_LEVEL = 0,
            getSeaLightness = buildRangeShifter(-1, 0, 0, 50),
            getGroundLightness = buildRangeShifter(0, 1, 20, 80);

        return (elevation) => {
            console.assert(elevation >= -1 && elevation <= 1);
            if (elevation < SEA_LEVEL) {
                return `hsl(220,100%,${getSeaLightness(elevation)}%)`;
            } else {
                return `hsl(115,100%,${getGroundLightness(elevation)}%)`;
            }
        };
    })();

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