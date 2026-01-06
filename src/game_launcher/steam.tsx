import Gio from "gi://Gio?version=2.0";
import config from "../config";
import { GameLauncherEntry } from "./types";
import { readFile } from "ags/file";

export const steamEntries: GameLauncherEntry[] = (() => {
    const entries: GameLauncherEntry[] = [];

    for (const dirPath of config.gameLaunchers.steam.steamappsDirs) {
        const dir = Gio.File.new_for_path(dirPath);
        if (!dir.query_exists(null)) {
            printerr(`Missing steamapps directory: ${dirPath}`);
            continue;
        }

        const en = dir.enumerate_children("standard", null, null);

        let child;
        while ((child = en.next_file(null))) {
            const fileName = child.get_name();
            if (!fileName.startsWith("appmanifest_")) continue;
            const raw = readFile(dir.get_child(child.get_name()));

            const id = /\"appid\"\t\t\"([0-9]+)\"/.exec(raw)![1];
            const name = /\"name\"\t\t\"(.+)\"\n/.exec(raw)![1];

            if (config.gameLaunchers.steam.excludePatterns.some((p) => p.test(name))) continue;

            let imgPath = `${config.gameLaunchers.steam.libraryCacheDir}/${id}/library_600x900.jpg`;
            const imgFile = Gio.File.new_for_path(imgPath);

            // if the file is not library_600x900.png, then it might
            // be library_capsule.jpg in a subdir with an unknown name
            if (!imgFile.query_exists(null)) {
                const dir = imgFile.get_parent();
                if (!dir || !dir.query_exists(null)) continue;

                const en = dir.enumerate_children("standard", null, null);
                let child: Gio.FileInfo | null;
                while ((child = en.next_file(null)) != null) {
                    if (child.get_file_type() !== Gio.FileType.DIRECTORY) continue;

                    imgPath = `${
                        config.gameLaunchers.steam.libraryCacheDir
                    }/${id}/${child.get_name()}/library_capsule.jpg`;
                    if (Gio.File.new_for_path(imgPath).query_exists(null)) break;

                    imgPath = `${
                        config.gameLaunchers.steam.libraryCacheDir
                    }/${id}/${child.get_name()}/library_600x900.jpg`;
                    if (Gio.File.new_for_path(imgPath).query_exists(null)) break;
                }
                en.close(null);
            }

            entries.push({
                title: name,
                command: () => Gio.AppInfo.launch_default_for_uri(`steam://rungameid/${id}`, null),
                image: imgPath,
            });
        }

        en.close(null);
    }

    entries.sort((a, b) => a.title.localeCompare(b.title));

    return entries;
})();
