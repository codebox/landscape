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
