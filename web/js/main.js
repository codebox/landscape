function init(){
    "use strict";
    const RENDER_SCALE = 1,
        MODEL_SIZE = 500;

    let rnd, model, view = buildView(RENDER_SCALE);

    function renderModel() {
        view.render(model);
    }

    function doErosion(cycles){
        const BATCH_SIZE = 1000;
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

    const seed = Number(view.getSeed()) || Date.now();
    view.setSeed(seed);

    rnd = randomFromSeed(seed);
    model = buildModel(rnd, MODEL_SIZE);
    const eroder = buildEroder(rnd, model),
        contourPlotter = buildContourPlotter(model);

    model.init();
    view.init();

    window.onresize = renderModel;

    view.onErodeClick(() => {
        doErosion(5000);
    });

    view.onContourClick(() => {
        const contours = [];
        let h = -0.1;
        while(h <= 1) {
            contours.push(...contourPlotter.findContour(h));
            h += 0.05;
        }

        view.renderContours(contours);
    });

    view.onSmoothClick(() => {
        model.applySmoothing(5,0.5);
        view.render(model);
    });

    renderModel()
};

init();