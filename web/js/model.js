const model = (() => {
    "use strict";
    let hasNew = true, data = {};

    const modelObj = {
        getLatest(force = false) {
            if (hasNew || force) {
                hasNew = false;
                return data;
            }
        }
    };

    return modelObj;
})();