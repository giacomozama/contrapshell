import { Gtk } from "ags/gtk4";
import { CURSOR_POINTER } from "../utils/gtk";
import app from "ags/gtk4/app";
import { AppearanceSettingsWindow } from "./AppearanceSettingsWindow";

export function AppearanceSettingsBarButton() {
    return (
        <button
            $type="start"
            class={"bar-button"}
            cursor={CURSOR_POINTER}
            vexpand={false}
            halign={Gtk.Align.START}
            iconName="draw-brush-symbolic"
            onClicked={() => {
                (app.get_window("appearance") ?? AppearanceSettingsWindow()).show();
            }}
        />
    );
}
