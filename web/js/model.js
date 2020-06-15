function buildModel(rnd, gridWidth, gridHeight) {
    "use strict";
    let elevationGrid;

    function initElevationGrid() {
        const perlin2d = buildPerlin(rnd, 1, 1);
        elevationGrid = [];
        for (let y=0; y<gridHeight; y++) {
            elevationGrid[y] = [];
            for (let x=0; x<gridWidth; x++) {
                elevationGrid[y][x] = perlin2d(x / gridWidth, y / gridHeight);
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
                    for (let y=0; y<gridHeight; y++) {
                        for (let x=0; x<gridWidth; x++) {
                            fn(x, y, elevationGrid[y][x]);
                        }
                    }
                }
            }
        },
        gridWidth,
        gridHeight
    };
    return model;
}