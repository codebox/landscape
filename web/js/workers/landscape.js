importScripts('../util.js', '../config.js');

self.addEventListener('message', event => {
    const seed = event.data;

    console.assert(config.mapHeight === config.mapWidth);
    const perlin2d = buildPerlinEnsemble(randomFromSeed(seed), config.mapHeight, config.perlinLevels, config.perlinWeightDecay);
    const elevation = [];
    for (let y=0; y<config.mapHeight; y++) {
        elevation[y] = [];
        for (let x=0; x<config.mapWidth; x++) {
            elevation[y][x] = perlin2d(x / config.mapWidth, y / config.mapHeight);
        }
    }

    self.postMessage(elevation);
}, false);