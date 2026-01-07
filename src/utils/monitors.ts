import { Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { createBinding, createComputed, createEffect } from "gnim";
import config from "../config";
import GObject from "gnim/gobject";

export type Monitor = {
    connector: string;
    gdkMonitor: Gdk.Monitor;
    hyprlandMonitor: AstalHyprland.Monitor;
};

const gdkMonitorsBinding = createBinding(app, "monitors");

export const firstNonFullscreenMonitor = createComputed(() => {
    const monitorOrder = config.monitors.monitorOrder;

    const gdkMonitors = gdkMonitorsBinding();
    gdkMonitors.sort((a, b) => monitorOrder.indexOf(a.connector) - monitorOrder.indexOf(b.connector));

    let result: Gdk.Monitor | undefined;

    for (const monitor of gdkMonitors) {
        if (!monitor.connector) continue;

        const hyprMonitor = AstalHyprland.get_default().get_monitor_by_name(monitor.connector);
        if (!hyprMonitor) continue;

        const clients = createBinding(hyprMonitor, "activeWorkspace", "clients")();

        for (const client of clients) {
            // avoid breaking after finding the monitor (for tracking purposes)
            if (createBinding(client, "fullscreen")() === AstalHyprland.Fullscreen.FULLSCREEN && !result) {
                result = monitor;
            }
        }

        if (!clients.some((c) => c.fullscreen === AstalHyprland.Fullscreen.FULLSCREEN)) {
            return monitor;
        }
    }

    return result ?? gdkMonitors[0];
});

export function rememberForEachMonitor(factory: (monitor: Monitor) => GObject.Object) {
    const existing: { [key: string]: GObject.Object | undefined } = {};

    createEffect(() => {
        const gdkMonitors = gdkMonitorsBinding();

        for (const gdkMonitor of gdkMonitors) {
            if (!gdkMonitor.connector || existing[gdkMonitor.connector]) continue;

            existing[gdkMonitor.connector] = factory({
                connector: gdkMonitor.connector,
                gdkMonitor,
                hyprlandMonitor: AstalHyprland.get_default().get_monitor_by_name(gdkMonitor.connector)!,
            });
        }

        for (const key of Object.keys(existing)) {
            if (gdkMonitors.some((m) => m.connector === key)) continue;
            (existing[key] as Gtk.Window).close();
            delete existing[key];
        }
    });
}
