export function bezierEasing(p1: { x: number; y: number }, p2: { x: number; y: number }) {
    const arr = [0];
    const stepArr = 0.05;
    const stepBaz = 0.05;
    const baz = bezierEase(p1, p2);
    let [prevBaz, nextBaz, tBaz] = [{ x: 0, y: 0 }, baz(stepBaz), stepBaz];
    for (let x = stepArr; x <= 1 - stepArr / 2; x += stepArr) {
        while (x > nextBaz.x && tBaz < 2) {
            prevBaz = nextBaz;
            tBaz += stepBaz;
            nextBaz = baz(tBaz);
        }
        arr.push(linInp(x, prevBaz.x, nextBaz.x, prevBaz.y, nextBaz.y));
    }
    arr.push(1);

    return (fraction: number) => {
        const iLeft = Math.min(Math.max(Math.floor(fraction / stepArr), 0), arr.length - 2);
        return linInp(fraction, iLeft * stepArr, (iLeft + 1) * stepArr, arr[iLeft], arr[iLeft + 1]);
    };

    function linInp(x: number, xFrom: number, xTo: number, yFrom: number, yTo: number) {
        return ((x - xFrom) / (xTo - xFrom)) * (yTo - yFrom) + yFrom;
    }

    function bezierEase(p1: { x: number; y: number }, p2: { x: number; y: number }) {
        const cX = 3 * p1.x;
        const cY = 3 * p1.y;
        const bX = 3 * (p2.x - p1.x) - cX;
        const bY = 3 * (p2.y - p1.y) - cY;
        const aX = 1 - cX - bX;
        const aY = 1 - cY - bY;
        return (t: number) => {
            const x = ((aX * t + bX) * t + cX) * t;
            const y = ((aY * t + bY) * t + cY) * t;
            return { x, y };
        };
    }
}
