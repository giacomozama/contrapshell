import { Gtk } from "ags/gtk4";
import { CURSOR_POINTER } from "../utils/gtk";
import app from "ags/gtk4/app";
import { networkState } from "./network_state";

export default function NetworkBarButton() {
    return (
        <button
            $type="start"
            cssClasses={["bar-button"]}
            cursor={CURSOR_POINTER}
            vexpand={false}
            halign={Gtk.Align.START}
            onClicked={(self) => {
                self.add_css_class("active");
                const window = app.get_window("network") as GlassyWidgets.ContrapshellPopoverWindow;
                const connId = window.connect("hide", () => {
                    self.remove_css_class("active");
                    window.disconnect(connId);
                });
                window.show_from(self);
            }}
        >
            <image iconName={networkState().iconName} halign={Gtk.Align.CENTER} />
        </button>
    );
}

// export default function NetworkBarButton() {
//     return (
//         <box cssClasses={["bar-button"]}>
//             <With value={nmAppletItem}>{(nmItem) => nmItem && <MenuTrayItem item={nmItem} />}</With>
//         </box>
//     );
// }
