import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { Monitor } from "./monitors";
import { createBinding } from "gnim";
import GioUnix from "gi://GioUnix?version=2.0";
import GLib from "gi://GLib?version=2.0";

const hyprland = AstalHyprland.get_default();
const clients = createBinding(hyprland, "clients");

export const isAppRunning = (app: GioUnix.DesktopAppInfo) => clients.as(() => findAppClient(app) !== null);

export function launchOrFocus(app: GioUnix.DesktopAppInfo, monitor?: Monitor) {
    const client = findAppClient(app);

    if (!client) {
        launchInHomeDir(app);
        return true;
    }

    if (monitor) {
        client.move_to(monitor.hyprlandMonitor.activeWorkspace);
    }
    
    client.focus();
    return false;
}

export function findAppClient(app: GioUnix.DesktopAppInfo) {
    const clients = hyprland.clients;
    for (const client of clients) {
        if (client.initialClass === app.get_startup_wm_class()) return client;
        const appId = app?.get_id();
        if (!appId) continue;
        if (client.initialClass === appId?.slice(0, appId.length - 8)) return client;
    }
    return null;
}

export function launchInHomeDir(app: GioUnix.DesktopAppInfo) {
    const curDir = GLib.get_current_dir();
    GLib.chdir(GLib.get_home_dir());
    app.launch([], null)
    GLib.chdir(curDir);
}
