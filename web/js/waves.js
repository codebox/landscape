function buildWavePlotter(model, seaLevel) {
    "use strict";

    function findShallowWater(maxElevation, minElevation) {
        const shallowWaterPoints = [];
        model.getElevationGrid().forEach((x,y,el) => {
            if (maxElevation >= el && minElevation <= el) {
                shallowWaterPoints.push({x,y});
            }
        });
        return shallowWaterPoints;
    }

    function buildProximityList(radius) {
        const list = [];
        for (let x=-radius; x<=radius; x++) {
            for (let y=-radius; y<=radius; y++) {
                list.push({x, y, d: Math.sqrt(x*x + y*y)});
            }
        }
        return list.filter(p => p.d <= radius);
    }

    function findPointsThisCloseToLand(points, distance, delta=0.5) {
        const proximityList = buildProximityList(distance + delta),
            matchingPoints = [];

        points.forEach(p => {
            const closestDistanceToShore = proximityList.reduce((smallestDistanceSoFar, proximityPoint) => {
                if (smallestDistanceSoFar < proximityPoint.d) {
                    return smallestDistanceSoFar;
                }
                const elevation = model.getElevationGrid().get(Math.floor(p.x + proximityPoint.x), Math.floor(p.y + proximityPoint.y));
                if (elevation !== undefined && elevation >= seaLevel) {
                    return Math.min(smallestDistanceSoFar, proximityPoint.d);
                } else {
                    return smallestDistanceSoFar;
                }
            }, distance * 2);

            if (Math.abs(closestDistanceToShore - distance) <= delta) {
                matchingPoints.push(p);
            }
        });

        return matchingPoints;
    }

    return {
        getWavePoints() {
            const shallowWater = findShallowWater(config.seaLevel, config.seaLevel - config.waveDepthLimit),
                wavePoints = [];

            for (let i=0; i<config.waveCount; i++) {
                wavePoints.push(findPointsThisCloseToLand(shallowWater, config.waveSeparation * (i + 1)));
            }

            return wavePoints;
        }
    };
}