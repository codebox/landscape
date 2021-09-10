window.onload = () => {
    "use strict";
    const model = buildModel(),
        view = buildView(model);

    view.on(EVENT_RND_CLICK).ifIdle().then(() => {
        view.setSeed(Date.now());
    });

    view.on(EVENT_RIVERS_CLICK).ifIdle().then(() => {
        view.toggleRivers(model.riversEnabled = !model.riversEnabled);
    });

    view.on(EVENT_CONTOURS_CLICK).ifIdle().then(() => {
        view.toggleContours(model.contoursEnabled = !model.contoursEnabled);
    });

    view.on(EVENT_WAVES_CLICK).ifIdle().then(() => {
        view.toggleWaves(model.wavesEnabled = !model.wavesEnabled);
    });

    view.on(EVENT_GO_CLICK).ifIdle().then(() => {
        view.setDisabled();
        model.working = true;
        view.setStatus('working');

        const landscapeWorker = new Worker('js/workers/landscape.js');
        landscapeWorker.postMessage(model.seed);
        landscapeWorker.onmessage = event => {
            console.log(event.data);
            model.elevation = event.data;
            view.setEnabled();
            model.working = false;
            view.setStatus('');
            view.render(model);
        };
    });

    view.on(EVENT_SEED_CHANGED).ifIdle().then(event => {
        model.seed = event.data;
    });
};