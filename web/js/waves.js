function buildWavePlotter(model) {
    "use strict";

    function binarySearchIndex(arr, target, fnMap) {
        let upper = arr.length - 1,
            lower = 0;

        while(lower <= upper) {
            const index = (upper + lower) >> 1,
                value = fnMap(arr[index]);

            if (value === target) {
                return index;

            } else if (value > target) {
                upper = index - 1;

            } else {
                lower = index + 1;
            }
        }
        return;
    }

    function buildContourWrapper(contour) {
        const sortedByStartX = [...contour].sort((p1, p2) => p1.x1 - p2.x1),
            sortedByEndX = [...contour].sort((p1, p2) => p1.x2 - p2.x2);

        return {
            findLinesAt(x, y) {
                function findNeighboursWithSameValue(arr, startIndex, fnMap) {
                    const matchingNeighbourIndexes = [],
                        targetValue = fnMap(arr[startIndex]);

                    let i = startIndex+1;
                    while(i < arr.length && fnMap(arr[i]) === targetValue) {
                        matchingNeighbourIndexes.push(i++);
                    }

                    i = startIndex-1;
                    while(i >= 0 && fnMap(arr[i]) === targetValue) {
                        matchingNeighbourIndexes.push(i--);
                    }
                    return matchingNeighbourIndexes;
                }

                function findLinesStartingAt(x, y) {
                    const getStartingX = l => l.x1,
                        index = binarySearchIndex(sortedByStartX, x, getStartingX);

                    if (index === undefined) {
                        return [];
                    }

                    const indexes = [index, ...findNeighboursWithSameValue(sortedByStartX, index, getStartingX)],
                        matchingLineIndexes = indexes.filter(i => sortedByStartX[i].y1 === y);

                    const matches = [];
                    matchingLineIndexes.sort().reverse().forEach(i => {
                        matches.push(...sortedByStartX.splice(i, 1));
                    });
                    return matches;
                }

                function findLinesEndingAt(x,y) {
                    const getEndingX = l => l.x2,
                        index = binarySearchIndex(sortedByEndX, x, getEndingX);

                    if (index === undefined) {
                        return [];
                    }

                    const indexes = [index, ...findNeighboursWithSameValue(sortedByEndX, index, getEndingX)],
                        matchingLineIndexes = indexes.filter(i => sortedByEndX[i].y2 === y);

                    const matches = [];
                    matchingLineIndexes.sort().reverse().forEach(i => {
                        matches.push(...sortedByEndX.splice(i, 1));
                    });
                    return matches;
                }

                return [...findLinesStartingAt(x,y), ...findLinesEndingAt(x,y)];
            }
        };
    }

    function sortAndBatchFragments(coastalContour) {
        function buildChain(pInit) {
            const points = [{x: pInit.x1, y: pInit.y1},{x: pInit.x2, y: pInit.y2}];

            const chain = {
                add(p) {
                    console.assert(
                        (p.x1 === chain.start.x && p.y1 === chain.start.y) ||
                        (p.x2 === chain.start.x && p.y2 === chain.start.y) ||
                        (p.x2 === chain.end.x && p.y2 === chain.end.y) ||
                        (p.x1 === chain.end.x && p.y1 === chain.end.y)
                    );
                    if (p.x1 === chain.start.x) {
                        points.unshift({x: p.x2, y: p.y2});
                    } else if (p.x2 === chain.start.x) {
                        points.unshift({x: p.x1, y: p.y1});
                    } else if (p.x1 === chain.end.x) {
                        points.push({x: p.x2, y: p.y2});
                    } else {
                        points.push({x: p.x1, y: p.y1});
                    }
                },
                get start() {
                    return points[0];
                },
                get end() {
                    return points[points.length - 1];
                },
                list() {
                    return points;
                }
            };
            return chain;
        }

        const wrapper = buildContourWrapper(coastalContour),
            chain = buildChain(coastalContour[0]);

        while(true) {
            const lines = wrapper.findLinesAt(chain.start.x, chain.start.y);
            if (!lines.length) {
                break;
            } else {
                chain.add(lines[0]);
            }
        }

        while(true) {
            const lines = wrapper.findLinesAt(chain.end.x, chain.end.y);
            if (!lines.length) {
                break;
            } else {
                chain.add(lines[0]);
            }
        }

console.log(chain.list())
        return [];
    }

    function smoothBatch(batch, smoothing) {

    }

    function findDownwardNormal(line) {

    }

    return {
        getWaveLines(coastalContour) {
            const sortedFragmentBatches = sortAndBatchFragments(coastalContour);

            const SMOOTHING = 2, WAVE_COUNT = 5, WAVE_SPACING = 3, wavePointBatches = [];
            sortedFragmentBatches.forEach(batch => {
                const smoothedBatch = smoothBatch(batch, SMOOTHING),
                    wavePointsForThisBatch = Array(WAVE_COUNT).fill([]);
                smoothedBatch.forEach(line => {
                    const normal = findDownwardNormal(line); // {x,y,gx,gy}
                    for (let waveIndex=0; waveIndex < WAVE_COUNT; waveIndex++) {
                        wavePointsForThisBatch[waveIndex].push({
                            x: normal.x + normal.gx * (waveIndex + 1) * WAVE_SPACING,
                            y: normal.y + normal.gy * (waveIndex + 1) * WAVE_SPACING
                        });
                    }
                    wavePointBatches.push(wavePointsForThisBatch);
                });
            });

            // const w = buildContourWrapper(coastalContour);
            // console.log(w.findLinesAt(coastalContour[0].x2, coastalContour[0].y2))

            return [];
        }
    };
}