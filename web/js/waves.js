function buildWavePlotter(model) {
    "use strict";


    function sortAndBatchFragments(coastalContour) {
        const batches = [];

        return batches;
    }

    function smoothBatch(batch, smoothing) {

    }

    function findDownwardNormal(line) {

    }

    return {
        getWaveLines(coastalContour) {
            const sortedFragmentBatches = sortAndBatchFragments(coastalContour);

            const SMOOTHING = 2, WAVE_COUNT = 5, WAVE_SPACING = 3, wavePointBatches = [];
            sortedFragmentBatches.forEach(batch => {
                const smoothedBatch = smoothBatch(batch, SMOOTHING),
                    wavePointsForThisBatch = Array(WAVE_COUNT).fill([]);
                smoothedBatch.forEach(line => {
                    const normal = findDownwardNormal(line); // {x,y,gx,gy}
                    for (let waveIndex=0; waveIndex < WAVE_COUNT; waveIndex++) {
                        wavePointsForThisBatch[waveIndex].push({
                            x: normal.x + normal.gx * (waveIndex + 1) * WAVE_SPACING,
                            y: normal.y + normal.gy * (waveIndex + 1) * WAVE_SPACING
                        });
                    }
                    wavePointBatches.push(wavePointsForThisBatch);
                });
            });

            return [];
        }
    };
}