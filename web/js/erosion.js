function buildEroder(rnd, model) {
    "use strict";

    const grid = model.getElevationGrid(),
        params = {
            inertia: 0.5,
            minSlope: 0.1,
            capacity: 0.01,
            deposition: 0.5,
            erosion: 0.5,
            gravity: 1,
            evaporation: 0.01,
            maxSteps: 100
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
            x: rnd() * model.gridWidth,
            y: rnd() * model.gridHeight,
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
        drop.prevHeight = drop.height;
        drop.x += drop.dx;
        drop.y += drop.dy;
    }

    function updateElevation(x, y, change) {
        const xPos = Math.floor(x),
            yPos = Math.floor(y),
            oldElevation = grid.get(xPos, yPos),
            newElevation = oldElevation + change;
        grid.set(xPos, yPos, newElevation);
    }

    function updateSpeed(drop, heightDecrease) {
        drop.speed = Math.sqrt(drop.speed * drop.speed + heightDecrease * params.gravity);
    }

    function updateWater(drop) {
        drop.water *= (1 - params.evaporation);
    }

    function dropIsOnMap(drop) {
        return drop.x >= 0 && drop.x < model.gridWidth && drop.y >= 0 && drop.y < model.gridHeight;
    }

    const eroder = {
        erode() {
            const drop = buildDroplet();
            let step = 0;

            while(dropIsOnMap(drop) && step < params.maxSteps) {
                const gradient = getGradientForPosition(drop.x, drop.y);

                updateDirectionOfMovement(drop, gradient);
                updatePosition(drop);

                const heightDecrease = getHeightForPosition(drop.prevX, drop.prevY) - getHeightForPosition(drop.x, drop.y);
                if (heightDecrease > 0) {
                    // moved downhill
                    const carryCapacity = Math.max(heightDecrease, params.minSlope) * drop.speed * drop.water * params.capacity;
                    if (drop.sediment > carryCapacity) {
                        const deposit = (drop.sediment - carryCapacity) * params.deposition;
                        updateElevation(drop.prevX, drop.prevY, deposit);
                        drop.sediment -= deposit;
                    } else {
                        const erosion = Math.min((carryCapacity - drop.sediment) * params.erosion, heightDecrease);
                        updateElevation(drop.prevX, drop.prevY, -erosion);
                        drop.sediment += erosion;
                    }

                } else {
                    // moved uphill
                    if (drop.sediment <= -heightDecrease) {
                        // not enough sediment to fill pit
                        updateElevation(drop.prevX, drop.prevY, drop.sediment);
                        drop.sediment = 0;
                    } else {
                        // enough sediment to fill pit
                        updateElevation(drop.prevX, drop.prevY, -heightDecrease);
                        drop.sediment += heightDecrease;
                    }
                }

                updateSpeed(drop, heightDecrease);
                updateWater(drop);
            }
        }
    };

    return eroder;
}
