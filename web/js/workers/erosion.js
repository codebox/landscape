importScripts('../util.js', '../config.js');

self.addEventListener('message', event => {
    const {elevation, seed, cycles} = event.data;

    const params = config.erosion,
        rnd = randomFromSeed(seed);

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

    function getHeightForPosition(grid, x,y) {
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

    function buildDroplet(x=rnd() * (config.mapWidth - 1), y=rnd() * (config.mapHeight - 1)) {
        return {
            x,
            y,
            dx: 0,
            dy: 0,
            speed: 0,
            water: 1,
            sediment: 0
        };
    }

    function updateDirectionOfMovement(drop, gradient, inertia=params.inertia) {
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

    function updateElevation(grid, x, y, change) {
        const xPos = Math.floor(x),
            yPos = Math.floor(y),
            oldElevation = grid.get(xPos, yPos),
            newElevation = oldElevation + change;
        grid.set(xPos, yPos, newElevation);
    }

    function updateSpeed(drop, heightDecrease) {
        const speed = Math.sqrt(Math.max(0, drop.speed * drop.speed + heightDecrease * params.gravity));
        drop.speed = speed;
    }

    function updateWater(drop) {
        drop.water *= (1 - params.evaporation);
    }

    function dropIsOnMap(drop) {
        return drop.x >= 0 && drop.x < (config.mapWidth - 1) && drop.y >= 0 && drop.y < (config.mapHeight - 1);
    }

    function depositSediment(grid, drop, deposit) {
        console.assert(deposit >= 0);
        updateElevation(grid, drop.prevX, drop.prevY, deposit/4);
        updateElevation(grid, drop.prevX+1, drop.prevY, deposit/4);
        updateElevation(grid, drop.prevX, drop.prevY+1, deposit/4);
        updateElevation(grid, drop.prevX+1, drop.prevY+1, deposit/4);
        drop.sediment -= deposit;
        console.assert(drop.sediment >= 0);
    }

    function erodeSurrounding(grid, drop, erosionTotal) {
        if (!erosionTotal) {
            return;
        }
        const startX = Math.max(0, drop.prevX - params.erosionRadius),
            endX = Math.min(config.mapWidth - 1, drop.prevX + params.erosionRadius),
            startY = Math.max(0, drop.prevY - params.erosionRadius),
            endY = Math.min(config.mapHeight - 1, drop.prevY + params.erosionRadius),
            erosionAmounts = [];

        for (let x=startX; x<=endX; x++) {
            for (let y=startY; y<=endY; y++) {
                const xDiff = x - drop.prevX,
                    yDiff = y - drop.prevY,
                    amount = 1 / (Math.sqrt(xDiff*xDiff + yDiff*yDiff) + 1);
                erosionAmounts.push({x, y, amount});
            }
        }
        const total = erosionAmounts.reduce((a,c) => a + c.amount, 0);

        erosionAmounts.forEach(e => {
            updateElevation(grid, e.x, e.y, -erosionTotal * e.amount/total);
        });

        drop.sediment += erosionTotal;
    }

    function simulateWater(grid, drop, onDropOverCarryCapacity, onDropUnderCarryCapacity, onDropInLargePit, onDropInSmallPit, onDropMoved) {
        let step = 0, path = [];

        while(step++ < params.maxSteps) {
            const elevation = getHeightForPosition(grid, drop.x, drop.y);
            if (elevation < config.seaLevel) {
                break;
            }
            path.push({x: drop.x, y: drop.y, el: elevation});
            const gradient = getGradientForPosition(grid, drop.x, drop.y);

            updateDirectionOfMovement(drop, gradient);
            updatePosition(drop);

            if (!dropIsOnMap(drop)) {
                break;
            }
            if (drop.water < config.waterDropMinVolume) {
                break
            }

            const heightDecrease = elevation - getHeightForPosition(grid, drop.x, drop.y);
            if (heightDecrease > 0) {
                // moved downhill
                const carryCapacity = Math.max(heightDecrease, params.minSlope) * drop.speed * drop.water * params.capacity;
                if (drop.sediment > carryCapacity) {
                    onDropOverCarryCapacity(carryCapacity);

                } else {
                    onDropUnderCarryCapacity(carryCapacity, heightDecrease);
                }
                updateSpeed(drop, heightDecrease);

            } else {
                // moved uphill
                if (drop.sediment <= -heightDecrease) {
                    // not enough sediment to fill pit
                    const stop = onDropInLargePit();
                    if (stop) {
                        break;
                    }

                } else {
                    // enough sediment to fill pit
                    onDropInSmallPit(heightDecrease);
                }
            }

            updateWater(drop);
            onDropMoved();
        }

        return path;
    }

    const grid = buildGrid(elevation),
        paths = [];

    let i=0;
    while (i++ < cycles) {
        const drop = buildDroplet();
        const path = simulateWater(grid, drop,
            carryCapacity => {
                const deposit = (drop.sediment - carryCapacity) * params.deposition;
                depositSediment(grid, drop, deposit);
            },
            (carryCapacity, heightDecrease) => {
                const erosion = Math.min((carryCapacity - drop.sediment) * params.erosion, heightDecrease);
                erodeSurrounding(grid, drop, erosion);
            },
            () => {
                depositSediment(grid, drop, drop.sediment);
                return true;
            },
            heightDecrease => {
                depositSediment(grid, drop, -heightDecrease);
                drop.speed = 0;
            },
            () => {}
        );
        paths.push(path);
    }

    self.postMessage(grid.toArray());

}, false);