import { Astal, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { Accessor, createBinding, createRoot, onCleanup } from "gnim";
import GradientBox from "../misc/GradientBox";
import TrashDockItem from "../trash/TrashDockItem";
import { WorkspaceSwitcher } from "../workspace_switcher/WorkspaceSwitcher";
import { Monitor } from "../../utils/monitors";
import { DockItem, DockItemFeature } from "../../state/dock/types";
import MusicLibraryDockItem from "../mpd/MusicLibraryDockItem";
import { DefaultButtonDockItem } from "./DefaultButtonDockItem";
import {
    BottlesGameLauncherPopover,
    GameLauncherDockItem,
    SteamGameLauncherPopover,
} from "../game_launcher/GameLauncherPopover";
import { appNotificationCounts, dockItems } from "../../state/dock/dock_state";
import { SearchDockItem } from "./SearchDockItem";

function ButtonDockItemContent({ item, monitor }: { item: DockItem; monitor: Monitor }) {
    switch (item.feature) {
        case DockItemFeature.BottlesLauncher:
            const bottlesPopover = (<BottlesGameLauncherPopover item={item} monitor={monitor} />) as Gtk.Popover;
            return <DefaultButtonDockItem item={item} monitor={monitor} leftClickPopover={bottlesPopover} />;
        case DockItemFeature.SteamLauncher:
            const steamPopover = (<SteamGameLauncherPopover item={item} monitor={monitor} />) as Gtk.Popover;
            return <DefaultButtonDockItem item={item} monitor={monitor} leftClickPopover={steamPopover} />;
        case DockItemFeature.GameLauncher:
            return (
                <GameLauncherDockItem iconName={item.iconName} tooltip={item.tooltip ?? "Games"} monitor={monitor} />
            );
        case DockItemFeature.MpdClient:
            return <MusicLibraryDockItem iconName={item.iconName} />;
        default:
            return <DefaultButtonDockItem item={item} monitor={monitor} />;
    }
}

function ButtonDockItem({ item, monitor }: { item: DockItem; monitor: Monitor }) {
    const entryWithoutSuffix = item.app?.entry.slice(0, -8);
    const notificationCount = entryWithoutSuffix
        ? appNotificationCounts.as((an) => an.get(entryWithoutSuffix) ?? 0)
        : undefined;

    return (
        <box layoutManager={new Gtk.BinLayout()}>
            <ButtonDockItemContent item={item} monitor={monitor} />
            {notificationCount && (
                <label
                    cssClasses={["notif-count"]}
                    label={notificationCount.as((c) => `${c > 99 ? "99+" : c}`)}
                    visible={notificationCount.as((c) => c > 0)}
                    valign={Gtk.Align.END}
                    halign={Gtk.Align.END}
                />
            )}
        </box>
    );
}

export default function Dock(monitor: Monitor) {
    return createRoot((dispose) => (
        <window
            visible
            name={`dock-${monitor.connector}`}
            class="Dock"
            gdkmonitor={monitor.gdkMonitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={Astal.WindowAnchor.BOTTOM}
            application={app}
            onCloseRequest={dispose}
        >
            <box valign={Gtk.Align.END}>
                <GradientBox cssName="main" animationSpeed={0} cornerRadius={12} thickness={1.4}>
                    <box cssName="main-inner" hexpand={true} vexpand={true} heightRequest={72} spacing={5}>
                        {dockItems.map((item) => (
                            <ButtonDockItem item={item} monitor={monitor} />
                        ))}
                        <Gtk.Separator orientation={Gtk.Orientation.VERTICAL} />
                        {<WorkspaceSwitcher monitor={monitor} />}
                        <Gtk.Separator orientation={Gtk.Orientation.VERTICAL} />
                        {<TrashDockItem />}
                        {<SearchDockItem />}
                    </box>
                </GradientBox>
            </box>
        </window>
    ));
}
