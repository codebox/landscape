function init(seed){
    "use strict";

    const rnd = randomFromSeed(seed),
        model = buildModel(rnd),
        view = buildView();

    model.init();
    view.init();

    view.render(model);
};
init(Date.now());