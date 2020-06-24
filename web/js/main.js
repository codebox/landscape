function init(){
    "use strict";
    let rnd, model;

    const view = buildView();

    function renderModel() {
        view.render(model);
    }

    // function doErosion(cycles){
    //     let totalComplete = 0;
    //     function runErosionBatch() {
    //         const batchSize = Math.min(config.erosionBatchSize, cycles - totalComplete);
    //         for (let i=0; i<batchSize; i++) {
    //             const path = eroder.erode();
    //             view.renderPath(path);
    //             console.log(totalComplete + i);
    //         }
    //         totalComplete += batchSize;
    //         setTimeout(() => {
    //             renderModel();
    //             if (totalComplete < cycles) {
    //                 runErosionBatch();
    //             }
    //         }, config.erosionPreviewMillis);
    //     }
    //     runErosionBatch();
    // }

    const seed = Number(view.getSeed()) || Date.now(); // 1592733088268
    view.setSeed(seed);
    rnd = randomFromSeed(seed);
    model = buildModel(rnd);

    // const eroder = buildEroder(rnd, model),
    //
    //

    model.init();
    view.init();

    const contourPlotter = buildContourPlotter(),
        wavePlotter = buildWavePlotter(),
        smoother = buildSmoother();

    window.onresize = renderModel;

    // view.onErodeClick(() => {
    //     doErosion(config.erosionCycles);
    // });
    //
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
        view.render(model);
    });
    //
    // view.onRiversClick(() => {
    //     const rivers = eroder.findRivers();
    //     view.renderRivers(rivers);
    // });

    renderModel()
};

init();