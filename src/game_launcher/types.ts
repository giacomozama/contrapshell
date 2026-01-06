import GioUnix from "gi://GioUnix?version=2.0";

export type GameLauncherEntry = {
    title: string;
    command: () => void;
    image: string;
};

export type BottlesLibrary = {
    [id: string]: {
        bottle: {
            name: string;
            path: string;
        };
        name: string;
        thumbnail: string;
    };
};

export interface GameLauncherListEntry {
    id: string;
    iconName: string;
    app: GioUnix.DesktopAppInfo;
    entries: GameLauncherEntry[];
}
