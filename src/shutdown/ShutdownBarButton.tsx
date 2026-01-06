import { Gtk } from "ags/gtk4";
import { CURSOR_POINTER } from "../utils/gtk";
import app from "ags/gtk4/app";
import ShutdownWindow from "./ShutdownWindow";

export function ShutdownBarButton() {
    return (
        <button
            $type="start"
            class={"bar-button"}
            cursor={CURSOR_POINTER}
            vexpand={false}
            halign={Gtk.Align.START}
            iconName="system-shutdown-symbolic"
            onClicked={() => {
                (app.get_window("shutdown") ?? ShutdownWindow()).show();
            }}
        />
    );
}
