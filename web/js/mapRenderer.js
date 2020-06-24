function buildRenderer(elCanvas) {
    "use strict";

    const canvas = buildCanvas(elCanvas, config.mapWidth, config.mapHeight);

    function buildRangeShifter(minIn, maxIn, minOut, maxOut) {
        return v => {
            return minOut + (maxOut - minOut) * (v - minIn) / (maxIn - minIn);
        };
    }
    function buildValueRounder(step) {
        return value => {
            return Math.floor(value / step) * step;
        };
    }

    const getElevationColour = (() => {
        const getSeaLightness = buildRangeShifter(-1, config.seaLevel, 0, 50),
            getGroundLightnessEl = buildRangeShifter(config.seaLevel, config.snowLevel, 30, 70),
            getGroundLightnessIl = buildRangeShifter(0, 1, 0.6, 1),
            getGroundSaturation = buildRangeShifter(config.seaLevel, config.snowLevel, 100, 0),
            round = buildValueRounder(config.contourSpacing);

        return (elevation, illumination) => {
            //console.assert(elevation >= -1 && elevation <= 1);
            elevation = round(elevation);
            if (elevation < config.seaLevel) {
                return `hsl(220,100%,${getSeaLightness(elevation)}%)`;

            } else if (elevation > config.snowLevel) {
                return `hsl(0,0%,${getGroundLightnessIl(illumination) * 100}%)`;

            } else {
                return `hsl(115,${getGroundSaturation(elevation)}%,${getGroundLightnessEl(elevation) * getGroundLightnessIl(illumination)}%)`;
            }
        };
    })();


    function renderer(transformCoords) {
        function drawElevationSquare(grid, x, y, v) {
            function magnitude(v) {
                return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
            }
            const elevationFactor = buildRangeShifter(config.seaLevel, 1, 1, 10000)(v),
                // Diagonal 1
                a = {
                    x: 1,
                    y: 0,
                    z: elevationFactor * (grid.get(x+1, y) - v)
                },
                // Diagonal 2
                b = {
                    x: 0,
                    y: 1,
                    z: elevationFactor * (grid.get(x, y+1) - v)
                },
                light = config.sunPosition,
                normal = {
                    x: a.y * b.z - a.z * b.y,
                    y: a.z * b.x - a.x * b.z,
                    z: a.x * b.y - a.y * b.x
                },
                cosIlluminationAngle =
                    (light.x * normal.x + light.y * normal.y + light.z * normal.z) / (magnitude(light) * magnitude(normal)),
                illumination = Math.max(0, cosIlluminationAngle),
                transformedCoords = transformCoords(x,y,v);

            canvas.drawRectangle(transformedCoords.x, transformedCoords.y, transformedCoords.w, transformedCoords.h, getElevationColour(v, illumination));
        }

        return {
            renderLandscape(elevation) {
                const elevationGrid = buildGrid(elevation);
                elevationGrid.forEach((x,y,v) => drawElevationSquare(elevationGrid, x, y, v));
            },
            renderContours(contours) {
                canvas.drawLines(contours.map(c => {
                    const newP1 = transformCoords(c.x1, c.y1, c.elevation),
                        newP2 = transformCoords(c.x2, c.y2, c.elevation);
                    return {
                        x1: newP1.x,
                        y1: newP1.y,
                        x2: newP2.x + newP2.w,
                        y2: newP2.y + newP2.h
                    };
                }));
            },
            renderWaves(waves) {
                const getColour = buildRangeShifter(0, waves.length-1, 70, 50);
                waves.forEach((wave, i) => {
                    wave.forEach(p => {
                        const {x,y,w,h} = transformCoords(p.x, p.y, config.seaLevel);
                        canvas.drawRectangle(x, y, w, h, `hsla(220, 100%,${getColour(i)}%, 0.5)`);
                    });
                });
            },
            renderRivers(riverPoints) {
                riverPoints.forEach(p => {
                    const {x,y,w,h} = transformCoords(p.x, p.y, p.el);
                    canvas.drawRectangle(x, y, w, h, `rgba(0,80,240,${Math.min(1, p.fill/1000)})`);
                });
            },
            renderErosionPaths(paths) {
                paths.forEach(path => {
                    path.forEach((p,i) => {
                        const {x,y,w,h} = transformCoords(p.x, p.y, p.el);
                        canvas.drawRectangle(x, y, w, h, i ? 'blue' : 'white')
                    });
                });
            }
        };
    }

    return {
        twoD() {
            return renderer((x,y,el) => {
                return {x,y,w:1,h:1};
            });
        },
        threeD() {
            return renderer((x,y,el) => {
                const widthForY = buildRangeShifter(0, config.mapHeight, 1, 3)(y),
                    offsetForY = buildRangeShifter(0, config.mapHeight, config.mapWidth, 0)(y),
                    x3d = x * widthForY + offsetForY,
                    heightForY = 1.0,
                    offsetForY2 = Math.max(el, config.seaLevel) * buildRangeShifter(0, config.mapHeight, 100, 400)(y),
                    y3d = y * heightForY - offsetForY2 + 100;

                return {x: x3d,y: y3d,w:widthForY, h:heightForY};
            });
        }
    };
}