const STATE_INIT = 'init',
    STATE_IDLE = 'idle',
    STATE_WORKING = 'working';

function buildModel() {
    "use strict";
    return {
        seed: 0,
        state: STATE_INIT,
        riversEnabled: false,
        contoursEnabled: false,
        wavesEnabled: false
    };
}