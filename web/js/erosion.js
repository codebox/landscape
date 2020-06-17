function buildEroder(rnd, model) {
    "use strict";

    // Algorithm from https://www.firespark.de/resources/downloads/implementation%20of%20a%20methode%20for%20hydraulic%20erosion.pdf
    // http://ranmantaru.com/blog/2011/10/08/water-erosion-on-heightmap-terrain/

    const grid = model.getElevationGrid(),
        params = {
            inertia: 0.1,
            minSlope: 0.05,
            capacity: 10,
            deposition: 0.02,
            erosion: 0.9,
            gravity: 20,
            evaporation: 0.001,
            maxSteps: 10000
        };

    function getGradientForPosition(x,y) {
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

    function getHeightForPosition(x,y) {
        const posX = Math.floor(x),
            posY = Math.floor(y),
            u = x - posX,
            v = y - posY,

            h_x0y0 = grid.get(posX, posY),
            h_x1y0 = grid.get(posX + 1, posY),
            h_x0y1 = grid.get(posX, posY + 1),
            h_x1y1 = grid.get(posX + 1, posY + 1),

            h_y0 = h_x0y0 * (1 - u) + h_x1y0 * u,
            h_y1 = h_x0y1 * (1 - u) + h_x1y1 * u;

        return h_y1 * v + h_y0 * (1 - v);
    }

    function buildDroplet() {
        return {
            x: rnd() * (model.gridWidth - 1),
            y: rnd() * (model.gridHeight - 1),
            dx: 0,
            dy: 0,
            speed: 0,
            water: 1,
            sediment: 0
        };
    }

    function updateDirectionOfMovement(drop, gradient) {
        const dx = drop.dx * params.inertia - gradient.x * (1 - params.inertia),
            dy = drop.dy * params.inertia - gradient.y * (1 - params.inertia),
            magnitude = Math.sqrt(dx * dx + dy * dy);

        // normalise
        drop.dx = dx / magnitude;
        drop.dy = dy / magnitude;
    }

    function updatePosition(drop) {
        drop.prevX = drop.x;
        drop.prevY = drop.y;
        drop.x += drop.dx;
        drop.y += drop.dy;
    }

    function updateElevation(x, y, change) {
        const xPos = Math.floor(x),
            yPos = Math.floor(y),
            oldElevation = grid.get(xPos, yPos),
            newElevation = oldElevation + change;
        grid.set(xPos, yPos, newElevation);
        // console.log(newElevation - oldElevation);
    }

    function updateSpeed(drop, heightDecrease) {
        const speed = Math.sqrt(Math.max(0, drop.speed * drop.speed + heightDecrease * params.gravity));
        drop.speed = speed;
    }

    function updateWater(drop) {
        drop.water *= (1 - params.evaporation);
    }

    function dropIsOnMap(drop) {
        return drop.x >= 0 && drop.x < (model.gridWidth - 1) && drop.y >= 0 && drop.y < (model.gridHeight - 1);
    }

    function depositSediment(drop, deposit) {
        updateElevation(drop.prevX, drop.prevY, deposit);
        drop.sediment -= deposit;
        console.assert(drop.sediment >= 0);
    }

    function erodeSurrounding(drop, erosionTotal) {
        if (!erosionTotal) {
            return;
        }
        const EROSION_RADIUS = 2,
            startX = Math.max(0, drop.prevX - EROSION_RADIUS),
            endX = Math.min(model.gridWidth - 1, drop.prevX + EROSION_RADIUS),
            startY = Math.max(0, drop.prevY - EROSION_RADIUS),
            endY = Math.min(model.gridHeight - 1, drop.prevY + EROSION_RADIUS),
            erosionAmounts = [];

        for (let x=startX; x<=endX; x++) {
            for (let y=startY; y<=endY; y++) {
                const xDiff = x - drop.prevX,
                    yDiff = y - drop.prevY;
                erosionAmounts.push({x, y, amount: Math.sqrt(xDiff*xDiff + yDiff*yDiff)});
            }
        }
        const total = erosionAmounts.reduce((a,c) => a + c.amount, 0);

        erosionAmounts.forEach(e => {
            updateElevation(e.x, e.y, -erosionTotal * e.amount/total);
        });

        drop.sediment += erosionTotal;
    }

    const eroder = {
        erode() {
            const drop = buildDroplet(), path = [];
            let step = 0;

            while(step++ < params.maxSteps) {
                path.push({x: drop.x, y: drop.y});
                const gradient = getGradientForPosition(drop.x, drop.y);

                updateDirectionOfMovement(drop, gradient);
                updatePosition(drop);

                if (!dropIsOnMap(drop)) {
                    console.log('drop left the map')
                    break;
                }

                const heightDecrease = getHeightForPosition(drop.prevX, drop.prevY) - getHeightForPosition(drop.x, drop.y);
                if (heightDecrease > 0) {
                    // moved downhill
                    const carryCapacity = Math.max(heightDecrease, params.minSlope) * drop.speed * drop.water * params.capacity;
                    if (drop.sediment > carryCapacity) {
                        const deposit = (drop.sediment - carryCapacity) * params.deposition;
                        depositSediment(drop, deposit);

                    } else {
                        const erosion = Math.min((carryCapacity - drop.sediment) * params.erosion, heightDecrease);
                        erodeSurrounding(drop, erosion);
                    }
                    updateSpeed(drop, heightDecrease);

                } else {
                    // moved uphill
                    if (drop.sediment <= -heightDecrease) {
                        // not enough sediment to fill pit
                        depositSediment(drop, drop.sediment);
                        break;

                    } else {
                        // enough sediment to fill pit
                        depositSediment(drop, -heightDecrease);
                        drop.speed = 0;
                    }
                }

                updateWater(drop);
            }

            return path;
        }
    };

    return eroder;
}
