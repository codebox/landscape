function buildModel(rnd) {
    "use strict";

    function initElevation() {
        console.assert(config.mapHeight === config.mapWidth);
        const perlin2d = buildPerlinEnsemble(rnd, config.mapHeight, config.perlinLevels, config.perlinWeightDecay);
        model.elevation = [];
        for (let y=0; y<config.mapHeight; y++) {
            model.elevation[y] = [];
            for (let x=0; x<config.mapWidth; x++) {
                model.elevation[y][x] = perlin2d(x / config.mapWidth, y / config.mapHeight);
            }
        }
    }

    const model = {
        init() {
            initElevation();
        },
        elevation: [],
        erosionPaths: [],
        contours: [],
        waves: [],
        rivers: []
    };
    return model;
}
