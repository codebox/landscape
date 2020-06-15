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