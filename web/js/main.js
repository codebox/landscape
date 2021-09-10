window.onload = () => {
    "use strict";
    const model = buildModel(),
        view = buildView();

    view.on(EVENT_RND_CLICK).then(() => {
        view.setSeed(Date.now());
    });

    view.on(EVENT_RIVERS_CLICK).then(() => {
        view.toggleRivers(model.riversEnabled = !model.riversEnabled);
    });

    view.on(EVENT_CONTOURS_CLICK).then(() => {
        view.toggleContours(model.contoursEnabled = !model.contoursEnabled);
    });

    view.on(EVENT_WAVES_CLICK).then(() => {
        view.toggleWaves(model.wavesEnabled = !model.wavesEnabled);
    });
};