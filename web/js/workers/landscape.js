importScripts('../util.js', '../config.js');

self.addEventListener('message', event => {
    const {seed, size} = event.data;

    // console.assert(config.mapHeight === config.mapWidth);
    const perlin2d = buildPerlinEnsemble(randomFromSeed(seed), size, config.perlinLevels, config.perlinWeightDecay),
        elevation = [];
    for (let y=0; y<size; y++) {
        elevation[y] = [];
        for (let x=0; x<size; x++) {
            elevation[y][x] = perlin2d(x / size, y / size);
        }
    }

    self.postMessage(elevation);
}, false);