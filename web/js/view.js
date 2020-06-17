function buildView(scale) {
    "use strict";
    const elCanvas = document.getElementById('canvas'),
        elGoButton = document.getElementById('go'),
        elSeed = document.getElementById('seed');
    let canvas;

    function buildRangeShifter(minIn, maxIn, minOut, maxOut) {
        return v => {
            //console.assert(v>= minIn && v<= maxIn, v);
            return minOut + (maxOut - minOut) * (v - minIn) / (maxIn - minIn);
        };
    }

    const getElevationColour = (() => {
        const SEA_LEVEL = -0.1,
            getSeaLightness = buildRangeShifter(-1, SEA_LEVEL, 0, 50),
            getGroundLightness = buildRangeShifter(SEA_LEVEL, 1, 20, 100);

        return (elevation, alpha=1) => {
            //console.assert(elevation >= -1 && elevation <= 1);
            if (elevation < SEA_LEVEL) {
                return `hsla(220,100%,${getSeaLightness(elevation)}%,${alpha})`;
            } else {
                return `hsla(115,100%,${getGroundLightness(elevation)}%,${alpha})`;
            }
        };
    })();

    function drawElevationSquare(x, y, v) {
        canvas.drawRectangle(x * scale, y * scale, scale, scale, getElevationColour(v, a));
    }

    function drawGradientSquare(x, y, v, g) {
        const l = Math.sqrt(g.x*g.x + g.y*g.y)
        const gc = Math.abs(g.y/l);
        // const c = getElevationColour(v, gc)
        const c = `rgba(0,0,0,${gc})`;
        console.log(c)
        canvas.drawRectangle(x * scale, y * scale, scale, scale, c);
    }

    function getGradientForPosition(grid, x,y) {
        const posX = Math.floor(x),
            posY = Math.floor(y),
            u = x - posX,
            v = y - posY,

            h_x0y0 = grid.get(posX, posY),
            h_x1y0 = grid.get(posX + 1, posY),
            h_x0y1 = grid.get(posX, posY + 1),
            h_x1y1 = grid.get(posX + 1, posY + 1);

        return {
            x: v * (h_x1y1 - h_x0y1) + (1-v) * (h_x1y0 - h_x0y0),
            y: u * (h_x1y1 - h_x1y0) + (1-u) * (h_x0y1 - h_x0y0)
        }
    }
    function renderElevation(grid) {
        grid.forEach((x,y,v) => {
            if (x>0 && y > 0 && x < 199 && y < 199){
                const g = getGradientForPosition(grid, x, y);
                drawGradientSquare(x, y, v, g);
            }
            //drawElevationSquare(x,y,v);
        });

    }

    function renderDropletPaths(dropPaths) {
        dropPaths.forEach((p,i) => {
            canvas.drawRectangle(p.x * scale, p.y * scale, scale, scale, i ? 'red' : 'white');
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
            //renderDropletPaths(model.getDropPaths());
        },
        renderPath(path) {
            path.forEach((p,i) => {
                canvas.drawRectangle(p.x * scale, p.y * scale, scale, scale, i ?'red':'white')
            })
        }
    };

    return view;
}