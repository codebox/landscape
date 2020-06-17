function init(){
    "use strict";
    const RENDER_SCALE = 5,
        MODEL_SIZE = 100;

    let rnd, model, view = buildView(RENDER_SCALE);

    function renderModel() {
        view.render(model);
    }

    view.onGoClick(() => {
        const seed = 1592400515569;//Number(view.getSeed()) || Date.now();
        view.setSeed(seed);

        rnd = randomFromSeed(seed);
        model = buildModel(rnd, MODEL_SIZE);
        const eroder = buildEroder(rnd, model);

        model.init();
        view.init();

        window.onresize = renderModel;
        // renderModel();

        function doErosion(){
            setTimeout(() => {
                renderModel();
                for (let i=0; i<100; i++) {
                    const path = eroder.erode();
                    view.renderPath(path);
                    // console.log(i)
                }
                doErosion();
            }, 0)
        }
        doErosion()

    });

    view.onErode(p => {
        // console.log(p.x, p.y)
        // model.erode(p.x/RENDER_SCALE, p.y/RENDER_SCALE);
        // renderModel();
    })
};

init();