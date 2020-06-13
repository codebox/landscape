function init(){
    "use strict";

    function updateView(force=false) {
        view.render(model, force);
    }
    function animateView(){
        updateView();
        window.requestAnimationFrame(animateView);
    }

    window.requestAnimationFrame(animateView);
    window.onresize = () => {
        updateView(true);
    }

}
init();