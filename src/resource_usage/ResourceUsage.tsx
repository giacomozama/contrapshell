import { Gtk } from "ags/gtk4";
import { Accessor, createEffect, onCleanup } from "gnim";
import { resourceUsage } from "../resource_usage/resource_usage_state";
import giCairo from "cairo";
import config from "../config";

const STROKE_WIDTH = 3.5;
const CIRCLE_GAP = Math.PI / 4;
const START_ANGLE = -(3 / 2) * Math.PI + CIRCLE_GAP;

function drawDial(cr: giCairo.Context, width: number, height: number, fraction: number) {
    cr.setLineWidth(STROKE_WIDTH);
    cr.setLineCap(giCairo.LineCap.ROUND);

    const radius = (width - STROKE_WIDTH) / 2;

    cr.arc(width / 2, height / 2, radius, START_ANGLE, Math.PI / 2 - CIRCLE_GAP);
    cr.setSourceRGBA(1, 1, 1, 0.2);
    cr.stroke();

    cr.arc(width / 2, height / 2, radius, START_ANGLE, START_ANGLE + (2 * Math.PI - CIRCLE_GAP * 2) * fraction);

    const { red, green, blue } = config.colors.accent2;
    cr.setSourceRGBA(red, green, blue, 1);
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
                widthRequest={32}
                heightRequest={32}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                $={(self) => {
                    self.set_draw_func((_, cr, width, height) => {
                        drawDial(cr, width, height, percentage.peek() / 100);
                        cr.$dispose();
                    });
                    createEffect(() => {
                        percentage(); // track percentage
                        self.queue_draw();
                    });
                }}
            />
            <image iconName={iconName} marginEnd={iconMargin} pixelSize={16} />
        </box>
    );
}

export function ResourceUsageDash() {
    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            cssName="resource-dials-container"
            spacing={8}
            marginTop={6}
            marginBottom={2}
            marginStart={8}
            marginEnd={8}
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
