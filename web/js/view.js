function buildView(scale, _seaLevel) {
    "use strict";
    const elCanvas = document.getElementById('canvas'),
        elErodeButton = document.getElementById('erode'),
        elContourButton = document.getElementById('contour'),
        elWaveButton = document.getElementById('wave'),
        elSmoothButton = document.getElementById('smooth'),
        elSeed = document.getElementById('seed'),
        seaLevel = _seaLevel;


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
        const getSeaLightness = buildRangeShifter(-1, seaLevel, 0, 50),
            getGroundLightness = buildRangeShifter(seaLevel, 1, 20, 100),
            round = buildValueRounder(0.05);

        return (elevation, alpha=1) => {
            //console.assert(elevation >= -1 && elevation <= 1);
            elevation = round(elevation);
            if (elevation < seaLevel) {
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
        onWaveClick(handler) {
            elWaveButton.onclick = handler;
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
                canvas.drawRectangle(p.x * scale, p.y * scale, scale, scale, i ?'blue':'white')
            });
        },
        renderContours(contours) {
           canvas.drawLines(contours);
        },
        renderWaves(waveLines) {
            const getColour = buildRangeShifter(0, waveLines.length-1, 70, 50);
            waveLines.forEach((waveLine, i) => {
                canvas.drawPath(waveLine, `hsl(220, 100%, ${getColour(i)}%)`);
            });
        }
    };

    return view;
}