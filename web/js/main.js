function init(seed){
    "use strict";

    const RENDER_SCALE = 5,
        MODEL_WIDTH = 100,
        MODEL_HEIGHT = 100,
        rnd = randomFromSeed(seed),
        model = buildModel(rnd, MODEL_WIDTH, MODEL_HEIGHT),
        view = buildView(RENDER_SCALE);

    model.init();
    view.init();

    view.render(model);
};
init(Date.now());