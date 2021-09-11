importScripts('../util.js', '../config.js');

self.addEventListener('message', event => {
    const elevation = event.data;

    function buildOverlay(radius, ρ) {
        "use strict";
        function calculateOverlayValue(x,y) {
            "use strict";
            return Math.exp(-(x * x + y * y) / (2 * ρ * ρ)) / (2 * Math.PI * ρ * ρ);
        }

        const overlay = [];
        let total = 0;
        for (let x=-radius; x<=radius; x++) {
            overlay[x] = [];
            for (let y=-radius; y<=radius; y++) {
                total += overlay[x][y] = calculateOverlayValue(x, y);
            }
        }

        for (let x=-radius; x<=radius; x++) {
            for (let y=-radius; y<=radius; y++) {
                overlay[x][y] /= total;
            }
        }

        return overlay;
    }

    const overlay = buildOverlay(config.smoothing.radius, config.smoothing.ρ);

    const grid = buildGrid(elevation),
        newElevations = grid.clone(),
        radius = config.smoothing.radius;

    grid.forEach((x,y,defaultElevation) => {
        let smoothedValue = 0;
        for (let xOffset=-radius; xOffset<=radius; xOffset++) {
            for (let yOffset=-radius; yOffset<=radius; yOffset++) {
                let elevation = grid.get(x + xOffset, y + yOffset);
                if (elevation === undefined) {
                    elevation = defaultElevation;
                }
                if (elevation <= config.seaLevel) {
                    return defaultElevation;
                }
                smoothedValue += elevation * overlay[xOffset][yOffset];
            }
        }
        newElevations.set(x,y,smoothedValue);
    });

    self.postMessage(newElevations.toArray());
}, false);