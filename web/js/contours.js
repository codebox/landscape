function buildContourPlotter(elevation) {
    "use strict";

    // Uses 'Marching Squares' algorithm

    function line(x1, y1, x2, y2) {
        return {x1, y1, x2, y2};
    }

    const boundaryValueLookup = [
        // 0 0
        // 0 0
        (x,y) => [], // Case 0

        // 0 0
        // 1 0
        (x,y) => [line(x, y+0.5, x+0.5, y+1)], // Case 1

        // 0 0
        // 0 1
        (x,y) => [line(x+0.5, y+1, x+1, y+0.5)], // Case 2

        // 0 0
        // 1 1
        (x,y) => [line(x, y+0.5, x+1, y+0.5)], // Case 3

        // 0 1
        // 0 0
        (x,y) => [line(x+0.5, y, x+1, y+0.5)], // Case 4

        // 0 1
        // 1 0
        (x,y) => [line(x+0.5, y, x, y+0.5), line(x+1, y+0.5, x+0.5, y+1)], //TODO ambiguous // Case 5

        // 0 1
        // 0 1
        (x,y) => [line(x+0.5, y, x+0.5, y+1)],// Case 6

        // 0 1
        // 1 1
        (x,y) => [line(x+0.5, y, x, y+0.5)],// Case 7

        // 1 0
        // 0 0
        (x,y) => [line(x+0.5, y, x, y+0.5)],// Case 8

        // 1 0
        // 1 0
        (x,y) => [line(x+0.5, y, x+0.5, y+1)],// Case 9

        // 1 0
        // 0 1
        (x,y) => [line(x+0.5, y, x+1, y+0.5), line(x, y+0.5, x+0.5, y+1)], //TODO ambiguous // Case 10

        // 1 0
        // 1 1
        (x,y) => [line(x+0.5, y, x+1, y+0.5)],// Case 11

        // 1 1
        // 0 0
        (x,y) => [line(x, y+0.5, x+1, y+0.5)],// Case 12

        // 1 1
        // 1 0
        (x,y) => [line(x+0.5, y+1, x+1, y+0.5)],// Case 13

        // 1 1
        // 0 1
        (x,y) => [line(x, y+0.5, x+0.5, y+1)],// Case 14

        // 1 1
        // 1 1
        (x,y) => [] // Case 15
    ]

    function findContour(grid, threshold) {
        function isAbove(x, y) {
            return grid.get(x, y) >= threshold ? 1 : 0;
        }

        const lines = [];

        grid.forEach((x,y) => {
            // 8 4
            // 1 2
            if (x > config.mapWidth - 2 || y > config.mapHeight - 2) {
                return;
            }
            const boundaryValue = 8 * isAbove(x, y) + 4 * isAbove(x+1, y) + isAbove(x, y+1) + 2 * isAbove(x+1, y+1);
            lines.push(...boundaryValueLookup[boundaryValue](x, y));

        });

        return lines;
    }

    return {
        getContours(elevation) {
            const grid = buildGrid(elevation),
                contours = [];
            let contourHeight = config.seaLevel;
            while (contourHeight <= config.maxContour) {
                contours.push(...findContour(grid, contourHeight));
                contourHeight += config.contourSpacing;
            }
            return contours;
        }
    };

}