function init(){
    "use strict";
    const RENDER_SCALE = 1,
        MODEL_SIZE = 500,
        SEA_LEVEL = -0.1,
        SNOW_LEVEL = 0;

    let rnd, model, view = buildView(RENDER_SCALE, SEA_LEVEL, SNOW_LEVEL);

    function renderModel() {
        view.render(model);
    }

    function doErosion(cycles){
        const BATCH_SIZE = 10000;
        let totalComplete = 0;
        function runErosionBatch() {
            const batchSize = Math.min(BATCH_SIZE, cycles - totalComplete);
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
            }, 1000);
        }
        runErosionBatch();
    }

    const seed = Number(view.getSeed()) || Date.now(); // 1592733088268
    view.setSeed(seed);

    rnd = randomFromSeed(seed);
    model = buildModel(rnd, MODEL_SIZE, SEA_LEVEL);
    const eroder = buildEroder(rnd, model, SEA_LEVEL),
        contourPlotter = buildContourPlotter(model),
        wavePlotter = buildWavePlotter(model, SEA_LEVEL);

    model.init();
    view.init();

    window.onresize = renderModel;

    view.onErodeClick(() => {
        doErosion(10000);
    });

    view.onContourClick(() => {
        const contours = [];
        let h = SEA_LEVEL;
        while(h <= 1) {
            contours.push(...contourPlotter.findContour(h));
            h += 0.05;
        }
        view.renderContours(contours);
    });

    view.onWaveClick(() => {
        const wavePoints = wavePlotter.getWavePoints();

        view.renderWaves(wavePoints);
    });

    view.onSmoothClick(() => {
        model.applySmoothing(5);
        view.render(model);
    });

    view.onRiversClick(() => {
        const rivers = eroder.findRivers();
        view.renderRivers(rivers);
    });

    renderModel()
};

init();