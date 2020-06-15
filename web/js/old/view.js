const view = (() => {
    "use strict";
    const elCanvas = document.getElementById('canvas'),
        ctx = elCanvas.getContext('2d');

    let latestData;
    function updateCanvasSize() {
        ctx.canvas.width = elCanvas.clientWidth;
        ctx.canvas.height = elCanvas.clientHeight;
    }

    function clearCanvas() {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, elCanvas.width, elCanvas.height);
    }

    function renderLatestData() {
        clearCanvas();
        const s=10;
        latestData.forEachSet((v,x,y) => {
            ctx.fillStyle=`hsla(0, 0%, 0%, ${v})`;
            ctx.fillRect(x*s,y*s,s,s);
        });
    }
    const viewObj = {
        init() {
            updateCanvasSize();
        },
        render(model) {
            const data = model.getLatest();
            if (data) {
                latestData = data;
                renderLatestData();
            }
        }
    };

    window.onresize = () => {
        updateCanvasSize();
        renderLatestData();
    }

    return viewObj;
})();