function buildView() {
    "use strict";
    const elCanvas = document.getElementById('canvas'),
        elErodeButton = document.getElementById('erode'),
        elRiversButton = document.getElementById('rivers'),
        elContourButton = document.getElementById('contour'),
        elWaveButton = document.getElementById('wave'),
        elSmoothButton = document.getElementById('smooth'),
        elSeed = document.getElementById('seed'),
        renderer = buildRenderer(elCanvas).twoD();

    const view = {
        init() {

        },
        onErodeClick(handler) {
            elErodeButton.onclick = handler;
        },
        onRiversClick(handler) {
            elRiversButton.onclick = handler;
        },
        onContourClick(handler) {
            elContourButton.onclick = handler;
        },
        onSmoothClick(handler) {
            elSmoothButton.onclick = handler;
        },
        onWaveClick(handler) {
            elWaveButton.onclick = handler;
        },
        getSeed() {
            return elSeed.value;
        },
        setSeed(seed) {
            elSeed.value = seed;
        },
        renderLandscape(model) {
            renderer.renderLandscape(model);
        },
        renderPath(paths) {
            renderer.renderErosionPaths(paths);
        },
        renderContours(contours) {
           renderer.renderContours(contours);
        },
        renderWaves(waves) {
            renderer.renderWaves(waves);
        },
        renderRivers(riverPoints) {
            renderer.renderRivers(riverPoints);
        }
    };

    return view;
}