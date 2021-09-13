window.onload = () => {
    "use strict";
    const model = buildModel(),
        view = buildView(model);

    view.toggleRivers(model.riversEnabled);
    view.toggleContours(model.contoursEnabled);
    view.toggleWaves(model.wavesEnabled);

    function renderModel() {
        view.setDisabled();
        model.state = STATE_WORKING;
        view.setStatus('Rendering...');

        setTimeout(() => {
            view.render(model);
            view.setEnabled();
            model.state = STATE_IDLE;
            view.setStatus('');
        }, 0);
    }

    view.on(EVENT_RND_CLICK).ifStateIs(STATE_INIT, STATE_IDLE).then(() => {
        view.setSeed(Math.floor(Math.random() * 100000000));
    });

    view.on(EVENT_RIVERS_CLICK).ifStateIs(STATE_IDLE).then(() => {
        view.toggleRivers(model.riversEnabled = !model.riversEnabled);

        if (model.riversEnabled && !model.rivers) {
            view.setDisabled();
            model.state = STATE_WORKING;
            view.setStatus('Forming rivers...');

            const riverWorker = new Worker('js/workers/erosion.js');
            riverWorker.postMessage({
                seed: model.seed,
                elevation: model.elevation,
                cycles: 10000,
                size: model.canvasSize,
                rivers: true
            });
            riverWorker.onmessage = event => {
                model.rivers = event.data;
                renderModel();
            };
        } else {
            renderModel();
        }
    });

    view.on(EVENT_CONTOURS_CLICK).ifStateIs(STATE_IDLE).then(() => {
        view.toggleContours(model.contoursEnabled = !model.contoursEnabled);
        if (model.contoursEnabled && !model.contours) {
            view.setDisabled();
            model.state = STATE_WORKING;
            view.setStatus('Calculating contours...');

            const contourWorker = new Worker('js/workers/contours.js');
            contourWorker.postMessage(model.elevation);
            contourWorker.onmessage = event => {
                model.contours = event.data;
                renderModel();
            };
        } else {
            renderModel();
        }
    });

    view.on(EVENT_WAVES_CLICK).ifStateIs(STATE_IDLE).then(() => {
        view.toggleWaves(model.wavesEnabled = !model.wavesEnabled);
        if (model.wavesEnabled && !model.waves) {
            view.setDisabled();
            model.state = STATE_WORKING;
            view.setStatus('Calculating waves...');

            const waveWorker = new Worker('js/workers/waves.js');
            waveWorker.postMessage(model.elevation);
            waveWorker.onmessage = event => {
                model.waves = event.data;
                renderModel();
            };
        } else {
            renderModel();
        }
    });

    view.on(EVENT_GO_CLICK).ifStateIs(STATE_INIT, STATE_IDLE).then(() => {
        view.setDisabled();
        model.state = STATE_WORKING;
        const canvasDimensions = view.getCanvasSize();
        model.canvasSize = Math.min(canvasDimensions.height, canvasDimensions.width);
        view.setStatus('Building Landscape...');

        const landscapeWorker = new Worker('js/workers/landscape.js');
        landscapeWorker.postMessage({
            seed: model.seed,
            size: model.canvasSize
        });
        landscapeWorker.onmessage = event => {
            model.elevation = event.data;
            model.rivers = model.contours = model.waves = null;
            renderModel();
        };
    });

    view.on(EVENT_ERODE_CLICK).ifStateIs(STATE_IDLE).then(() => {
        view.setDisabled();
        model.state = STATE_WORKING;
        view.setStatus('Calculating erosion...');

        const erosionWorker = new Worker('js/workers/erosion.js');
        erosionWorker.postMessage({
            seed: model.seed,
            elevation: model.elevation,
            cycles: 10000,
            size: model.canvasSize
        });
        erosionWorker.onmessage = event => {
            model.elevation = event.data;
            model.rivers = model.contours = model.waves = null;
            renderModel();
        };
    });

    view.on(EVENT_SMOOTH_CLICK).ifStateIs(STATE_IDLE).then(() => {
        view.setDisabled();
        model.state = STATE_WORKING;
        view.setStatus('Smoothing terrain...');

        const smoothingWorker = new Worker('js/workers/smoothing.js');
        smoothingWorker.postMessage(model.elevation);
        smoothingWorker.onmessage = event => {
            model.elevation = event.data;
            model.rivers = model.contours = model.waves = null;
            renderModel();
        };
    });

    view.on(EVENT_SEED_CHANGED).ifStateIs(STATE_IDLE).then(event => {
        model.seed = event.data;
        model.elevation = model.contours = model.waves = model.rivers = model.erosionPaths = null;
    });

    view.on(EVENT_DOWNLOAD_CLICK).ifStateIs(STATE_IDLE).then(event => {
        view.downloadImageAs(model.seed);
    });

};