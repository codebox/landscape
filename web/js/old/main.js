function init(){
    "use strict";

    model.init();
    view.init();

    function updateView(){
        view.render(model);
        window.requestAnimationFrame(updateView);
    }

    window.requestAnimationFrame(updateView);

}
rnd = randomFromSeed(Date.now());
init();