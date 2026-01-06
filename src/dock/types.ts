import GioUnix from "gi://GioUnix?version=2.0";

export enum DockItemFeature {
    GameLauncher,
    MpdClient,
}

export type DockItemQuery = { query?: string; iconName?: string; feature?: DockItemFeature; tooltip?: string };

export type DockItem = { app?: GioUnix.DesktopAppInfo; iconName: string; feature?: DockItemFeature; tooltip?: string };
