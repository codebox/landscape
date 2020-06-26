function dijkstra(grid, pStart, pEnd) {
    "use strict";
    const COMPASS_DISTANCE = 1,
        DIAGONAL_DISTANCE = Math.sqrt(2);

    function areTheSame(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
    }

    const unvisited = (() => {
        const distance = [];
        for (let y = 0; y < config.mapHeight; y++) {
            distance[y]=[];
            for (let x = 0; x < config.mapWidth; x++) {
                distance[y][x] = Number.MAX_VALUE;
            }
        }
        distance[pStart.y][pStart.x] = 0;

        const unvisitedObj = {
            forEach(fn) {
                for (let y = 0; y < config.mapHeight; y++) {
                    for (let x = 0; x < config.mapWidth; x++) {
                        const p = {x,y};
                        if (unvisitedObj.contains(p)) {
                            fn(p, unvisitedObj.get(p));
                        }
                    }
                }
            },
            getUnvisitedNeighbours(p) {
                return [
                    {x:p.x-1, y:p.y-1, d: DIAGONAL_DISTANCE},
                    {x:p.x,   y:p.y-1, d: COMPASS_DISTANCE},
                    {x:p.x+1, y:p.y-1, d: DIAGONAL_DISTANCE},
                    {x:p.x-1, y:p.y,   d: COMPASS_DISTANCE},
                    {x:p.x+1, y:p.y,   d: COMPASS_DISTANCE},
                    {x:p.x-1, y:p.y+1, d: DIAGONAL_DISTANCE},
                    {x:p.x,   y:p.y+1, d: COMPASS_DISTANCE},
                    {x:p.x+1, y:p.y+1, d: DIAGONAL_DISTANCE}
                ].filter(unvisitedObj.contains);
            },
            contains(p) {
                return unvisitedObj.get(p) !== undefined;
            },
            get(p) {
                return distance[p.y] && distance[p.y][p.x];
            },
            set(p, newValue) {
                distance[p.y][p.x] = newValue;
            },
            remove(p) {
                unvisitedObj.set(p, undefined);
            },
            getSmallest() {
                // TODO replace this with priority queue

                let pSmallest, smallestDistance = Number.MAX_VALUE;

                unvisitedObj.forEach((p, distance) => {
                    if (distance < smallestDistance) {
                        smallestDistance = distance;
                        pSmallest = p;
                    }
                });

                return pSmallest;
            }
        };
        return unvisitedObj;
    })();

    let pCurrent = pStart;
    while (!areTheSame(pCurrent, pEnd)) {
        unvisited.getUnvisitedNeighbours(pCurrent).forEach(pUnvisitedNeighbour => {
            const currentTentativeDistance = unvisited.get(pCurrent),
                neighbourTentativeDistance = unvisited.get(pUnvisitedNeighbour),
                newNeighbourTentativeDistance = currentTentativeDistance + pUnvisitedNeighbour.d;

            unvisited.set(pUnvisitedNeighbour, Math.min(newNeighbourTentativeDistance, neighbourTentativeDistance));
        });
        unvisited.remove(pCurrent);
        pCurrent = unvisited.getSmallest();
    }

    return unvisited.get(pCurrent);
}