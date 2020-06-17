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

    const model = {
        init() {
            initElevationGrid();
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

        gridWidth : gridSize,
        gridHeight : gridSize
    };
    return model;
}