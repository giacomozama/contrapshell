import style from "./style.scss";
import { DockBackground, DockForeground, DockShadow } from "./dock/Dock";
import { rgbToComponents } from "./utils/colors";
import config from "./config";
import { rememberForEachMonitor } from "./utils/monitors";
import app from "ags/gtk4/app";
import { VolumeChangeWindow } from "./audio/VolumeChangeWindow";
import { NewNotificationWindow } from "./notifications/NewNotificationWindow";
import { BarBackground, BarForeground, BarScrim, BarShadow } from "./bar/Bar";
import { AudioControlsPopoverWindow } from "./audio/AudioControls";
import { BluetoothPopoverWindow } from "./bluetooth/BluetoothPopover";
import { NetworkPopoverWindow } from "./network/NetworkPopover";
import { CalendarPopoverWindow } from "./calendar/Calendar";
import { MediaControlsPopoverWindow } from "./media/MediaControls";
import { NotificationsBarPopoverWindow } from "./notifications/NotificationsPopover";
import { UpdatesPopoverWindow } from "./updates/Updates";
import MusicLibraryPopoverWindow from "./mpd/MusicLibraryPopover";
import { CombinedGameLauncherPopoverWindow } from "./game_launcher/GameLauncherPopover";
import { BackgroundPanel, BackgroundPanelShadow } from "./background_panel/BackgroundPanel";
import { PopoverOutsideClickInterceptor } from "./misc/GlassyPopover";
import { storage } from "./storage/storage_state";

function getAppCSS() {
    const cssVariablesChunk = `
    :root {
        --shell-accent-1-rgb: ${rgbToComponents(config.colors.accent1)};
        --shell-accent-2-rgb: ${rgbToComponents(config.colors.accent2)};
        --panel-border-radius: ${config.appearance.panelBorderRadius}px;
        --background-panel-border-radius: ${config.appearance.backgroundPanelBorderRadius}px;
        --panel-padding: ${config.appearance.panelPadding}px;
        --panel-margin: ${config.appearance.panelMargin}px;
        --glassy-bg-color: ${storage.peek().useDarkPanels ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.05)"};
        --glassy-box-shadow: ${
            storage.peek().useDarkPanels
                ? "inset 0 0 3px 1px rgba(255, 255, 255, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.1)"
                : "inset 0 0 1px 3px rgba(255, 255, 255, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.11)"
        };
    }
    `;
    return `${cssVariablesChunk}\n${style}`;
}

export function initApp() {
    app.start({
        instanceName: config.shellName,
        css: getAppCSS(),
        icons: `${SRC}/resources/icons`,
        iconTheme: "Papirus-Dark",
        main() {
            if (config.bar.enabled) {
                if (config.audioControls.enabled) AudioControlsPopoverWindow();
                if (config.bluetooth.enabled) BluetoothPopoverWindow();
                if (config.network.enabled) NetworkPopoverWindow();
                if (config.barCalendar.enabled) CalendarPopoverWindow();
                if (config.mediaControls.enabled) MediaControlsPopoverWindow();
                if (config.notifications.enabled) NotificationsBarPopoverWindow();
                if (config.updates.enabled) UpdatesPopoverWindow();
            }

            if (config.dock.enabled) {
                if (config.gameLaunchers.enabled) CombinedGameLauncherPopoverWindow();
                if (config.mpd.enabled) MusicLibraryPopoverWindow();
            }

            if (config.backgroundPanel.enabled) {
                BackgroundPanelShadow();
                BackgroundPanel();
            }

            if (config.bar.enabled) {
                BarScrim();
                BarShadow();
                BarBackground();
                rememberForEachMonitor(PopoverOutsideClickInterceptor);
                BarForeground();
            }

            if (config.notifications.enabled) {
                NewNotificationWindow();
            }

            if (config.audioControls.enabled) {
                VolumeChangeWindow();
            }

            if (config.dock.enabled) {
                rememberForEachMonitor(DockShadow);
                rememberForEachMonitor(DockBackground);
                rememberForEachMonitor(DockForeground);
            }
        },
    });
}
