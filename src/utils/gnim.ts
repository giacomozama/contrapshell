import { createPoll } from "ags/time";
import { createEffect, createState, State } from "gnim";
import { setStorage, storage } from "../storage/storage_state";
import { Storage } from "../storage/types";

export function createPollState(init: string, interval: number, exec: string | string[]): State<string>;

export function createPollState<T>(
    init: T,
    interval: number,
    exec: string | string[],
    transform: (stdout: string, prev: T) => T
): State<T>;

export function createPollState<T>(init: T, interval: number, fn: (prev: T) => T | Promise<T>): State<T>;

export function createPollState<T>(
    init: T,
    interval: number,
    execOrFn: string | string[] | ((prev: T) => T | Promise<T>),
    transform?: (stdout: string, prev: T) => T
): State<T> {
    const state = createState(init);
    const poll =
        typeof execOrFn === "function"
            ? createPoll(init, interval, execOrFn)
            : createPoll(init, interval, execOrFn, transform ?? ((stdout) => stdout as T));
    createEffect(() => state[1](poll()));
    return state;
}

export function createStorageBackedState(key: keyof Storage): State<Storage[typeof key]> {
    return [storage.as((s) => s[key]), (v) => setStorage({ ...storage.peek(), [key]: v } as Storage)];
}
