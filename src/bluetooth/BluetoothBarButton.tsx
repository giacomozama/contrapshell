import { Gtk } from "ags/gtk4";
import { CURSOR_POINTER } from "../utils/gtk";
import app from "ags/gtk4/app";

export default function BluetoothBarButton() {
    return (
        <button
            $type="start"
            cssClasses={["bar-button"]}
            cursor={CURSOR_POINTER}
            vexpand={false}
            halign={Gtk.Align.START}
            onClicked={(self) => {
                self.add_css_class("active");
                const window = app.get_window("bluetooth") as GlassyWidgets.ContrapshellPopoverWindow;
                const connId = window.connect("hide", () => {
                    self.remove_css_class("active");
                    window.disconnect(connId);
                });
                window.show_from(self);
            }}
        >
            <image iconName="bluetooth-symbolic" halign={Gtk.Align.CENTER} />
        </button>
    );
}
