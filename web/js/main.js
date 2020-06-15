function init(seed){
    "use strict";

    const RENDER_SCALE = 1,
        MODEL_SIZE = 1000,
        rnd = randomFromSeed(seed),
        model = buildModel(rnd, MODEL_SIZE),
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