import { DockItem } from "./types";
import config from "../config";
import { notificationsState } from "../notifications/notifications_state";
import GioUnix from "gi://GioUnix?version=2.0";
import { Accessor, createRoot } from "gnim";

export type DockState = {
    dockItems: DockItem[];
    appNotificationCounts: Accessor<Map<string, number>>;
};

let dockStateInstance: DockState | null;

function createDockState() {
    const dockItems: DockItem[] = config.dock.items.map((item) => {
        let app;
        if (item.query?.endsWith(".desktop")) {
            app = GioUnix.DesktopAppInfo.new(item.query);
        } else {
            const searchResults = item.query ? GioUnix.DesktopAppInfo.search(item.query)[0]?.[0] : undefined;
            app = searchResults ? GioUnix.DesktopAppInfo.new(searchResults) : undefined;
        }
        const icon = item.iconName ?? app?.get_icon()?.to_string();
        return { app, iconName: icon!, feature: item.feature, tooltip: item.tooltip };
    });

    const appNotificationCounts = notificationsState().notifications.as((notifs) => {
        const result = new Map<string, number>();
        for (const notif of notifs) {
            result.set(notif.desktopEntry, (result.get(notif.desktopEntry) ?? 0) + 1);
        }
        return result;
    });

    dockStateInstance = {
        dockItems,
        appNotificationCounts,
    };

    return dockStateInstance;
}

export function dockState(): DockState {
    return dockStateInstance ?? createRoot(createDockState);
}

export default dockState;
