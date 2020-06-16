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

        model.init();
        view.init();

        window.onresize = renderModel;
        renderModel();

        setTimeout(() => {
            let c=0, perBatch = 100;
            while(c<100){
                model.erode(perBatch);
                console.log(++c * perBatch);
            }
            renderModel();
        }, 0)
    });

    view.onErode(p => {
        // console.log(p.x, p.y)
        // model.erode(p.x/RENDER_SCALE, p.y/RENDER_SCALE);
        // renderModel();
    })
};

init();