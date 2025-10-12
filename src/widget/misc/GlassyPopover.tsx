import { Gdk, Gtk } from "ags/gtk4";
import Graphene from "gi://Graphene?version=1.0";
import GObject from "gnim/gobject";
import config from "../../config";
import { gradientStroke } from "../../utils/cairo";
import Gio from "gi://Gio?version=2.0";
import { add_throttled_tick_callback, walkChildren } from "../../utils/gtk";
import { intrinsicElements } from "ags/gtk4/jsx-runtime";
import { CCProps } from "gnim";
import { eyeCandyConfig } from "../../state/eye_candy/eye_candy_state";

// what follows is pure, unadulterated software butchery
// it is an insult to GTK and all of its design principles.

function addBorderToSnapshot(
    snapshot: Gtk.Snapshot,
    clock: Gdk.FrameClock,
    width: number,
    height: number,
    color1: Gdk.RGBA,
    color2: Gdk.RGBA
) {
    const rect = new Graphene.Rect({
        origin: new Graphene.Point({ x: 0, y: 0 }),
        size: new Graphene.Size({ width, height }),
    });
    const cr = snapshot.append_cairo(rect);
    gradientStroke({
        cr,
        width,
        height,
        radius: 18,
        animateBrightness: true,
        animationSpeed: 1.0,
        clock,
        color1,
        color2,
        thickness: 1.4,
    });
    cr.$dispose();
}

const GlassyMenuStack = GObject.registerClass(
    {
        GTypeName: "GlassyMenuStack",
    },
    class GlassyMenuStack extends Gtk.Stack {
        color1: Gdk.RGBA;
        color2: Gdk.RGBA;

        constructor(
            constructProperties: Partial<Gtk.Stack.ConstructorProps> & {
                color1?: Gdk.RGBA;
                color2?: Gdk.RGBA;
            }
        ) {
            const color1 = constructProperties.color1 ?? config.colors.accent1;
            const color2 = constructProperties.color2 ?? config.colors.accent2;

            delete constructProperties.color1;
            delete constructProperties.color2;

            super(constructProperties);

            this.color1 = color1;
            this.color2 = color2;

            this.add_css_class("glassy-menu-stack");
            this.color1 = constructProperties.color1 ?? config.colors.accent1;
            this.color2 = constructProperties.color2 ?? config.colors.accent2;
        }

        vfunc_map() {
            super.vfunc_map();
            if (!eyeCandyConfig.get().animateBorders) return;
            add_throttled_tick_callback(this, 120_000, (w) => {
                w.queue_draw();
                return w.get_mapped();
            });
        }

        vfunc_snapshot(snapshot: Gtk.Snapshot): void {
            super.vfunc_snapshot(snapshot);
            addBorderToSnapshot(
                snapshot,
                this.get_frame_clock()!,
                this.get_width(),
                this.get_height(),
                this.color1,
                this.color2
            );
        }
    }
);

export const GlassyMenu = GObject.registerClass(
    {
        GTypeName: "GlassyMenu",
    },
    class GlassyMenu extends Gtk.PopoverMenu {
        color1: Gdk.RGBA;
        color2: Gdk.RGBA;

        constructor(
            constructProperties: Partial<Gtk.PopoverMenu.ConstructorProps> & {
                color1?: Gdk.RGBA;
                color2?: Gdk.RGBA;
            }
        ) {
            const color1 = constructProperties.color1 ?? config.colors.accent1;
            const color2 = constructProperties.color2 ?? config.colors.accent2;

            delete constructProperties.color1;
            delete constructProperties.color2;

            super(constructProperties);

            this.color1 = color1;
            this.color2 = color2;

            this.hasArrow = false;
            this.set_flags(Gtk.PopoverMenuFlags.NESTED);
            this.set_css_classes(["menu", "glassy-menu", "fading"]);

            const scrolledWindow = this.get_child() as Gtk.ScrolledWindow;
            const glassyStack = new GlassyMenuStack({
                color1: color1 ?? config.colors.accent1,
                color2: color2 ?? config.colors.accent2,
            });

            scrolledWindow.set_child(glassyStack);
        }

        private turnChildStacksIntoGlassyStacks() {
            walkChildren(this, (child) => {
                if (!(child instanceof Gtk.Popover)) return;

                const scrolledWindow = child.get_child() as Gtk.ScrolledWindow;
                const stack = scrolledWindow.get_first_child()!.get_first_child() as Gtk.Stack;
                if (stack.has_css_class("glassy-menu-stack")) return;

                const stackPage = stack.pages.get_item(0) as Gtk.StackPage;
                const content = stackPage.get_child()!;

                let stackChild;
                while ((stackChild = stack.get_first_child())) {
                    stack.remove(stackChild);
                }

                const glassyStack = new GlassyMenuStack({
                    color1: this.color1,
                    color2: this.color2,
                });
                glassyStack.add_named(content, "main");

                scrolledWindow.set_child(glassyStack);
            });
        }

        vfunc_map() {
            this.add_css_class("visible");
            super.vfunc_map();
        }

        vfunc_unmap() {
            this.remove_css_class("visible");
            super.vfunc_unmap();
        }

        set_menu_model(model?: Gio.MenuModel | null): void {
            super.set_menu_model(model);
            this.turnChildStacksIntoGlassyStacks();
        }
    }
);

export const GlassyPopover = GObject.registerClass(
    {
        GTypeName: "GlassyPopover",
    },
    class GlassyPopover extends Gtk.Popover {
        color1: Gdk.RGBA;
        color2: Gdk.RGBA;

        constructor(
            constructProperties: Partial<Gtk.Popover.ConstructorProps> & {
                color1?: Gdk.RGBA;
                color2?: Gdk.RGBA;
            }
        ) {
            const color1 = constructProperties.color1 || config.colors.accent1;
            const color2 = constructProperties.color2 || config.colors.accent2;

            delete constructProperties.color1;
            delete constructProperties.color2;

            super(constructProperties);

            this.color1 = color1;
            this.color2 = color2;

            this.hasArrow = false;
            this.set_css_classes(["fading", "popover-standard-dark"]);
            this.set_overflow(Gtk.Overflow.HIDDEN);
        }

        vfunc_map() {
            super.vfunc_map();
            if (eyeCandyConfig.get().animateBorders) {
                add_throttled_tick_callback(this, 120_000, (w) => {
                    w.queue_draw();
                    return w.get_mapped();
                });
            }
            this.add_css_class("visible");
        }

        vfunc_unmap() {
            super.vfunc_unmap();
            this.remove_css_class("visible");
        }

        vfunc_snapshot(snapshot: Gtk.Snapshot): void {
            super.vfunc_snapshot(snapshot);
            addBorderToSnapshot(
                snapshot,
                this.get_frame_clock()!,
                this.get_width(),
                this.get_height(),
                this.color1,
                this.color2
            );
        }
    }
);

type Props<T extends Gtk.Widget, Props> = CCProps<T, Partial<Props>>;

declare global {
    namespace GlassyWidgets {
        class GlassyPopover extends Gtk.Popover {
            color1: Gdk.RGBA;
            color2: Gdk.RGBA;
        }

        namespace GlassyPopover {
            interface ConstructorProps extends Gtk.PopoverMenu.ConstructorProps {
                color1: Gdk.RGBA | undefined;
                color2: Gdk.RGBA | undefined;
            }
        }

        class GlassyMenu extends Gtk.PopoverMenu {
            color1: Gdk.RGBA;
            color2: Gdk.RGBA;
        }

        namespace GlassyMenu {
            interface ConstructorProps extends Gtk.PopoverMenu.ConstructorProps {
                color1: Gdk.RGBA | undefined;
                color2: Gdk.RGBA | undefined;
            }
        }
    }

    namespace JSX {
        interface IntrinsicElements {
            glassymenu: Props<GlassyWidgets.GlassyMenu, GlassyWidgets.GlassyMenu.ConstructorProps>;
            glassypopover: Props<GlassyWidgets.GlassyPopover, GlassyWidgets.GlassyPopover.ConstructorProps>;
        }
    }
}

Object.assign(intrinsicElements, {
    glassymenu: GlassyMenu,
    glassypopover: GlassyPopover,
});
