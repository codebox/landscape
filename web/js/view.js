const EVENT_RND_CLICK = 'rndClick',
    EVENT_GO_CLICK = 'goClick',
    EVENT_ERODE_CLICK = 'erodeClick',
    EVENT_RIVERS_CLICK = 'riversClick',
    EVENT_CONTOURS_CLICK = 'contourClick',
    EVENT_WAVES_CLICK = 'wavesClick',
    EVENT_SMOOTH_CLICK = 'smoothClick';

function buildView() {
    "use strict";
    const CSS_CLASS_BUTTON_OFF = 'off',
        eventTarget = new EventTarget(),
        seedValue = document.getElementById('seed'),
        randomSeedButton = document.getElementById('randomSeed'),
        goButton = document.getElementById('go'),
        erodeButton = document.getElementById('erode'),
        riversButton = document.getElementById('rivers'),
        contourButton = document.getElementById('contour'),
        waveButton = document.getElementById('wave'),
        smoothButton = document.getElementById('smooth');

    function trigger(eventName, eventData) {
        console.debug(`=== EVENT ${name + ' ' || ''}: ${eventName} ${JSON.stringify(eventData) || ''}`);
        const event = new Event(eventName);
        event.data = eventData;
        eventTarget.dispatchEvent(event);
    }

    randomSeedButton.onclick = () => trigger(EVENT_RND_CLICK);
    goButton.onclick = () => trigger(EVENT_GO_CLICK);
    erodeButton.onclick = () => trigger(EVENT_ERODE_CLICK);
    riversButton.onclick = () => trigger(EVENT_RIVERS_CLICK);
    contourButton.onclick = () => trigger(EVENT_CONTOURS_CLICK);
    waveButton.onclick = () => trigger(EVENT_WAVES_CLICK);
    smoothButton.onclick = () => trigger(EVENT_SMOOTH_CLICK);

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
    return {
        setSeed(newSeed) {
            seedValue.value = newSeed;
        },
        toggleRivers(enabled) {
            riversButton.classList.toggle(CSS_CLASS_BUTTON_OFF, !enabled);
        },
        toggleContours(enabled) {
            contourButton.classList.toggle(CSS_CLASS_BUTTON_OFF, !enabled);
        },
        toggleWaves(enabled) {
            waveButton.classList.toggle(CSS_CLASS_BUTTON_OFF, !enabled);
        },
        on(eventName) {
            return {
                then(handler) {
                    eventTarget.addEventListener(eventName, handler);
                },
                ifWorking() {
                    return addConditionalHandler(eventName, () => model.working);
                },
                ifIdle() {
                    return addConditionalHandler(eventName, () => !model.working);
                }
            };
        }
    };
}