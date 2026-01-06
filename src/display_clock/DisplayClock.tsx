import { Gtk } from "ags/gtk4";
import { createPoll } from "ags/time";
import Graphene from "gi://Graphene?version=1.0";
import { Accessor } from "gnim";
import GObject from "gnim/gobject";

const FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
};

function getDateString() {
    const date = new Date().toLocaleString("en-US", FORMAT_OPTIONS);
    const parts = date.replace(",", "").split(" ");
    return [parts[0], parts[1], ...parts[2].split(":")];
}

const currentDateString = createPoll(getDateString(), 1000, getDateString);

export function DisplayClock() {
    return (
        <box hexpand={true} vexpandSet={true} class="display-clock-calendar">
            <box
                class="display-clock"
                orientation={Gtk.Orientation.VERTICAL}
                overflow={Gtk.Overflow.HIDDEN}
                halign={Gtk.Align.START}
                spacing={8}
                vexpand={true}
            >
                <box class="hour" spacing={8} vexpand={true}>
                    <label label={currentDateString.as((t) => t[2].charAt(0))} />
                    <label label={currentDateString.as((t) => t[2].charAt(1))} />
                </box>
                <box class="minute" spacing={8} vexpand={true}>
                    <label label={currentDateString.as((t) => t[3].charAt(0))} />
                    <label label={currentDateString.as((t) => t[3].charAt(1))} />
                </box>
            </box>
            <box class="display-calendar" orientation={Gtk.Orientation.VERTICAL} spacing={8} hexpand={true}>
                <label class="month" hexpand={true} label={currentDateString.as((t) => t[0])} />
                <label class="day" hexpand={true} label={currentDateString.as((t) => t[1])} vexpand={true} />
            </box>
        </box>
    );
}
