import { Gdk } from "ags/gtk4";
import Gio from "gi://Gio?version=2.0";
import { createRoot } from "gnim";

const INTERFACE_XML = `
<node>
  <interface name="st.contraptioni.AutoPalette1">
    <method name="ExtractPaletteRgb">
      <arg name="path" type="s" direction="in"/>
      <arg name="algorithm" type="s" direction="in"/>
      <arg name="theme" type="s" direction="in"/>
      <arg name="count" type="u" direction="in"/>
      <arg name="no_resize" type="b" direction="in"/>
      <arg type="aay" direction="out"/>
    </method>
  </interface>
</node>
`;

export type AutoPaletteState = {
    generatePalette: (
        imagePath: string,
        colors: number,
        theme: string | undefined,
        algorithm: string
    ) => Promise<Gdk.RGBA[]>;
};

let autoPaletteStateInstance: AutoPaletteState | null = null;

function createAutoPaletteState() {
    const proxy = Gio.DBusProxy.makeProxyWrapper(INTERFACE_XML)(
        Gio.DBus.session,
        "st.contraptioni.AutoPalette",
        "/st/contraptioni/AutoPalette"
    );

    async function generatePalette(
        imagePath: string,
        colors: number,
        theme: string | undefined,
        algorithm: string
    ): Promise<Gdk.RGBA[]> {
        try {
            const rgbColors = (await proxy.ExtractPaletteRgbAsync(
                imagePath,
                algorithm,
                theme ?? "",
                colors,
                false
            )) as number[][];
            return rgbColors.map(
                ([r, g, b]) =>
                    new Gdk.RGBA({
                        red: r / 255,
                        green: g / 255,
                        blue: b / 255,
                    })
            );
        } catch (e) {
            console.error(`Failed to extract palette from ${imagePath}:`, e);
            // Return an empty array on failure to maintain a consistent return type.
            return [];
        }
    }

    autoPaletteStateInstance = {
        generatePalette,
    };

    return autoPaletteStateInstance;
}

export function autoPaletteState() {
    return autoPaletteStateInstance ?? createRoot(createAutoPaletteState);
}
