import AstalApps from "gi://AstalApps?version=0.1";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { Monitor } from "./monitors";
import { createBinding } from "gnim";

const hyprland = AstalHyprland.get_default();
const clients = createBinding(hyprland, "clients");

export const isAppRunning = (app: AstalApps.Application) => clients.as(() => findAppClient(app) !== null);

export function launchOrFocus(app: AstalApps.Application, monitor: Monitor) {
    const client = findAppClient(app);

    if (!client) {
        app.launch();
        return true;
    }

    client.move_to(monitor.hyprlandMonitor.activeWorkspace);
    client.focus();
    return false;
}

export function findAppClient(app: AstalApps.Application) {
    const clients = hyprland.clients;
    for (const client of clients) {
        if (client.initialClass === app.wmClass) return client;
        if (client.initialClass === app.entry.substring(0, app.entry.length - 8)) return client;
    }
    return null;
}
