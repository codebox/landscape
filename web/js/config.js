const config = Object.freeze({
    renderScale: 1,
    seaLevel: -0.1,
    snowLevel: 0.1,
    erosionCycles: 10000,
    erosionBatchSize: 1000,
    erosionPreviewMillis: 1000,
    smoothingRadius: 5,
    contourSpacing: 0.05,
    maxContour: 1,
    waveCount: 5,
    waveSeparation: 2,
    waveDepthLimit: 0.1,
    waterDropMinVolume: 0.01,
    erosion: {
        inertia: 0.0,
        minSlope: 0.05,
        capacity: 10,
        deposition: 0.02,
        erosion: 0.9,
        gravity: 20,
        evaporation: 0.0001,
        maxSteps: 1000,
        erosionRadius: 3
    },
    perlinLevels: 6,
    perlinWeightDecay: 3,
    sunPosition: {
        x: -1,
        y: -1,
        z: 0
    },
    smoothing: {
        radius: 5,
        ρ: 1
    },
    threeD: {
        yOffset: 100,
        heightFactor: 200,
        perspective: 3
    }
});