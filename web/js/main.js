function init(){
    "use strict";
    const RENDER_SCALE = 1,
        MODEL_SIZE = 1000;

    let rnd, model, view = buildView(RENDER_SCALE);

    function renderModel() {
        view.render(model);
    }

    view.onGoClick(() => {
        const seed = Number(view.getSeed()) || Date.now();
        view.setSeed(seed);

        rnd = randomFromSeed(seed);
        model = buildModel(rnd, MODEL_SIZE);

        model.init();
        view.init();

        window.onresize = renderModel;
        renderModel();
    });
};

init();