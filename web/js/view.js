const view = (() => {
    "use strict";
    const elCanvas = document.getElementById('canvas'),
        ctx = elCanvas.getContext('2d');

    function updateCanvasSize() {
        ctx.canvas.width = elCanvas.clientWidth;
        ctx.canvas.height = elCanvas.clientHeight;
    }

    const viewObj = {
        render(model, force=false) {
            const data = model.getLatest(force);
            if (data) {
                console.log('render')
            }
        }
    };

    return viewObj;
})();