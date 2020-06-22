function buildSmoother(model, seaLevel, radius, ρ=1) {
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

    return {
        smooth(p) {
            "use strict";
            const defaultElevation = model.getElevationGrid().get(p.x, p.y);

            let smoothedValue = 0;
            for (let x=-radius; x<=radius; x++) {
                for (let y=-radius; y<=radius; y++) {
                    let elevation = model.getElevationGrid().get(p.x + x, p.y + y);
                    if (elevation === undefined) {
                        elevation = defaultElevation;
                    }
                    if (elevation <= seaLevel) {
                        return defaultElevation;
                    }
                    smoothedValue += elevation * overlay[x][y] / total;
                }
            }

            return smoothedValue;
        }
    };
}