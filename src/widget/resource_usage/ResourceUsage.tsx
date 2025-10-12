import { Gtk } from "ags/gtk4";
import { Accessor, onCleanup } from "gnim";
import { resourceUsage } from "../../state/resource_usage/resource_usage_state";
import config from "../../config";
import giCairo from "cairo";
import { CURSOR_HELP } from "../../utils/gtk";

// function ResourceDial({ iconName, percentage }: { iconName: string; percentage: Accessor<number> }) {
//     return (
//         <box orientation={Gtk.Orientation.HORIZONTAL} cssName="resource-dial" spacing={8}>
//             <image iconName={iconName} />
//             <label label={percentage.as((p) => `${p.toFixed(0).padStart(3, " ")}%`)} xalign={1} hexpand={true} />
//         </box>
//     );
// }

const STROKE_WIDTH = 4;
const CIRCLE_GAP = Math.PI / 8;
const START_ANGLE = -(3 / 2) * Math.PI + CIRCLE_GAP;

function drawDial(cr: giCairo.Context, width: number, height: number, fraction: number) {
    cr.setLineWidth(STROKE_WIDTH);
    cr.setLineCap(giCairo.LineCap.ROUND);

    const radius = (width - STROKE_WIDTH) / 2;

    cr.arc(width / 2, height / 2, radius, START_ANGLE, Math.PI / 2 - CIRCLE_GAP);
    cr.setSourceRGBA(1, 1, 1, 0.2);
    cr.stroke();

    cr.arc(width / 2, height / 2, radius, START_ANGLE, START_ANGLE + (2 * Math.PI - CIRCLE_GAP * 2) * fraction);

    const { red, green, blue, alpha } = config.colors.accent2;
    cr.setSourceRGBA(red, green, blue, alpha);
    cr.stroke();
}

function ResourceDial({
    name,
    iconName,
    percentage,
    iconMargin = 0,
}: {
    name: string;
    iconName: string;
    percentage: Accessor<number>;
    // cause the nvidia icon looks 1 px off to me and that bothers me a lot
    iconMargin?: number;
}) {
    return (
        <box
            layoutManager={new Gtk.BinLayout()}
            tooltipMarkup={percentage.as((p) => `<b>${name}:</b> ${p.toFixed(0).padStart(3, " ")}%`)}
        >
            <drawingarea
                widthRequest={30}
                heightRequest={30}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                $={(self) => {
                    self.set_draw_func((_, cr, width, height) => {
                        drawDial(cr, width, height, percentage.get() / 100);
                        cr.$dispose();
                    });

                    onCleanup(
                        percentage.subscribe(() => {
                            self.queue_draw();
                        })
                    );
                }}
            />
            <image
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                iconName={iconName}
                marginEnd={iconMargin}
                pixelSize={14}
            />
        </box>
    );
}

export function ResourceUsageDash() {
    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            cssName="resource-dials-container"
            spacing={6}
            marginStart={4}
            marginEnd={4}
            valign={Gtk.Align.CENTER}
        >
            <ResourceDial name="CPU" iconName="cpu-symbolic" percentage={resourceUsage.as((r) => r.cpu)} />
            <ResourceDial name="RAM" iconName="ram-symbolic" percentage={resourceUsage.as((r) => r.ram)} />
            <ResourceDial
                name="GPU"
                iconName="nvidia-card-symbolic"
                percentage={resourceUsage.as((r) => r.gpu)}
                iconMargin={2}
            />
        </box>
    );
}
