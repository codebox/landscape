function buildModel(rnd, gridSize) {
    "use strict";
    let elevationGrid;

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

    function assertGridCoords(x,y) {
        console.assert(Math.floor(x) === x && Math.floor(y) === y && x >= 0 && x < gridSize && y >= 0 && y < gridSize, `x: ${x} y: ${y}`);
    }

    function sumValues(grid, x, y, radius) {
        const startX = Math.max(0, x - radius),
            endX = Math.min(x, gridSize - 1 - radius),
            startY = Math.max(0, y - radius),
            endY = Math.min(y, gridSize - 1 - radius);

        let total = 0;
        for (let y=startY; y<=endY; y++) {
            for (let x=startX; x<=endX; x++) {
                total += grid[y][x];
            }
        }
        return total;
    }

    const model = {
        init() {
            initElevationGrid();
        },

        getElevationGrid() {
            return {
                forEach(fn) {
                    for (let y = 0; y < gridSize; y++) {
                        for (let x = 0; x < gridSize; x++) {
                            fn(x, y, this.get(x, y));
                        }
                    }
                },
                get(x, y) {
                    assertGridCoords(x, y);
                    return elevationGrid[y][x]
                },
                set(x, y, val) {
                    assertGridCoords(x, y);
                    elevationGrid[y][x] = val;
                },
            }
        },
        applySmoothing(radius=1, amount=0.5) {
            const smoothedGrid = [];
            for (let y=0; y<gridSize; y++) {
                smoothedGrid[y] = [];
                for (let x=0; x<gridSize; x++) {
                    const currentValue = elevationGrid[y][x],
                        neighbourValues = sumValues(elevationGrid, x, y, radius) - currentValue,
                        neighbourCount = (2 * radius + 1) * (2 * radius + 1) - 1;
                    smoothedGrid[y][x] = currentValue + amount * (neighbourValues / neighbourCount - currentValue);
                }
            }
            elevationGrid = smoothedGrid;
        },

        gridWidth : gridSize,
        gridHeight : gridSize
    };
    return model;
}