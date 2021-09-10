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

    view.on(EVENT_GO_CLICK).then(() => {
        view.setDisabled();
        model.working = true;
        setTimeout(() => {
            model.working = false;
            view.setEnabled()
        }, 3000)
    })
};