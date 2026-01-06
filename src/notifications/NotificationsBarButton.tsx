import app from "ags/gtk4/app";
import { CURSOR_POINTER } from "../utils/gtk";

export default function NotificationsBarButton() {
    return (
        <button
            cssClasses={["notif-bar-button", "bar-button"]}
            cursor={CURSOR_POINTER}
            onClicked={(self) => {
                self.add_css_class("active");
                const window = app.get_window("notifications") as GlassyWidgets.ContrapshellPopoverWindow;
                const connId = window.connect("hide", () => {
                    self.remove_css_class("active");
                    window.disconnect(connId);
                });
                window.show_from(self);
            }}
        >
            <image iconName="notification-inactive-symbolic" />
        </button>
    );
}
