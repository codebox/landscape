const model = (() => {
    "use strict";
    const height = 20, width = 20;

    const data = (() => {
        return {
            init(value = 0) {
                for (let x=0; x<width; x++) {
                    data[x]=[];
                    for (let y=0; y<height; y++) {
                        data[x][y] = value;
                    }
                }
            },
            set(x, y, value) {
                if (data[x][y] !== value) {
                    data[x][y] = value;
                    return true;
                }
            },
            get(x, y) {
                console.assert(x>=0 && x < width && y >= 0 && y < height);
                return data[x][y];
            },
            forEachSet(fn) {
                for (let x=0; x<width; x++) {
                    for (let y=0; y<height; y++) {
                        const newValue = fn(data[x][y], x, y);
                        if (newValue !== undefined) {
                            data[x][y] = newValue;
                        }
                    }
                }
            }
        };
    })();

    let hasNew = true;


    const modelObj = {
        init() {
            data.init(0.5);
        },
        getLatest() {
            if (hasNew) {
                hasNew = false;
                return data;
            }
        }
    };

    return modelObj;
})();