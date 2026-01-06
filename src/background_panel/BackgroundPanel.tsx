import { Astal, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { createRoot, onCleanup } from "gnim";
import config from "../config";
import { News } from "../news/News";
import { Finance } from "../finance/Finance";
import { DisplayClock } from "../display_clock/DisplayClock";
import { WeatherVisualizer } from "../weather/Weather";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

function setupWorkspaceTracking(window: Gtk.Window) {
    const hyprland = AstalHyprland.get_default();

    const hyprMonitor = hyprland.get_monitor_by_name(config.backgroundPanel.showOnMonitor);
    if (!hyprMonitor) return;

    let activeWorkspace: AstalHyprland.Workspace | undefined;
    let clientsConnId: number | undefined;

    function onActiveWorkspaceChanged() {
        if (clientsConnId) {
            hyprMonitor?.disconnect(clientsConnId);
            activeWorkspace = undefined;
            clientsConnId = undefined;
        }

        activeWorkspace = hyprMonitor?.activeWorkspace;
        if (!activeWorkspace) return;

        function onClientsChanged() {
            if (activeWorkspace?.get_clients().length) {
                window?.hide();
            } else {
                window?.show();
            }
        }

        clientsConnId = activeWorkspace?.connect("notify::clients", onClientsChanged);
        onClientsChanged();
    }

    const activeWorkspaceConnId = hyprMonitor.connect("notify::active-workspace", onActiveWorkspaceChanged);
    onCleanup(() => hyprland.disconnect(activeWorkspaceConnId));

    onActiveWorkspaceChanged();
}

export function BackgroundPanelShadow() {
    const monitor = app.monitors.find((m) => m.connector === config.backgroundPanel.showOnMonitor);
    if (!monitor) return undefined;

    return createRoot((dispose) => (
        <window
            name="background-panel-shadow"
            class="BackgroundPanelShadow"
            // MUST be above the gdkmonitor prop
            layer={Astal.Layer.BACKGROUND}
            gdkmonitor={monitor}
            exclusivity={Astal.Exclusivity.IGNORE}
            anchor={
                Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT
            }
            vexpand={true}
            hexpand={true}
            application={app}
            onCloseRequest={(self) => {
                dispose();
                self.destroy();
            }}
            namespace={`${config.shellName}-overlay`}
            $={(self) => {
                setupWorkspaceTracking(self);
            }}
        >
            <Gtk.Grid
                hexpand={true}
                vexpand={true}
                marginTop={8}
                marginEnd={8}
                marginBottom={32 + config.dock.itemSize}
                marginStart={8}
                rowSpacing={8}
                columnSpacing={8}
                columnHomogeneous={true}
                rowHomogeneous={true}
                $={(self) => {
                    self.attach(
                        (<box class="background-panel-shadow" hexpand={true} vexpand={true} />) as Gtk.Widget,
                        0,
                        0,
                        1,
                        2
                    );
                    self.attach(
                        (<box class="background-panel-shadow" hexpand={true} vexpand={true} />) as Gtk.Widget,
                        1,
                        0,
                        1,
                        2
                    );
                    self.attach(
                        (<box class="background-panel-shadow" hexpand={true} vexpand={true} />) as Gtk.Widget,
                        2,
                        0,
                        1,
                        1
                    );
                    self.attach(
                        (<box class="background-panel-shadow" hexpand={true} vexpand={true} />) as Gtk.Widget,
                        2,
                        1,
                        1,
                        1
                    );
                }}
            />
        </window>
    ));
}

export function BackgroundPanel() {
    const monitor = app.monitors.find((m) => m.connector === config.backgroundPanel.showOnMonitor);
    if (!monitor) return undefined;

    return createRoot((dispose) => {
        return (
            <window
                name="background-panel"
                class="BackgroundPanel"
                // MUST be above the gdkmonitor prop
                layer={Astal.Layer.BACKGROUND}
                gdkmonitor={monitor}
                exclusivity={Astal.Exclusivity.EXCLUSIVE}
                anchor={
                    Astal.WindowAnchor.TOP |
                    Astal.WindowAnchor.RIGHT |
                    Astal.WindowAnchor.BOTTOM |
                    Astal.WindowAnchor.LEFT
                }
                vexpand={true}
                hexpand={true}
                application={app}
                onCloseRequest={(self) => {
                    dispose();
                    self.destroy();
                }}
                namespace={config.shellName}
                $={(self) => {
                    setupWorkspaceTracking(self);
                }}
            >
                <Gtk.Grid
                    hexpand={true}
                    vexpand={true}
                    marginTop={config.appearance.panelMargin}
                    marginEnd={config.appearance.panelMargin}
                    marginBottom={config.appearance.panelMargin}
                    marginStart={config.appearance.panelMargin}
                    rowSpacing={config.appearance.panelMargin}
                    columnSpacing={config.appearance.panelMargin}
                    columnHomogeneous={true}
                    rowHomogeneous={true}
                    $={(self) => {
                        self.attach((config.news.enabled ? <News /> : <box />) as Gtk.Widget, 0, 0, 1, 2);
                        self.attach((config.finance.enabled ? <Finance /> : <box />) as Gtk.Widget, 1, 0, 1, 2);
                        self.attach(
                            (config.backgroundPanel.showClock ? <DisplayClock /> : <box />) as Gtk.Widget,
                            2,
                            0,
                            1,
                            1
                        );
                        self.attach(
                            (config.weather.enabled ? <WeatherVisualizer /> : <box />) as Gtk.Widget,
                            2,
                            1,
                            1,
                            1
                        );
                    }}
                />
            </window>
        );
    }) as Gtk.Window;
}
