import config from "../config";
import { BottlesLibrary, GameLauncherEntry } from "./types";
import { parse } from "yaml";
import { readFile } from "ags/file";
import { execAsync } from "ags/process";

export const bottlesEntries: GameLauncherEntry[] = (() => {
    const bottlesLibraryRaw = readFile(config.gameLaunchers.bottles.libraryFilePath);
    const bottlesLibrary = parse(bottlesLibraryRaw) as BottlesLibrary;
    const entries: GameLauncherEntry[] = [];

    for (const program of Object.values(bottlesLibrary)) {
        const image = `${program.bottle.path}/grids/${program.thumbnail.slice(5)}`;

        entries.push({
            title: program.name,
            command: () => {
                execAsync(`${config.path.bottlesCli} run -b ${program.bottle.name} -p "${program.name}"`).catch();
            },
            image,
        });
    }

    entries.sort((a, b) => a.title.localeCompare(b.title));

    return entries;
})();
