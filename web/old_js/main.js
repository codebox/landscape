function init(){
    "use strict";
    let rnd, model;

    const view = buildView();

    function renderModel() {
        view.render(model);
    }

    const seed = Number(view.getSeed()) || Date.now(); // 1592733088268, 1593090177466
    view.setSeed(seed);
    rnd = randomFromSeed(seed);
    model = buildModel(rnd);

    model.init();
    view.init();

    const contourPlotter = buildContourPlotter(),
        wavePlotter = buildWavePlotter(),
        smoother = buildSmoother(),
        eroder = buildEroder(rnd);

    window.onresize = renderModel;

    view.onErodeClick(() => {
        function doErosion(cycles, onComplete){
            let totalComplete = 0;
            function runErosionBatch() {
                const batchSize = Math.min(config.erosionBatchSize, cycles - totalComplete);
                const {paths, elevation} = eroder.erode(model.elevation, batchSize);
                model.elevation = elevation;
                model.erosionPaths = paths;
                renderModel();
                totalComplete += batchSize;
                console.log(totalComplete);
                setTimeout(() => {
                    model.erosionPaths = [];
                    if (totalComplete < cycles) {
                        renderModel();
                        runErosionBatch();
                    } else {
                        onComplete();
                    }
                }, config.erosionPreviewMillis);
            }
            runErosionBatch();
        }
        doErosion(config.erosionCycles, () => {
            model.erosionPaths = [];
            if (model.contours.length) {
                model.contours = contourPlotter.getContours(model.elevation);
            }
            renderModel();
        });
    });

    view.onContourClick(() => {
        model.contours = contourPlotter.getContours(model.elevation);
        renderModel();
    });

    view.onWaveClick(() => {
        model.waves = wavePlotter.getWavePoints(model.elevation);
        renderModel();
    });

    view.onSmoothClick(() => {
        model.elevation = smoother.smooth(model.elevation);
        if (model.contours.length) {
            model.contours = contourPlotter.getContours(model.elevation);
        }
        renderModel();
    });

    view.onRiversClick(() => {
        model.rivers = eroder.findRivers(model.elevation);
        renderModel();
    });

    renderModel()
};

// init();