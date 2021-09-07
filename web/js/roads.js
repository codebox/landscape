function dijkstra(pStart, pEnd) {
    "use strict";
    const COMPASS_DISTANCE = 1,
        DIAGONAL_DISTANCE = Math.sqrt(2);

    function areTheSame(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
    }

    const unvisited = (() => {
        const distance = [],
            minHeap = buildHeap(v => v.d);

        for (let y = 0; y < config.mapHeight; y++) {
            distance[y]=[];
            for (let x = 0; x < config.mapWidth; x++) {
                distance[y][x] = Number.MAX_VALUE;
            }
        }
        minHeap.insert({x: pStart.x, y:pStart.y, d: distance[pStart.y][pStart.x] = 0});

        const unvisitedObj = {
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
                minHeap.insert({x:p.x, y:p.y, d: newValue});
            },
            remove(p) {
                distance[p.y][p.x] = undefined;
            },
            getSmallest() {
                const pSmallest = minHeap.extract();
                unvisitedObj.remove(pSmallest);
                return pSmallest;
            }
        };
        return unvisitedObj;
    })();

    let pCurrent;
    const parents = {finish: null};
    while (pCurrent = unvisited.getSmallest()) {
        unvisited.getUnvisitedNeighbours(pCurrent).forEach(pUnvisitedNeighbour => {
            const currentTentativeDistance = pCurrent.d,
                neighbourTentativeDistance = unvisited.get(pUnvisitedNeighbour),
                newNeighbourTentativeDistance = currentTentativeDistance + pUnvisitedNeighbour.d;
            if (newNeighbourTentativeDistance < neighbourTentativeDistance) {
                pUnvisitedNeighbour = pCurrent;
                unvisited.set(pUnvisitedNeighbour, newNeighbourTentativeDistance);
            }
        });
        console.log(pCurrent)
        if (areTheSame(pCurrent, pEnd)) {
            console.log('found!')
            break;
        }
    }

    const optimalPath = [];
    let c = pEnd;
    while(!areTheSame(c,pStart)) {
        optimalPath.push(c);
        c = parents[c];
    }

    return optimalPath;
}