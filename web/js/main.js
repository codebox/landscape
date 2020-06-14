function init(){
    "use strict";

    const model = terrainGenerator.generateModel(2,100);
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