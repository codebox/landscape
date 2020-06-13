function init(){
    "use strict";

    model.init();
    view.init();

    function updateView() {
        view.render(model);
    }
    function animateView(){
        updateView();
        window.requestAnimationFrame(animateView);
    }

    window.requestAnimationFrame(animateView);

}
rnd = randomFromSeed(Date.now());
init();