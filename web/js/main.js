function init(){
    "use strict";
    const RENDER_SCALE = 1,
        MODEL_SIZE = 500,
        DEBUG = false;

    let rnd, model, view = buildView(RENDER_SCALE);

    function renderModel() {
        view.render(model);
    }

    function doErosion(){
        setTimeout(() => {
            for (let i=0; i<10000; i++) {
                const path = eroder.erode();
                //view.renderPath(path);
                console.log(i)
            }
            renderModel();
            // doErosion();
        }, 0)
    }

    const seed = Number(view.getSeed()) || Date.now();
    view.setSeed(seed);

    rnd = randomFromSeed(seed);
    model = buildModel(rnd, MODEL_SIZE);
    const eroder = buildEroder(rnd, model);

    model.init();
    view.init();

    window.onresize = renderModel;

    view.onGoClick(() => {
        if (DEBUG){
            renderModel();
            for (let i=0; i<100; i++) {
                const path = eroder.erode();
                view.renderPath(path);
            }
            setTimeout(renderModel, 5000);
        } else {
            doErosion();
        }
    });

    renderModel()
};

init();