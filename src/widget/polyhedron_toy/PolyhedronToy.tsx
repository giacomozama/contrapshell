import { Gtk } from "ags/gtk4";
import config from "../../config";
import giCairo from "cairo";
import { add_throttled_tick_callback_dynamic } from "../../utils/gtk";
import { eyeCandyConfig } from "../../state/eye_candy/eye_candy_state";
import { edges, projected2d, projectPoints } from "../../state/polyhedron_toy/polyhedron_toy_state";

function drawEdge(cr: giCairo.Context, [ax, ay]: number[], [bx, by]: number[]) {
    cr.moveTo(ax, ay);
    cr.lineTo(bx, by);
    cr.stroke();
}

function drawVertex(cr: giCairo.Context, [ax, ay]: number[]) {
    cr.arc(ax, ay, 3, 0, 2 * Math.PI);
    cr.fill();
}

function drawToy(cr: giCairo.Context) {
    cr.setLineWidth(1.2);

    cr.setSourceRGBA(1, 1, 1, 0.2);
    for (const [i, j] of edges) {
        drawEdge(cr, projected2d[i], projected2d[j]);
    }

    const { red, green, blue, alpha } = config.polyhedronToy.dotColor;
    cr.setSourceRGBA(red, green, blue, alpha);
    for (const point of projected2d) {
        drawVertex(cr, point);
    }
}

export function PolyhedronToy() {
    return (
        <drawingarea
            cssName={"polyhedron"}
            widthRequest={750}
            heightRequest={700}
            halign={Gtk.Align.END}
            visible={eyeCandyConfig.as((c) => c.polyhedronToyEnabled)}
            $={(self) => {
                self.set_draw_func((_, cr, width, height) => {
                    projectPoints(width, height, self.get_frame_clock()!.get_frame_time());
                    drawToy(cr);
                    cr.$dispose();
                });
            }}
            onMap={(self) => {
                add_throttled_tick_callback_dynamic(
                    self,
                    () => eyeCandyConfig.get().polyhedronToyMinInterval,
                    (w) => {
                        w.queue_draw();
                        return w.get_mapped();
                    }
                );
            }}
        />
    );
}
