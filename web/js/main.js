function init(seed){
    "use strict";

    const RENDER_SCALE = 10,
        MODEL_WIDTH = 100,
        MODEL_HEIGHT = 100,
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