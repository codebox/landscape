function randomFromSeed(seed) {
    // https://stackoverflow.com/a/47593316/138256
    function mulberry32() {
        var t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    return function(a=1, b=0) {
        const min = b && a,
            max = b || a;
        return mulberry32() * (max - min) + min;
    }
}

function buildPerlin(rnd, width, height) {
    "use strict";

    function interpolate(a, b, x) {
        return a + x * (b - a);
    }

    function ease(x) {
        return x * x * (3 - 2 * x);
    }

    function buildVector(x, y, gx, gy) {
        return {
            x, y, gx, gy,
            vectorTo(other) {
                return buildVector(x, y, other.x - x, other.y - y);
            },
            dot(other) {
                return gx * other.gx + gy * other.gy;
            }
        };
    }

    function buildVectorFromGradients(x, y, gradients) {
        return buildVector(x, y, gradients.gx, gradients.gy);
    }

    function average(dp_p00, dp_p10, dp_p01, dp_p11, x, y) {
        return interpolate(
            interpolate(dp_p00, dp_p10, x),
            interpolate(dp_p01, dp_p11, x),
            y
        );
    }

    const unitVectorGradients = [];
    for (let y=0; y<height + 1; y++) {
        unitVectorGradients[y] = [];
        for (let x=0; x<width + 1; x++) {
            const angle = rnd() * Math.PI * 2;
            unitVectorGradients[y][x] = {gx: Math.sin(angle), gy: Math.cos(angle)};
        }
    }


    return (x,y) => {
        /*
            p00--p10
             |    |
            p01--p11
         */
        console.assert(x >= 0 && x <= 1 && y >= 0 && y <= 1, `x=${x} y=${y} height=${height} width=${width}`);
        const xFloor = Math.floor(x * width),
            xOffset = x * width- xFloor,
            xOffsetEased = ease(xOffset),
            yFloor = Math.floor(y * height),
            yOffset = y * height - yFloor,
            yOffsetEased = ease(yOffset),

            xy = buildVector(xOffset, yOffset, 0, 0),

            p00 = buildVectorFromGradients(0, 0, unitVectorGradients[yFloor][xFloor]),
            p10 = buildVectorFromGradients(1, 0, unitVectorGradients[yFloor][xFloor + 1]),
            p01 = buildVectorFromGradients(0, 1, unitVectorGradients[yFloor + 1][xFloor]),
            p11 = buildVectorFromGradients(1, 1, unitVectorGradients[yFloor + 1][xFloor + 1]),

            p00_xy = p00.vectorTo(xy),
            p10_xy = p10.vectorTo(xy),
            p01_xy = p01.vectorTo(xy),
            p11_xy = p11.vectorTo(xy),

            dp_p00 = p00_xy.dot(p00),
            dp_p10 = p10_xy.dot(p10),
            dp_p01 = p01_xy.dot(p01),
            dp_p11 = p11_xy.dot(p11);

        return average(dp_p00, dp_p10, dp_p01, dp_p11, xOffsetEased, yOffsetEased);
    };
}
function buildPerlinEnsemble(rnd, size, levels, weightDecay) {
    const zoomBase = Math.pow(size, 1/(levels-1)),
        noiseParams = new Array(levels).fill().map((_,i) => {
        "use strict";
        return {
            weight: Math.pow(weightDecay, -i),
            zoom: Math.pow(zoomBase, i)
        }
    });

    const weightTotal = [...noiseParams].reduce((a,c) => a + c.weight, 0),
        fns = [...noiseParams].map(p => {
            const perlin = buildPerlin(rnd, p.zoom, p.zoom);
            return (x,y) => p.weight * perlin(x, y) / weightTotal;
        });
    return (x,y) => fns.reduce((v, fn) => v + fn(x,y), 0);
}

function forEachInRange(start, finish, fn) {
    "use strict";
    console.assert(start <= finish);
    for (let i=start; i<=finish; i++) {
        fn(i);
    }
}

function buildGrid(data) {
    "use strict";
    console.assert(data.length > 0, 'no rows present');
    console.assert(Math.min(...data.map(a => a.length)) === Math.max(...data.map(a => a.length)), 'rows have different lengths');
    console.assert(data[0].length > 0, 'no columns present');

    const width = data[0].length,
        height = data.length;

    function isOnGrid(x,y) {
        return x >= 0 && x < width && y >= 0 && y < height;
    }

    return {
        forEach(fn) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    fn(x, y, this.get(x, y));
                }
            }
        },
        get(x, y) {
            if (isOnGrid(x, y)) {
                return data[y][x]
            }
        },
        set(x, y, val) {
            if (isOnGrid(x, y) && Math.floor(x) === x && Math.floor(y) === y) {
                data[y][x] = val;
            }
        },
        clone() {
            const clonedGrid = [];
            this.forEach((x,y,value) => {
                if (!clonedGrid[y]) {
                    clonedGrid[y] = [];
                }
                clonedGrid[y][x] = value;
            });
            return buildGrid(clonedGrid);
        },
        toArray() {
            return data;
        }
    };
}

function buildHeap(fnMap = v => v) {
    const values = [];

    function getIndexOfParent(childIndex) {
        console.assert(childIndex > 0);
        return Math.floor((childIndex - 1) / 2);
    }

    function getIndexesOfChildren(parentIndex) {
        console.assert(parentIndex >= 0);
        const firstChildIndex = parentIndex * 2 + 1;
        return [firstChildIndex, firstChildIndex+1].filter(i => i < values.length);
    }

    function swap(i1, i2) {
        console.assert(i1 >= 0 && i1 < values.length);
        console.assert(i2 >= 0 && i2 < values.length);
        [values[i1], values[i2]] = [values[i2], values[i1]];
    }

    function bubbleUp(n) {
        const value = values[n];
        while(n) {
            let parentIndex = getIndexOfParent(n),
                parent = values[parentIndex];

            if (fnMap(parent) <= fnMap(value)) {
                break;
            }
            swap(parentIndex, n);
            n = parentIndex;
        }
    }

    function sinkDown(n) {
        const value = values[n];

        while(true) {
            const indexOfChildToSwap = getIndexesOfChildren(n)
                .reduce((smallestSoFar,i) => fnMap(smallestSoFar[1]) < fnMap(values[i]) ? smallestSoFar : [i, values[i]], [null, value])[0];

            if (indexOfChildToSwap === null) {
                break;
            }
            swap(indexOfChildToSwap, n);
            n = indexOfChildToSwap;
        }
    }

    return {
        insert(value) {
            values.push(value);
            bubbleUp(values.length - 1);
        },
        peek() {
            return values[0]; // 'undefined' if array is empty
        },
        extract() {
            const minValue = values.shift();

            if (values.length) {
                const lastValue = values.pop();
                values.unshift(lastValue);
                sinkDown(0);
            }

            return minValue;
        }
    };
}
