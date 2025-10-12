import style from "./style.scss";
import Dock from "./widget/dock/Dock";
import { rgbToComponents } from "./utils/colors";
import config from "./config";
import { rememberForEachMonitor } from "./utils/monitors";
import app from "ags/gtk4/app";
import { VolumeChangeWindow } from "./widget/roots/VolumeChangeWindow";
import { setupBackgroundVisualizer } from "./state/background_visualizer/background_visualizer_state";
import { NewNotificationWindow } from "./widget/roots/NewNotificationWindow";
import Bar from "./widget/roots/Bar";

function getAppCSS() {
    const cssVariablesChunk = `
    :root {
        --shell-accent-1-rgb: ${rgbToComponents(config.colors.accent1)};
        --shell-accent-2-rgb: ${rgbToComponents(config.colors.accent2)};
    }
    `;
    return `${cssVariablesChunk}\n${style}`;
}

export function initApp(application: typeof app) {
    application.start({
        instanceName: config.shellName,
        css: getAppCSS(),
        icons: `${SRC}/icons`,
        iconTheme: "Papirus-Dark",
        main() {
            setupBackgroundVisualizer();
            Bar();
            VolumeChangeWindow();
            NewNotificationWindow();
            rememberForEachMonitor(Dock);
        },
    });
}
