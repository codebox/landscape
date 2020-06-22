function buildModel(rnd, gridSize, seaLevel) {
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

    function isOnGrid(x,y) {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
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
                    if (isOnGrid(x, y)) {
                        return elevationGrid[y][x]
                    }
                },
                set(x, y, val) {
                    if (isOnGrid(x, y) && Math.floor(x) === x && Math.floor(y) === y) {
                        elevationGrid[y][x] = val;
                    }
                },
            }
        },
        applySmoothing(radius) {
            const smoother = buildSmoother(model, seaLevel, radius);
            this.getElevationGrid().forEach((x,y,v) => {
                this.getElevationGrid().set(x,y,smoother.smooth({x,y}));
            });
        },

        gridWidth : gridSize,
        gridHeight : gridSize
    };
    return model;
}