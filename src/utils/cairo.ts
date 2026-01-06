import giCairo from "cairo";
import config from "../config";
import { Gdk } from "ags/gtk4";

function rotate_around_center(x: number, y: number, cx: number, cy: number, angle: number) {
    if (!angle) return [x, y];

    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    const tx = x - cx;
    const ty = y - cy;

    const rx = tx * cos - ty * sin;
    const ry = tx * sin + ty * cos;

    return [rx + cx, ry + cy];
}

export function getAccentGradient({
    width = 0,
    height = 0,
    animateBrightness = false,
    animationSpeed = 0,
    clock,
    color1,
    color2,
}: {
    width?: number;
    height?: number;
    animateBrightness?: boolean;
    animationSpeed?: number;
    clock?: Gdk.FrameClock;
    color1?: Gdk.RGBA;
    color2?: Gdk.RGBA;
}) {
    color1 = color1 ?? config.colors.accent1;
    color2 = color2 ?? config.colors.accent2;

    let angle = 0;

    if (width && height && animationSpeed && clock) {
        const period = 3_000_000 / animationSpeed;
        angle = ((clock.get_frame_time() % period) / period) * 2 * Math.PI;
    }

    const [rx0, ry0] = rotate_around_center(0.0, 0.0, width / 2.0, height / 2.0, angle);
    const [rx1, ry1] = rotate_around_center(width, height, width / 2.0, height / 2.0, angle);

    if (angle && animateBrightness) {
        const brightness = 1 + (Math.cos(angle) + 1) * 0.1;

        let { red: r1, green: g1, blue: b1, alpha: a1 } = color1;
        color1 = new Gdk.RGBA({ red: r1 * brightness, green: g1 * brightness, blue: b1 * brightness, alpha: a1 });

        let { red: r2, green: g2, blue: b2, alpha: a2 } = color2;
        color2 = new Gdk.RGBA({ red: r2 * brightness, green: g2 * brightness, blue: b2 * brightness, alpha: a2 });
    }

    const gradient = new giCairo.LinearGradient(rx0, ry0, rx1, ry1);

    const { red: r1, green: g1, blue: b1, alpha: a1 } = color1;
    const { red: r2, green: g2, blue: b2, alpha: a2 } = color2;

    gradient.addColorStopRGBA(0, r1, g1, b1, a1);
    gradient.addColorStopRGBA(1, r2, g2, b2, a2);

    return gradient;
}
