import { execAsync } from "ags/process";
import config from "../config";
import { createPollState } from "../utils/gnim";
import { Accessor, createRoot } from "gnim";

export type UpdatesState = {
    sortedUpdates: Accessor<string[]>;
    onInstallClicked: () => void;
};

let updatesStateInstance: UpdatesState | null;

function createUpdatesState(): UpdatesState {
    function parseAndSortUpdates(stdout: string) {
        return stdout
            .split("\n")
            .filter((l) => !!l.length)
            .sort((a, b) => a.localeCompare(b));
    }

    const [sortedUpdates, setSortedUpdates] = createPollState(
        [],
        config.updates.checkUpdatesInterval,
        config.updates.checkUpdatesCommand,
        parseAndSortUpdates
    );

    function onInstallClicked() {
        execAsync(config.updates.launchCommand).then(
            () => {
                execAsync(config.updates.checkUpdatesCommand).then(
                    (o) => setSortedUpdates(parseAndSortUpdates(o)),
                    () => {}
                );
            },
            () => {}
        );
    }

    updatesStateInstance = {
        sortedUpdates,
        onInstallClicked,
    };

    return updatesStateInstance;
}

export function updatesState(): UpdatesState {
    return updatesStateInstance ?? createRoot(createUpdatesState);
}
