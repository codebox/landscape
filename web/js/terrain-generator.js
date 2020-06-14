const terrainGenerator = (() => {
    "use strict";

    // function getRndForIteration(iteration) {
    //     return rnd(-0.5, 0.5) * 0.3;
    // }


    function perlin(s){
        const v1 = rndVector(0,0),
            v2 = rndVector(1,0),
            v3 = rndVector(0,1),
            v4 = rndVector(1,1);

        const result = [];
        for (let xs=0; xs<s; xs++) {
            result[xs] = [];
            for (let ys=0; ys<s; ys++) {
                const xy = {x: xs/s, y: ys/s},
                    v1_xy = vectorFromTo(v1, xy),
                    v2_xy = vectorFromTo(v2, xy),
                    v3_xy = vectorFromTo(v3, xy),
                    v4_xy = vectorFromTo(v4, xy),

                    dp_v1_xy = ease(dotProduct(v1, v1_xy)),
                    dp_v2_xy = ease(dotProduct(v2, v2_xy)),
                    dp_v3_xy = ease(dotProduct(v3, v3_xy)),
                    dp_v4_xy = ease(dotProduct(v4, v4_xy));
                result[xs][ys] = (dp_v1_xy + dp_v2_xy + dp_v3_xy + dp_v4_xy) / 4;
            }
        }
        return result;
    }

    function buildPerlinSquare(p00, p10, p01, p11) {
        function vectorFromTo(pFrom, pTo) {
            return {
                x: pFrom.x,
                y: pFrom.y,
                gx: pTo.x - pFrom.x,
                gy: pTo.y - pFrom.y
            };
        }
        function dotProduct(v1, v2) {
            return v1.gx * v2.gx + v1.gy * v2.gy;
        }
        function ease(x) {
            return x * x * (3 - 2 * x);
        }

        const f = (x,y) => {
            console.assert(x>=0 && x<= 1 && y >= 0 && y <= 1);
            const xy = {x:ease(x), y:ease(y)},
                p00_xy = vectorFromTo(p00, xy),
                p10_xy = vectorFromTo(p10, xy),
                p01_xy = vectorFromTo(p01, xy),
                p11_xy = vectorFromTo(p11, xy),

                dp00 = ease(dotProduct(p00_xy, p00)),
                dp10 = ease(dotProduct(p10_xy, p10)),
                dp01 = ease(dotProduct(p01_xy, p01)),
                dp11 = ease(dotProduct(p11_xy, p11));

            function lerp(a,b,x){
                return a + x * (b - a);
            }
            // return (dp00 + dp10 + dp01 + dp11) / 4;
            const r1 = lerp(dp00, dp10, x),
                r2 = lerp(dp01, dp11, x);
            return lerp(r1, r2, y);
        };
        f.p00=p00;
        f.p10=p10;
        f.p01=p01;
        f.p11=p11;
        return f;
    }

    return {
        generateModel(size, valuesPerUnit) {
            function rndGradient() {
                const a = rnd(Math.PI * 2);
                return {gx: Math.sin(a), gy: Math.cos(a)};
            }
            function vectorFromGradient(x,y,g) {
                return {x, y, gx: g.gx, gy: g.gy};
            }

            const model = modelBuilder.build(size * valuesPerUnit, size * valuesPerUnit),
                pointGradients = modelBuilder.build(size + 1, size + 1),
                perlinSquares = modelBuilder.build(size, size);

            pointGradients.forEachSet(rndGradient);

            perlinSquares.forEachSet((f,x,y) => {
                const p00 = vectorFromGradient(0,0,pointGradients.get(x,y)),
                    p10 = vectorFromGradient(1,0,pointGradients.get(x+1,y)),
                    p01 = vectorFromGradient(0,1,pointGradients.get(x,y+1)),
                    p11 = vectorFromGradient(1,1,pointGradients.get(x+1,y+1));
                return buildPerlinSquare(p00, p10, p01, p11)
            })

            console.log(perlinSquares.data)

            model.forEachSet((v,x,y) => {
                const square = perlinSquares.get(Math.floor(x/valuesPerUnit), Math.floor(y/valuesPerUnit));

                const r = square((0.5 + x%valuesPerUnit)/valuesPerUnit, (0.5 + y%valuesPerUnit)/valuesPerUnit);
                return r;

            });

            return model;



            // let currentModelSize = 1,
            //     currentModel = modelBuilder.build(1,1);
            //
            // for (let i = 0; i < iterations; i++) {
            //     currentModelSize *= 2;
            //     let newModel = modelBuilder.build(currentModelSize, currentModelSize);
            //     currentModel.forEachSet((value, x, y) => {
            //         newModel.set(x*2,   y*2,   value + getRndForIteration(i));
            //         newModel.set(x*2+1, y*2,   value + getRndForIteration(i));
            //         newModel.set(x*2,   y*2+1, value + getRndForIteration(i));
            //         newModel.set(x*2+1, y*2+1, value + getRndForIteration(i));
            //     });
            //     currentModel = newModel;
            // }
            // return currentModel;
        }
    };
})();