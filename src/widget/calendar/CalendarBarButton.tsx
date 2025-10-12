import { Gtk } from "ags/gtk4";
import { CURSOR_POINTER } from "../../utils/gtk";
import { execAsync } from "ags/process";
import { currentDateString } from "../../state/time/time_state";

function CalendarPopover() {
    return (
        <glassypopover widthRequest={500}>
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
                        onClicked={() => execAsync("gnome-calendar")}
                    />
                </box>
                <Gtk.Calendar cssClasses={["calendar-full"]} />
            </box>
        </glassypopover>
    );
}

export default function CalendarBarButton() {
    return (
        <menubutton cssClasses={["calendar", "bar-button"]} halign={Gtk.Align.END} cursor={CURSOR_POINTER}>
            <label label={currentDateString.as((t) => t.replace(",", ""))} widthChars={11} />
            <CalendarPopover />
        </menubutton>
    );
}
