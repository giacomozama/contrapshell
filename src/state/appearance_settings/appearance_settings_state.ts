import Gio from "gi://Gio?version=2.0";
import config from "../../config";
import { generatePalette, rgbaToHex } from "../../utils/colors";
import { createState } from "gnim";

export const [wallpaper, setWallpaper] = createState(config.appearance.wallpaperPath);
export const [generatedPalette, setGeneratedPalette] = createState<string[]>([]);
export const [accent1, setAccent1] = createState(rgbaToHex(config.colors.accent1));
export const [accent2, setAccent2] = createState(rgbaToHex(config.colors.accent2));
// const [addScrim, setAddScrim] = createState(false);

// const SCRIM_HEIGHT = 64;

// const scrimGradient = new giCairo.LinearGradient(0, 0, 0, SCRIM_HEIGHT);
// scrimGradient.addColorStopRGBA(0, 0, 0, 0, 0.5);
// scrimGradient.addColorStopRGBA(1, 0, 0, 0, 0);

// function addScrimToWallpaper(path: string) {
//     const surface = giCairo.ImageSurface.createFromPNG(path);
//     const context = new giCairo.Context(surface);
//     context.rectangle(0, 0, surface.getWidth(), SCRIM_HEIGHT);
//     context.setSource(scrimGradient);
//     context.setOperator(giCairo.Operator.OVER);
//     context.fill();
//     context.$dispose();
//     return surface;
// }

export function applyAppearance(onComplete: () => void) {
    const newAccent1 = accent1.get();
    const newAccent2 = accent2.get();

    if (newAccent1 !== rgbaToHex(config.colors.accent1) || newAccent2 !== rgbaToHex(config.colors.accent2)) {
        const accentsFile = Gio.File.new_for_path(config.appearance.accentsFilePath);
        const fileIOStream = accentsFile.open_readwrite(null);
        fileIOStream.outputStream.write(
            `$shell_accent_1 = ${accent1.get().slice(1)}\n$shell_accent_2 = ${accent2.get().slice(1)}`,
            null
        );
        fileIOStream.close(null);
    }

    const wallpaperPath = wallpaper.get();
    if (wallpaperPath === config.appearance.wallpaperPath) {
        onComplete();
        return;
    }

    // if (addScrim.get()) {
    //     const wallpaperSurface = addScrimToWallpaper(wallpaperPath);
    //     wallpaperSurface.writeToPNG(config.appearance.wallpaperPath);
    //     onComplete();
    //     return;
    // }

    const newWallpaperFile = Gio.File.new_for_path(wallpaperPath);
    const wallpaperFile = Gio.File.new_for_path(config.appearance.wallpaperPath);
    newWallpaperFile.copy(wallpaperFile, Gio.FileCopyFlags.OVERWRITE, null, (cur, tot) => {
        if (cur === tot) {
            onComplete();
        }
    });
}

export function updatePalette() {
    generatePalette(wallpaper.get(), 5).then((p) => {
        if (p[0]) {
            setGeneratedPalette(p.map((c) => rgbaToHex(c!)));
        } else {
            setGeneratedPalette([]);
        }
    });
}
