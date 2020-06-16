function buildView(scale) {
    "use strict";
    const elCanvas = document.getElementById('canvas'),
        elGoButton = document.getElementById('go'),
        elSeed = document.getElementById('seed');
    let canvas;

    function buildRangeShifter(minIn, maxIn, minOut, maxOut) {
        return v => {
            console.assert(v>= minIn && v<= maxIn, v);
            return minOut + (maxOut - minOut) * (v - minIn) / (maxIn - minIn);
        };
    }

    const getElevationColour = (() => {
        const SEA_LEVEL = -0.1,
            getSeaLightness = buildRangeShifter(-1, SEA_LEVEL, 0, 50),
            getGroundLightness = buildRangeShifter(SEA_LEVEL, 1, 20, 100);

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

    function renderDropletPaths(dropPaths) {
        dropPaths.forEach(p => {
            canvas.drawRectangle(p.x * scale, p.y * scale, scale, scale, 'red');
        })
    }

    const view = {
        init() {

        },
        onGoClick(handler) {
            elGoButton.onclick = handler;
        },
        onErode(handler) {
            elCanvas.onclick = event => {
                const rect = elCanvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                handler({x,y});
            }
        },
        getSeed() {
            return elSeed.value;
        },
        setSeed(seed) {
            elSeed.value = seed;
        },
        render(model) {
            canvas = buildCanvas(elCanvas, scale * model.gridWidth, scale * model.gridHeight);
            renderElevation(model.getElevationGrid());
            renderDropletPaths(model.getDropPaths());
        }
    };

    return view;
}