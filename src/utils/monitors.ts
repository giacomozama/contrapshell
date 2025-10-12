import { Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { createBinding, createComputed, createState } from "gnim";
import config from "../config";
import GObject from "gnim/gobject";

export type Monitor = {
    connector: string;
    gdkMonitor: Gdk.Monitor;
    hyprlandMonitor: AstalHyprland.Monitor;
};

export const appMonitors = createBinding(app, "monitors").as((monitors) => {
    const hyprland = AstalHyprland.get_default();
    const hyprMonitors = hyprland.get_monitors();
    const hyprMonitorsByName = Object.fromEntries(hyprMonitors.map((m) => [m.name, m]));
    const monitorIndex = Object.fromEntries(config.monitors.monitorOrder.map((m, i) => [m, i]));
    return monitors
        .map(
            (monitor) =>
                ({
                    connector: monitor.connector,
                    gdkMonitor: monitor,
                    hyprlandMonitor: hyprMonitorsByName[monitor.connector],
                } as Monitor)
        )
        .sort((a, b) => monitorIndex[a.connector] - monitorIndex[b.connector]);
});

function getFirstNonFullscreenMonitor() {
    const [firstNonFullScreenMonitor, setFirstNonFullScreenMonitor] = createState(appMonitors.get()[0]);

    let disposeWatchWorkspaces: (() => void) | undefined;
    let disposeWatchClients: (() => void) | undefined;
    let disposeWatchFullscreen: (() => void) | undefined;

    function watchMonitors() {
        disposeWatchWorkspaces?.();
        disposeWatchClients?.();
        disposeWatchFullscreen?.();

        const withActiveWorkspacesBindings = appMonitors
            .get()
            .map((m) => ({ monitor: m, activeWorkspaceBinding: createBinding(m.hyprlandMonitor, "activeWorkspace") }));

        const withActiveWorkspacesBinding = createComputed((get) => {
            return withActiveWorkspacesBindings.map(({ monitor, activeWorkspaceBinding }) => {
                return {
                    monitor,
                    activeWorkspace: get(activeWorkspaceBinding),
                };
            });
        });

        function watchWorkspaces() {
            disposeWatchClients?.();
            disposeWatchFullscreen?.();

            const workspaces = withActiveWorkspacesBinding.get();

            const withClientsBindings = workspaces.map(({ monitor, activeWorkspace }) => ({
                monitor,
                clientsBinding: createBinding(activeWorkspace, "clients"),
            }));

            const withClientsBinding = createComputed((get) =>
                withClientsBindings.map(({ monitor, clientsBinding }) => ({
                    monitor,
                    clients: get(clientsBinding),
                }))
            );

            function watchClients() {
                disposeWatchFullscreen?.();

                const withFullscreenBindings = withClientsBinding.get().map(({ monitor, clients }) => ({
                    monitor,
                    fullscreenBinding: createComputed(
                        clients.map((c) =>
                            createBinding(c, "fullscreen").as((f) => f === AstalHyprland.Fullscreen.FULLSCREEN)
                        ),
                        (...fs) => fs.some((b) => b)
                    ),
                }));

                const withFullscreenBinding = createComputed((get) =>
                    withFullscreenBindings.map(({ monitor, fullscreenBinding }) => ({
                        monitor,
                        fullscreen: get(fullscreenBinding),
                    }))
                );

                function watchFullscreen() {
                    const withFullscreen = withFullscreenBinding.get();
                    setFirstNonFullScreenMonitor(withFullscreen.find((m) => !m.fullscreen)?.monitor ?? withFullscreen[0].monitor)
                }

                disposeWatchFullscreen = withFullscreenBinding.subscribe(watchFullscreen)
                watchFullscreen();
            }

            disposeWatchClients = withClientsBinding.subscribe(watchClients);
            watchClients();
        }

        disposeWatchWorkspaces = withActiveWorkspacesBinding.subscribe(watchWorkspaces);
        watchWorkspaces();
    }

    appMonitors.subscribe(watchMonitors);
    watchMonitors();

    return firstNonFullScreenMonitor;
}

export const firstNonFullscreenMonitor = getFirstNonFullscreenMonitor();

export function rememberForEachMonitor(factory: (monitor: Monitor) => GObject.Object) {
    const existing: { [key: string]: GObject.Object | undefined } = {};

    function onMonitorsChanged() {
        const monitors = appMonitors.get();

        for (const monitor of monitors) {
            if (!existing[monitor.connector]) {
                existing[monitor.connector] = factory(monitor);
            }
        }

        const existingKeys = Object.keys(existing);
        for (const key of existingKeys) {
            if (!monitors.some((m) => m.connector === key)) {
                (existing[key] as Gtk.Window).destroy();
                delete existing[key];
            }
        }
    }

    appMonitors.subscribe(onMonitorsChanged);
    onMonitorsChanged();
}
