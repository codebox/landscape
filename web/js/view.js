function buildView(scale, _seaLevel, _snowLevel) {
    "use strict";
    const elCanvas = document.getElementById('canvas'),
        elErodeButton = document.getElementById('erode'),
        elRiversButton = document.getElementById('rivers'),
        elContourButton = document.getElementById('contour'),
        elWaveButton = document.getElementById('wave'),
        elSmoothButton = document.getElementById('smooth'),
        elSeed = document.getElementById('seed'),
        seaLevel = _seaLevel,
        snowLevel = _snowLevel;


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
            getGroundLightnessEl = buildRangeShifter(seaLevel, snowLevel, 30, 70),
            getGroundLightnessIl = buildRangeShifter(0, 1, 0.6, 1),
            getGroundSaturation = buildRangeShifter(seaLevel, snowLevel, 100, 0),
            round = buildValueRounder(0.05);

        return (elevation, illumination) => {
            //console.assert(elevation >= -1 && elevation <= 1);
            elevation = round(elevation);
            if (elevation < seaLevel) {
                return `hsl(220,100%,${getSeaLightness(elevation)}%)`;

            } else if (elevation > snowLevel) {
                return `hsl(0,0%,${getGroundLightnessIl(illumination) * 100}%)`;

            } else {
                return `hsl(115,${getGroundSaturation(elevation)}%,${getGroundLightnessEl(elevation) * getGroundLightnessIl(illumination)}%)`;
            }
        };
    })();

    function drawElevationSquare(model, x, y, v) {
        function magnitude(v) {
            return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        }
        const elevationFactor = buildRangeShifter(seaLevel, 1, 1, 10000)(v),
            // Diagonal 1
            a = {
                x: 1,
                y: 0,
                z: elevationFactor * (model.getElevationGrid().get(x+1, y) - v)
            },
            // Diagonal 2
            b = {
                x: 0,
                y: 1,
                z: elevationFactor * (model.getElevationGrid().get(x, y+1) - v)
            },
            light = {
                x: -1,
                y: -1,
                z: 0
            },
            normal = {
                x: a.y * b.z - a.z * b.y,
                y: a.z * b.x - a.x * b.z,
                z: a.x * b.y - a.y * b.x
            },
            cosIlluminationAngle =
                (light.x * normal.x + light.y * normal.y + light.z * normal.z) / (magnitude(light) * magnitude(normal)),
            illumination = Math.max(0, cosIlluminationAngle);
        canvas.drawRectangle(x * scale, y * scale, scale, scale, getElevationColour(v, illumination));
    }

    function renderElevation(model) {
        let min = 100, max=0;
        model.getElevationGrid().forEach((x,y,v) => drawElevationSquare(model, x, y, v));
    }

    const view = {
        init() {

        },
        onErodeClick(handler) {
            elErodeButton.onclick = handler;
        },
        onRiversClick(handler) {
            elRiversButton.onclick = handler;
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
        renderWaves(waves) {
            const getColour = buildRangeShifter(0, waves.length-1, 70, 50);
            waves.forEach((wave, i) => {
                wave.forEach(p => {
                    canvas.drawRectangle(p.x, p.y, 1, 1, `hsla(220, 100%,${getColour(i)}%, 0.5)`);
                });
            });
        },
        renderRivers(riverPoints) {
            riverPoints.forEach(p => {
                canvas.drawRectangle(p.x, p.y, 1, 1, `rgba(0,80,240,${Math.min(1, p.fill/1000)})`);
            });
        }
    };

    return view;
}