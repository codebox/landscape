function init(seed){
    "use strict";

    const RENDER_SCALE = 1,
        MODEL_WIDTH = 1000,
        MODEL_HEIGHT = 1000,
        ZOOM_LEVEL = 7,
        rnd = randomFromSeed(seed),
        model = buildModel(rnd, MODEL_WIDTH, MODEL_HEIGHT, ZOOM_LEVEL),
        view = buildView(RENDER_SCALE);

    model.init();
    view.init();

    function renderModel() {
        view.render(model);
    }

    window.onresize = renderModel;
    renderModel();
};

init(Date.now());