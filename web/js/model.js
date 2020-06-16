function buildModel(rnd, gridSize) {
    "use strict";
    let elevationGrid, dropPaths=[];

    function initElevationGrid() {
        const levels = 6, weightDecay = 3,
            perlin2d = buildPerlinEnsemble(rnd, gridSize, levels, weightDecay);
        elevationGrid = [];
        for (let y=0; y<gridSize; y++) {
            elevationGrid[y] = [];
            for (let x=0; x<gridSize; x++) {
                elevationGrid[y][x] = perlin2d(x / gridSize, y / gridSize);
            }
        }
    }

    function simulateErosion(dropletCount) {
        // https://www.firespark.de/resources/downloads/implementation%20of%20a%20methode%20for%20hydraulic%20erosion.pdf
        // https://jobtalle.com/simulating_hydraulic_erosion.html
        const FRICTION = 0.9, SPEED = 1, MAX_SEDIMENT = 0.1, DEPOSITION_RATE = 0.0001, EROSION_RATE = 0.01;

        function build3dVector(x,y,z) {
            const l = Math.sqrt(x*x + y*y + z*z);
            return {
                x: x/l,
                y: y/l,
                z: z/l
            };
        }
        function constrain(v, min, max) {
            return Math.max(Math.min(v, max), min);
        }
        function getGradientForPosition(x,y) {
            x = constrain(Math.floor(x), 1, gridSize - 2);
            y = constrain(Math.floor(y), 1, gridSize - 2);
            const elevationTop = elevationGrid[y-1][x],
                elevationBottom = elevationGrid[y+1][x],
                elevationLeft = elevationGrid[y][x-1],
                elevationRight = elevationGrid[y][x+1];

            return build3dVector(elevationRight - elevationLeft, elevationBottom - elevationTop, 2);
        }

        function isPointOnMap(posX, posY) {
            return posX >= 0 && posX < gridSize && posY >= 0 && posY < gridSize;
        }

        function simulateDroplet(posX, posY, maxSteps) {
            let sediment = 0, velX = 0, velY = 0, gradient, steps=0;

            while(steps < maxSteps && isPointOnMap(posX, posY)) {
                //dropPaths.push({x:posX, y:posY});
                gradient = getGradientForPosition(posX, posY);
                velX = velX * FRICTION - gradient.x * SPEED;
                velY = velY * FRICTION - gradient.y * SPEED;
                let deposit = sediment * DEPOSITION_RATE * gradient.z,
                    erosion = EROSION_RATE * (1 - gradient.z);

                elevationGrid[Math.floor(posY)][Math.floor(posX)] += (deposit - erosion);
                posX += velX;
                posY += velY;
                steps++;
                sediment += erosion - deposit;
                //console.log('change=', deposit - erosion)
                if (Math.abs(gradient.z) > 0.9999999) {
                    // console.log('flat ground')
                    break;
                }
            }
            if (isPointOnMap(posX, posY)){
                elevationGrid[Math.floor(posY)][Math.floor(posX)] += sediment;
            }
        }

        for (let i=0; i<dropletCount; i++) {
            const dropX = Math.floor(rnd() * gridSize),
                dropY = Math.floor(rnd() * gridSize);
            simulateDroplet(dropX, dropY, 10000);
        }
    }

    const model = {
        init() {
            initElevationGrid();
        },
        erode(count) {
            simulateErosion(count);
        },
        getElevationGrid() {
            return {
                forEach(fn) {
                    for (let y=0; y<gridSize; y++) {
                        for (let x=0; x<gridSize; x++) {
                            fn(x, y, elevationGrid[y][x]);
                        }
                    }
                }
            }
        },

        getDropPaths() {
            return dropPaths;
        },
        gridWidth : gridSize,
        gridHeight : gridSize
    };
    return model;
}