import { Gdk, Gtk } from "ags/gtk4";
import { gradientStroke } from "../../utils/cairo";
import { Accessor } from "gnim";
import { add_throttled_tick_callback } from "../../utils/gtk";
import { eyeCandyConfig } from "../../state/eye_candy/eye_candy_state";

export default function GradientBox({
    cssName,
    cssClasses,
    children,
    cornerRadius,
    animationSpeed,
    color1,
    color2,
    thickness,
}: {
    cssName?: string;
    cssClasses?: string[] | Accessor<string[]>;
    children: JSX.Element;
    cornerRadius?: number;
    animationSpeed?: number;
    color1?: Accessor<Gdk.RGBA | undefined>;
    color2?: Accessor<Gdk.RGBA | undefined>;
    thickness?: number;
}) {
    const border = (
        <drawingarea
            canFocus={false}
            canTarget={false}
            cssClasses={["gradient-box-border"]}
            vexpand={true}
            hexpand={true}
            onMap={(self) => {
                if (eyeCandyConfig.get().animateBorders) {
                    add_throttled_tick_callback(self, 120_000, (w) => {
                        w.queue_draw();
                        return w.get_mapped();
                    });
                }
            }}
            $={(self) => {
                self.set_draw_func((_, cr, width, height) => {
                    gradientStroke({
                        cr,
                        width,
                        height,
                        radius: cornerRadius ?? 18,
                        animateBrightness: true,
                        animationSpeed,
                        clock: self.get_frame_clock() ?? undefined,
                        color1: color1?.get(),
                        color2: color2?.get(),
                        thickness,
                    });
                    cr.$dispose();
                });
            }}
        />
    );

    return (
        <box
            cssName={cssName ?? "gradientbox"}
            cssClasses={cssClasses}
            children={[children, border]}
            layoutManager={new Gtk.BinLayout()}
        />
    );
}
