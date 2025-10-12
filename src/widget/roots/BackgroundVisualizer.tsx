import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { createRoot } from "gnim";
import GObject from "gnim/gobject";
import Gsk from "gi://Gsk?version=4.0";
import Graphene from "gi://Graphene?version=1.0";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import { currentDateString } from "../../state/time/time_state";
import { PolyhedronToy } from "../polyhedron_toy/PolyhedronToy";
import config from "../../config";

const backgroundVisualizerTime = currentDateString.as((t) => t.toUpperCase().split(", "));

const MaskedBox = GObject.registerClass(
    {
        GTypeName: "MaskedBox",
    },
    class MaskedBox extends Gtk.Box {
        constructor(constructProperties = {}) {
            super(constructProperties);
            this.set_layout_manager(new Gtk.BinLayout());
            this.set_vexpand(true);
            this.set_hexpand(true);
        }

        private texture: Gdk.Texture | undefined;
        private bounds: Graphene.Rect | undefined;

        vfunc_dispose(): void {
            this.texture = undefined;
            this.bounds = undefined;
        }

        vfunc_snapshot(snapshot: Gtk.Snapshot): void {
            if (!config.appearance.wallpaperMaskPath) {
                return super.vfunc_snapshot(snapshot);
            }

            if (!this.texture) {
                const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(
                    config.appearance.wallpaperMaskPath,
                    this.get_width(),
                    this.get_height(),
                    true
                );
                this.texture = Gdk.Texture.new_for_pixbuf(pixbuf);
                this.bounds = new Graphene.Rect({
                    origin: new Graphene.Point({ x: 0, y: 0 }),
                    size: new Graphene.Size({ width: this.get_width(), height: this.get_height() }),
                });
            }

            snapshot.push_mask(Gsk.MaskMode.ALPHA);
            snapshot.append_texture(this.texture, this.bounds!);
            snapshot.pop();

            super.vfunc_snapshot(snapshot);
            snapshot.pop();
        }
    }
);

export function BackgroundVisualizer() {
    const monitor = app.monitors.find((m) => m.connector === config.backgroundVisualizer.showOnMonitor);
    if (!monitor) return undefined;

    return createRoot((dispose) => {
        return (
            <window
                name="background-visualizer"
                class="BackgroundVisualizer"
                // MUST be above the gdkmonitor prop
                layer={Astal.Layer.BACKGROUND}
                gdkmonitor={monitor}
                exclusivity={Astal.Exclusivity.IGNORE}
                anchor={
                    Astal.WindowAnchor.TOP |
                    Astal.WindowAnchor.RIGHT |
                    Astal.WindowAnchor.BOTTOM |
                    Astal.WindowAnchor.LEFT
                }
                vexpand={true}
                hexpand={true}
                application={app}
                onDestroy={dispose}
            >
                <MaskedBox>
                    <box>
                        <box valign={Gtk.Align.START}>
                            <PolyhedronToy />
                        </box>
                        <box hexpand={true} />
                        <box
                            class="background-clock"
                            orientation={Gtk.Orientation.VERTICAL}
                            widthRequest={1000}
                            halign={Gtk.Align.END}
                            valign={Gtk.Align.START}
                        >
                            <label
                                class="time"
                                label={backgroundVisualizerTime.as((d) => d[1])}
                                justify={Gtk.Justification.FILL}
                                xalign={1}
                                halign={Gtk.Align.END}
                                valign={Gtk.Align.START}
                            />
                            <label
                                class="date"
                                label={backgroundVisualizerTime.as((d) => d[0])}
                                justify={Gtk.Justification.FILL}
                                xalign={1}
                                halign={Gtk.Align.END}
                                valign={Gtk.Align.START}
                            />
                        </box>
                    </box>
                </MaskedBox>
            </window>
        );
    }) as Gtk.Window;
}
