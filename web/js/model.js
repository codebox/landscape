const modelBuilder = (() => {
    "use strict";
    function buildData(width, height) {
        const data = {};

        return {
            init(value = 0) {
                for (let y=0; y<height; y++) {
                    data[y]=[];
                    for (let x=0; x<width; x++) {
                        data[y][x] = value;
                    }
                }
            },
            set(x, y, value) {
                if (data[y][x] !== value) {
                    data[y][x] = value;
                }
            },
            get(x, y) {
                console.assert(x>=0 && x < width && y >= 0 && y < height);
                return data[y][x];
            },
            forEachSet(fn) {
                for (let y=0; y<height; y++) {
                    for (let x=0; x<width; x++) {
                        const newValue = fn(data[y][x], x, y);
                        if (newValue !== undefined) {
                            data[y][x] = newValue;
                        }
                    }
                }
            },
            data

        };
    }


    return {
        build(width, height) {
            const data = buildData(width, height);
            data.init(0.5);
            return data;
        }
    };

})();