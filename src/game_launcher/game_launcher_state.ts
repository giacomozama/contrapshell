import { GameLauncherListEntry } from "./types";
import config from "../config";
import { steamEntries } from "./steam";
import { bottlesEntries } from "./bottles";
import GioUnix from "gi://GioUnix?version=2.0";

export const launchers: GameLauncherListEntry[] = (() => {
    const enabledLaunchers = Object.keys(config.gameLaunchers);
    const launchers = [];

    if (enabledLaunchers.includes("steam")) {
        try {
            const app = GioUnix.DesktopAppInfo.new("steam.desktop");
            launchers.push({
                id: "steam",
                iconName: app.get_icon()?.to_string() ?? "",
                app,
                entries: steamEntries,
            });
        } catch (e) {
            printerr("Couldn't get Steam application, is it installed?");
        }
    }

    if (enabledLaunchers.includes("bottles")) {
        try {
            const app = GioUnix.DesktopAppInfo.new("com.usebottles.bottles.desktop");
            launchers.push({
                id: "bottles",
                iconName: app.get_icon()?.to_string() ?? "",
                app,
                entries: bottlesEntries,
            });
        } catch (e) {
            printerr("Couldn't get Bottles application, is it installed?");
        }
    }

    return launchers;
})();
