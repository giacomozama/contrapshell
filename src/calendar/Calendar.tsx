import { Gtk } from "ags/gtk4";
import { CURSOR_POINTER, popdownParentWindow } from "../utils/gtk";
import { execAsync } from "ags/process";
import { currentDateString } from "../time/time_state";
import app from "ags/gtk4/app";

export function CalendarPopoverWindow() {
    return (
        <contrapshellpopoverwindow name="calendar" widthRequest={500}>
            <box
                orientation={Gtk.Orientation.VERTICAL}
                cssClasses={["popover-standard-inner"]}
                overflow={Gtk.Overflow.HIDDEN}
            >
                <box orientation={Gtk.Orientation.HORIZONTAL} cssClasses={["popover-title"]} valign={Gtk.Align.START}>
                    <image iconName={"office-calendar-symbolic"} halign={Gtk.Align.START} />
                    <label label={"Calendar"} xalign={0} hexpand={true} />
                    <button
                        label="Show calendar"
                        cursor={CURSOR_POINTER}
                        valign={Gtk.Align.CENTER}
                        onClicked={(self) => {
                            execAsync("gnome-calendar");
                            popdownParentWindow(self);
                        }}
                    >
                        <box spacing={12}>
                            <image iconName="org.gnome.Calendar.Devel-symbolic" />
                            <label label="Show calendar" />
                        </box>
                    </button>
                </box>
                <Gtk.Calendar cssClasses={["calendar-full"]} />
            </box>
        </contrapshellpopoverwindow>
    );
}

export default function CalendarBarButton() {
    return (
        <button
            cssClasses={["calendar", "bar-button"]}
            halign={Gtk.Align.END}
            cursor={CURSOR_POINTER}
            onClicked={(self) => {
                self.add_css_class("active");
                const window = app.get_window("calendar") as GlassyWidgets.ContrapshellPopoverWindow;
                const connId = window.connect("hide", () => {
                    self.remove_css_class("active");
                    window.disconnect(connId);
                });
                window.show_from(self);
            }}
        >
            <label label={currentDateString.as((t) => t.replace(",", ""))} widthChars={11} />
        </button>
    );
}
