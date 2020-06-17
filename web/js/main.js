function init(){
    "use strict";
    const RENDER_SCALE = 5,
        MODEL_SIZE = 100;

    let rnd, model, view = buildView(RENDER_SCALE);

    function renderModel() {
        view.render(model);
    }

    view.onGoClick(() => {
        const seed = Number(view.getSeed()) || Date.now();
        view.setSeed(seed);

        rnd = randomFromSeed(seed);
        model = buildModel(rnd, MODEL_SIZE);
        const eroder = buildEroder(rnd, model);

        model.init();
        view.init();

        for (let i=0; i<100; i++) {
            eroder.erode();
        }
        window.onresize = renderModel;
        renderModel();

    });

    view.onErode(p => {
        // console.log(p.x, p.y)
        // model.erode(p.x/RENDER_SCALE, p.y/RENDER_SCALE);
        // renderModel();
    })
};

init();