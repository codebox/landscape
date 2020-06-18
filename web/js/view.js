function buildView(scale) {
    "use strict";
    const elCanvas = document.getElementById('canvas'),
        elErodeButton = document.getElementById('erode'),
        elContourButton = document.getElementById('contour'),
        elSmoothButton = document.getElementById('smooth'),
        elSeed = document.getElementById('seed');

    const SEA_LEVEL = -0.1;

    let canvas;

    function buildRangeShifter(minIn, maxIn, minOut, maxOut) {
        return v => {
            //console.assert(v>= minIn && v<= maxIn, v);
            return minOut + (maxOut - minOut) * (v - minIn) / (maxIn - minIn);
        };
    }

    function buildValueRounder(step) {
        return value => {
            return Math.floor(value / step) * step;
        };
    }

    const getElevationColour = (() => {
        const getSeaLightness = buildRangeShifter(-1, SEA_LEVEL, 0, 50),
            getGroundLightness = buildRangeShifter(SEA_LEVEL, 1, 20, 100),
            round = buildValueRounder(0.05);

        return (elevation, alpha=1) => {
            //console.assert(elevation >= -1 && elevation <= 1);
            elevation = round(elevation);
            if (elevation < SEA_LEVEL) {
                return `hsla(220,100%,${getSeaLightness(elevation)}%,${alpha})`;
            } else {
                return `hsla(115,100%,${getGroundLightness(elevation)}%,${alpha})`;
            }
        };
    })();

    function drawElevationSquare(x, y, v) {
        canvas.drawRectangle(x * scale, y * scale, scale, scale, getElevationColour(v));
    }

    function renderElevation(model) {
        model.getElevationGrid().forEach(drawElevationSquare);
    }

    const view = {
        init() {

        },
        onErodeClick(handler) {
            elErodeButton.onclick = handler;
        },
        onContourClick(handler) {
            elContourButton.onclick = handler;
        },
        onSmoothClick(handler) {
            elSmoothButton.onclick = handler;
        },
        getSeed() {
            return elSeed.value;
        },
        setSeed(seed) {
            elSeed.value = seed;
        },
        render(model) {
            canvas = buildCanvas(elCanvas, scale * model.gridWidth, scale * model.gridHeight);
            renderElevation(model);
        },
        renderPath(path) {
            path.forEach((p,i) => {
                canvas.drawRectangle(p.x * scale, p.y * scale, scale, scale, i ?'red':'white')
            });
        },
        renderContours(contours) {
           canvas.drawLines(contours);
        }
    };

    return view;
}