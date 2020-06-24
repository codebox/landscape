function init(){
    "use strict";
    let rnd, model;

    const view = buildView();

    function renderModel() {
        view.render(model);
    }

    const seed = Number(view.getSeed()) || Date.now(); // 1592733088268
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
        function doErosion(cycles){
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
                    renderModel();
                    if (totalComplete < cycles) {
                        runErosionBatch();
                    }
                }, config.erosionPreviewMillis);
            }
            runErosionBatch();
        }
        doErosion(config.erosionCycles);
        renderModel();
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
        renderModel();
    });

    view.onRiversClick(() => {
        model.rivers = eroder.findRivers(model.elevation);
        renderModel();
    });

    renderModel()
};

init();