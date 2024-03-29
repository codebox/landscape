const EVENT_RND_CLICK = 'rndClick',
    EVENT_GO_CLICK = 'goClick',
    EVENT_ERODE_CLICK = 'erodeClick',
    EVENT_RIVERS_CLICK = 'riversClick',
    EVENT_CONTOURS_CLICK = 'contourClick',
    EVENT_WAVES_CLICK = 'wavesClick',
    EVENT_SMOOTH_CLICK = 'smoothClick',
    EVENT_DOWNLOAD_CLICK = 'downloadClick',
    EVENT_SEED_CHANGED = 'seedChanged';

function buildView(model) {
    "use strict";
    const CSS_CLASS_BUTTON_OFF = 'off',
        CSS_CLASS_BUTTON_DISABLED = 'disabled',
        eventTarget = new EventTarget(),
        elControls = document.getElementById('controls'),
        elSeedValue = document.getElementById('seed'),
        elRandomSeedButton = document.getElementById('randomSeed'),
        elGoButton = document.getElementById('go'),
        elErodeButton = document.getElementById('erode'),
        elRiversButton = document.getElementById('rivers'),
        elContourButton = document.getElementById('contour'),
        elWaveButton = document.getElementById('wave'),
        elSmoothButton = document.getElementById('smooth'),
        elStatus = document.getElementById('status'),
        elCanvas = document.getElementById('canvas'),
        elDownload = document.getElementById('download'),
        mapRenderer = buildRenderer(elCanvas).twoD();

    function trigger(eventName, eventData) {
        console.debug(`=== EVENT ${name + ' ' || ''}: ${eventName} ${JSON.stringify(eventData) || ''}`);
        const event = new Event(eventName);
        event.data = eventData;
        eventTarget.dispatchEvent(event);
    }

    elRandomSeedButton.onclick = () => trigger(EVENT_RND_CLICK);
    elGoButton.onclick = () => trigger(EVENT_GO_CLICK);
    elErodeButton.onclick = () => trigger(EVENT_ERODE_CLICK);
    elRiversButton.onclick = () => trigger(EVENT_RIVERS_CLICK);
    elContourButton.onclick = () => trigger(EVENT_CONTOURS_CLICK);
    elWaveButton.onclick = () => trigger(EVENT_WAVES_CLICK);
    elSmoothButton.onclick = () => trigger(EVENT_SMOOTH_CLICK);
    elDownload.onclick = () => trigger(EVENT_DOWNLOAD_CLICK);
    elSeedValue.oninput = () => setSeedAndTriggerEvent(elSeedValue.value);

    function addConditionalHandler(eventName, fnCondition){
        return {
            then(handler) {
                eventTarget.addEventListener(eventName, event => {
                    if (fnCondition()) {
                        handler(event);
                    }
                });
            }
        };
    }

    function setSeedAndTriggerEvent(newSeed) {
        trigger(EVENT_SEED_CHANGED, elSeedValue.value = Number(newSeed));
    }
    return {
        setSeed(newSeed) {
            setSeedAndTriggerEvent(newSeed);
        },
        setDisabled() {
            elControls.classList.add(CSS_CLASS_BUTTON_DISABLED);
            elSeedValue.disabled = true;
        },
        setEnabled() {
            elControls.classList.remove(CSS_CLASS_BUTTON_DISABLED);
            elSeedValue.disabled = false;
        },
        toggleRivers(enabled) {
            elRiversButton.classList.toggle(CSS_CLASS_BUTTON_OFF, !enabled);
        },
        toggleContours(enabled) {
            elContourButton.classList.toggle(CSS_CLASS_BUTTON_OFF, !enabled);
        },
        toggleWaves(enabled) {
            elWaveButton.classList.toggle(CSS_CLASS_BUTTON_OFF, !enabled);
        },
        setStatus(status) {
            elStatus.innerText = status;
        },
        getCanvasSize() {
            return elCanvas.getBoundingClientRect();
        },
        downloadImageAs(seed) {
            const link = document.createElement('a');
            link.download = `${seed}.png`;
            link.href = elCanvas.toDataURL()
            link.click();
        },
        render() {
            mapRenderer.renderLandscape(model.elevation);
            if (model.riversEnabled && model.rivers) {
                mapRenderer.renderRivers(model.rivers);
            }
            if (model.contoursEnabled && model.contours) {
                mapRenderer.renderContours(model.contours);
            }
            if (model.wavesEnabled && model.waves) {
                mapRenderer.renderWaves(model.waves);
            }
        },
        on(eventName) {
            return {
                then(handler) {
                    eventTarget.addEventListener(eventName, handler);
                },
                ifStateIs(...states) {
                    return addConditionalHandler(eventName, () => states.includes(model.state));
                }
            };
        }
    };
}