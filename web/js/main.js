function init(){
    "use strict";
    let rnd, model, view;

    function renderModel() {
        view.render(model);
    }

    function doErosion(cycles){
        let totalComplete = 0;
        function runErosionBatch() {
            const batchSize = Math.min(config.erosionBatchSize, cycles - totalComplete);
            for (let i=0; i<batchSize; i++) {
                const path = eroder.erode();
                view.renderPath(path);
                console.log(totalComplete + i);
            }
            totalComplete += batchSize;
            setTimeout(() => {
                renderModel();
                if (totalComplete < cycles) {
                    runErosionBatch();
                }
            }, config.erosionPreviewMillis);
        }
        runErosionBatch();
    }

    const seed = Number(view.getSeed()) || Date.now(); // 1592733088268
    view.setSeed(seed);

    rnd = randomFromSeed(seed);
    model = buildModel(rnd);
    const eroder = buildEroder(rnd, model),
        contourPlotter = buildContourPlotter(model),
        wavePlotter = buildWavePlotter(model);

    model.init();
    view.init();

    window.onresize = renderModel;

    view.onErodeClick(() => {
        doErosion(config.erosionCycles);
    });

    view.onContourClick(() => {
        const contours = [];
        let h = config.seaLevel;
        while(h <= 1) {
            contours.push(...contourPlotter.findContour(h));
            h += config.contourSpacing;
        }
        view.renderContours(contours);
    });

    view.onWaveClick(() => {
        const wavePoints = wavePlotter.getWavePoints();

        view.renderWaves(wavePoints);
    });

    view.onSmoothClick(() => {
        model.applySmoothing(config.smoothingRadius);
        view.render(model);
    });

    view.onRiversClick(() => {
        const rivers = eroder.findRivers();
        view.renderRivers(rivers);
    });

    renderModel()
};

init();