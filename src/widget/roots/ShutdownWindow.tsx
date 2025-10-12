import { Astal, Gdk, Gtk } from "ags/gtk4";
import GradientBox from "../misc/GradientBox";
import app from "ags/gtk4/app";
import { CURSOR_POINTER } from "../../utils/gtk";
import { execAsync } from "ags/process";
import { firstNonFullscreenMonitor } from "../../utils/monitors";
import { createRoot } from "gnim";

function ShutdownButton({ iconName, label, onClicked }: { iconName: string; label: string; onClicked: () => void }) {
    return (
        <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["shutdown-button"]} valign={Gtk.Align.CENTER}>
            <button onClicked={onClicked} cursor={CURSOR_POINTER} cssClasses={["circular"]}>
                <image iconName={iconName} />
            </button>
            <label label={label} />
        </box>
    );
}

export default function ShutdownWindow() {
    return createRoot(
        (dispose) =>
            (
                <window
                    name="shutdown"
                    class="Shutdown"
                    gdkmonitor={firstNonFullscreenMonitor.as((m) => m.gdkMonitor)}
                    keymode={Astal.Keymode.EXCLUSIVE}
                    exclusivity={Astal.Exclusivity.IGNORE}
                    anchor={
                        Astal.WindowAnchor.TOP |
                        Astal.WindowAnchor.RIGHT |
                        Astal.WindowAnchor.BOTTOM |
                        Astal.WindowAnchor.LEFT
                    }
                    onUnmap={(self) => {
                        dispose();
                        self.destroy();
                    }}
                    application={app}
                >
                    <Gtk.EventControllerKey
                        onKeyPressed={(_, key) => {
                            if (key === Gdk.KEY_Escape) {
                                app.get_window("shutdown")?.hide();
                            }
                        }}
                    />
                    <box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
                        <GradientBox cssName="main" animationSpeed={1.0} cornerRadius={24}>
                            <box
                                cssName="main-inner"
                                orientation={Gtk.Orientation.VERTICAL}
                                halign={Gtk.Align.CENTER}
                                valign={Gtk.Align.CENTER}
                            >
                                <box
                                    cssClasses={["session-buttons-container"]}
                                    orientation={Gtk.Orientation.HORIZONTAL}
                                    halign={Gtk.Align.CENTER}
                                    valign={Gtk.Align.CENTER}
                                    spacing={24}
                                >
                                    <ShutdownButton
                                        iconName="system-lock-screen-symbolic"
                                        label="Lock"
                                        onClicked={() => {
                                            app.get_window("shutdown")?.hide();
                                            execAsync(`/bin/bash -c "pidof hyprlock || hyprlock"`);
                                        }}
                                    />
                                    <ShutdownButton
                                        iconName="system-log-out-symbolic"
                                        label="Logout"
                                        onClicked={() => execAsync("hyprctl dispatch exit")}
                                    />
                                    <ShutdownButton
                                        iconName="system-suspend-symbolic"
                                        label="Suspend"
                                        onClicked={() => {
                                            app.get_window("shutdown")?.hide();
                                            execAsync("systemctl suspend");
                                        }}
                                    />
                                    <ShutdownButton
                                        iconName="system-restart-symbolic"
                                        label="Restart"
                                        onClicked={() => execAsync("shutdown -r now")}
                                    />
                                    <ShutdownButton
                                        iconName="system-shutdown-symbolic"
                                        label="Shutdown"
                                        onClicked={() => execAsync("shutdown now")}
                                    />
                                </box>
                            </box>
                        </GradientBox>
                    </box>
                </window>
            ) as Gtk.Window
    );
}
