import { Gtk } from "ags/gtk4";
import { Accessor, createComputed, For, With } from "gnim";
import Pango from "gi://Pango?version=1.0";
import { CURSOR_POINTER } from "../utils/gtk";
import { MediaStatus } from "./types";
import { mediaState } from "./media_state";
import { popdownParentWindow } from "../utils/gtk";
import AstalMpris from "gi://AstalMpris?version=0.1";
import config from "../config";
import { rgbToHex } from "../utils/colors";
import { MusicVisualizer } from "./MusicVisualizer";
import app from "ags/gtk4/app";

interface PlayerListEntry {
    name: string;
    instance: string | undefined;
}

const BUS_NAME_REGEX = /org\.mpris\.MediaPlayer2\.(\w+)(?:\.instance_)?(\w+)?/;

function parsePlayerListEntry(busName: string): PlayerListEntry {
    const res = BUS_NAME_REGEX.exec(busName);
    return {
        name: res?.[1] || busName,
        instance: res?.[2],
    };
}

function formatSecondsToMMSS(seconds: number) {
    if (seconds > 100_000_000_000) return "∞";
    const h = seconds / 3600;
    seconds %= 3600;
    const hStr = h >= 1 ? `${h.toFixed(0)}:` : "";
    let mStr = (seconds / 60).toFixed(0);
    if (h >= 1) mStr = mStr.padStart(2, "0");
    return `${hStr}${mStr}:${(seconds % 60).toFixed(0).padStart(2, "0")}`;
}

function MediaControlsButtons() {
    return (
        <box
            widthRequest={144}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            spacing={12}
            cssClasses={["buttons-box"]}
        >
            <button
                iconName={mediaState().playerState.shuffleStatus.as((s) =>
                    (() => {
                        switch (s) {
                            case AstalMpris.Shuffle.OFF:
                            case AstalMpris.Shuffle.UNSUPPORTED:
                                return "media-playlist-consecutive-symbolic";
                            case AstalMpris.Shuffle.ON:
                                return "media-playlist-shuffle-symbolic";
                        }
                    })()
                )}
                cssClasses={["circular"]}
                widthRequest={48}
                heightRequest={48}
                vexpand={false}
                valign={Gtk.Align.CENTER}
                cursor={CURSOR_POINTER}
                sensitive={mediaState().playerState.shuffleStatus.as((s) => s !== AstalMpris.Shuffle.UNSUPPORTED)}
                onClicked={mediaState().playerState.cycleShuffle}
            />
            <button
                iconName="media-skip-backward-symbolic"
                cssClasses={["circular"]}
                widthRequest={48}
                heightRequest={48}
                vexpand={false}
                valign={Gtk.Align.CENTER}
                cursor={CURSOR_POINTER}
                sensitive={createComputed(() => {
                    const pos = mediaState().playerState.position();
                    const cp = mediaState().playerState.canPrevious();
                    return pos > 2 ? !!mediaState().activeMediaPlayer?.peek()?.canControl : cp;
                })}
                onClicked={() => {
                    if (mediaState().playerState.position.peek() > 2) {
                        mediaState().playerState.seek(0);
                    } else {
                        mediaState().playerState.skipPrevious();
                    }
                }}
            />
            <button
                iconName={mediaState().playerState.status.as((s) =>
                    s === MediaStatus.Playing ? "media-playback-pause-symbolic" : "media-playback-start-symbolic"
                )}
                cssClasses={["play-pause", "circular"]}
                widthRequest={64}
                heightRequest={64}
                vexpand={false}
                valign={Gtk.Align.CENTER}
                cursor={CURSOR_POINTER}
                sensitive={mediaState().playerState.canPlayPause}
                onClicked={mediaState().playerState.playPause}
            />
            <button
                iconName="media-skip-forward-symbolic"
                cssClasses={["circular"]}
                widthRequest={48}
                heightRequest={48}
                valign={Gtk.Align.CENTER}
                cursor={CURSOR_POINTER}
                sensitive={mediaState().playerState.canNext}
                onClicked={mediaState().playerState.skipNext}
            />
            <button
                iconName={mediaState().playerState.loopStatus.as((s) =>
                    (() => {
                        switch (s) {
                            case AstalMpris.Loop.NONE:
                            case AstalMpris.Loop.UNSUPPORTED:
                                return "media-playlist-no-repeat-symbolic";
                            case AstalMpris.Loop.TRACK:
                                return "media-playlist-repeat-one-symbolic";
                            case AstalMpris.Loop.PLAYLIST:
                                return "media-playlist-repeat-symbolic";
                        }
                    })()
                )}
                cssClasses={["circular"]}
                widthRequest={48}
                heightRequest={48}
                vexpand={false}
                valign={Gtk.Align.CENTER}
                cursor={CURSOR_POINTER}
                sensitive={mediaState().playerState.loopStatus.as((s) => s !== AstalMpris.Loop.UNSUPPORTED)}
                onClicked={mediaState().playerState.cycleLoop}
            />
        </box>
    );
}

function MediaControlsPlayerSelector() {
    return (
        <box class="button-group" valign={Gtk.Align.CENTER} overflow={Gtk.Overflow.HIDDEN}>
            <For each={mediaState().availableMediaPlayers}>
                {(player) => {
                    const { name, instance } = parsePlayerListEntry(player.busName);
                    return (
                        <togglebutton
                            class="glassy-chip-button"
                            onClicked={(self) => {
                                if (mediaState().activeMediaPlayer.peek()?.busName === player.busName) {
                                    self.set_active(true);
                                    return;
                                }
                                mediaState().watchActivePlayer(player);
                            }}
                            valign={Gtk.Align.CENTER}
                            cursor={CURSOR_POINTER}
                            active={mediaState().activeMediaPlayer.as((p) => p?.busName === player.busName)}
                        >
                            <box spacing={8}>
                                <label label={name} />
                                {instance && <label label={instance} class="subtext" />}
                            </box>
                        </togglebutton>
                    );
                }}
            </For>
        </box>
    );
}

function MediaControlsSongInfoBox() {
    return (
        <box cssClasses={["song-info-box"]} valign={Gtk.Align.CENTER} hexpand={true}>
            <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} hexpand={true} spacing={4}>
                <label
                    label={mediaState().playerState.artist}
                    cssClasses={["artist-label"]}
                    halign={Gtk.Align.START}
                    maxWidthChars={0}
                    wrap={true}
                    lines={1}
                    visible={mediaState().playerState.artist.as((a) => a !== "")}
                    ellipsize={Pango.EllipsizeMode.END}
                />
                <label
                    label={mediaState().playerState.title}
                    cssClasses={["title-label"]}
                    maxWidthChars={0}
                    wrap={true}
                    halign={Gtk.Align.START}
                    lines={2}
                    wrapMode={Pango.WrapMode.WORD_CHAR}
                    ellipsize={Pango.EllipsizeMode.END}
                />
                <label
                    label={mediaState().playerState.album}
                    cssClasses={["album-label"]}
                    maxWidthChars={0}
                    wrap={true}
                    halign={Gtk.Align.START}
                    lines={1}
                    visible={mediaState().playerState.album.as((a) => a !== "")}
                    ellipsize={Pango.EllipsizeMode.END}
                />
            </box>
            <button
                iconName="media-playback-stop-symbolic"
                cssClasses={["circular"]}
                widthRequest={32}
                heightRequest={32}
                vexpand={false}
                marginStart={12}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.END}
                cursor={CURSOR_POINTER}
                visible={mediaState().activeMediaPlayer.as((p) => !!p?.canControl)}
                onClicked={() => mediaState().activeMediaPlayer.peek()?.stop()}
            />
        </box>
    );
}

export function MediaControlsPopoverWindow() {
    return (
        <contrapshellpopoverwindow name="media-controls" cssClasses={["media-controls"]} widthRequest={600}>
            <box
                layoutManager={new Gtk.BinLayout()}
                hexpand={true}
                vexpand={true}
                cssClasses={["media-controls-popover-content"]}
            >
                <box cssClasses={["cover-art-background"]} overflow={Gtk.Overflow.HIDDEN}>
                    <box
                        hexpand={true}
                        vexpand={true}
                        css={mediaState().playerState.artPath.as((p) => `background-image: url("${p}");`)}
                    />
                </box>
                <box
                    hexpand={true}
                    vexpand={true}
                    orientation={Gtk.Orientation.VERTICAL}
                    cssClasses={["popover-standard-inner"]}
                >
                    <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        cssClasses={["popover-title"]}
                        valign={Gtk.Align.START}
                    >
                        <image iconName="emblem-music-symbolic" halign={Gtk.Align.START} />
                        <label label="Media" xalign={0} hexpand={true} />
                        <MediaControlsPlayerSelector />
                        <button
                            iconName="external-link-symbolic"
                            cssClasses={["glassy-chip-button", "corner"]}
                            cursor={CURSOR_POINTER}
                            valign={Gtk.Align.CENTER}
                            sensitive={mediaState().activeMediaPlayer.as((p) => p?.canRaise === true)}
                            onClicked={(self) => {
                                mediaState().activeMediaPlayer.peek()?.raise();
                                popdownParentWindow(self);
                            }}
                        />
                    </box>
                    <box orientation={Gtk.Orientation.VERTICAL} class="media-controls-inner">
                        <box orientation={Gtk.Orientation.HORIZONTAL}>
                            <box halign={Gtk.Align.START}>
                                <With value={mediaState().playerState.artPath}>
                                    {(path) =>
                                        path ? (
                                            <box layoutManager={new Gtk.BinLayout()}>
                                                <box
                                                    cssClasses={["cover-art"]}
                                                    halign={Gtk.Align.START}
                                                    css={mediaState().playerState.artPath.as(
                                                        (p) => `background-image: url("${p}");`
                                                    )}
                                                />
                                                <box cssClasses={["gloss"]} />
                                            </box>
                                        ) : (
                                            <box layoutManager={new Gtk.BinLayout()}>
                                                <box
                                                    cssClasses={["cover-art"]}
                                                    halign={Gtk.Align.START}
                                                    overflow={Gtk.Overflow.HIDDEN}
                                                >
                                                    <image iconName={"media-album-cover"} pixelSize={128} />
                                                </box>
                                                <box cssClasses={["gloss"]} />
                                            </box>
                                        )
                                    }
                                </With>
                            </box>
                            <MediaControlsSongInfoBox />
                        </box>
                        <slider
                            cssClasses={["slider"]}
                            max={mediaState().playerState.duration}
                            min={0}
                            value={mediaState().playerState.position}
                            css={mediaState().playerState.palette.as(
                                (c) => `--slider-color: ${rgbToHex(c?.[0] ?? config.colors.accent1)};`
                            )}
                            sensitive={mediaState().activeMediaPlayer.as((p) => !!p?.canControl)}
                            onChangeValue={(self) => mediaState().playerState.seek(self.value)}
                        />
                        <box class="slider-labels" hexpand={true}>
                            <label
                                label={mediaState().playerState.position.as((p) => formatSecondsToMMSS(p ?? 0))}
                                halign={Gtk.Align.START}
                                hexpand={true}
                                xalign={0}
                            />
                            <label
                                label={mediaState().playerState.duration.as((d) => formatSecondsToMMSS(d ?? 0))}
                                xalign={1}
                            />
                        </box>
                        <MediaControlsButtons />
                    </box>
                </box>
            </box>
        </contrapshellpopoverwindow>
    );
}

export default function MediaControls() {
    return (
        <box layoutManager={new Gtk.BinLayout()} cssName="media-controls" hexpand={true}>
            <MusicVisualizer />
            <button
                cursor={CURSOR_POINTER}
                sensitive={mediaState().activeMediaPlayer.as((s) => !!s)}
                cssClasses={["bar-button"]}
                widthRequest={600}
                onClicked={(self) => {
                    self.add_css_class("active");
                    const window = app.get_window("media-controls") as GlassyWidgets.ContrapshellPopoverWindow;
                    const connId = window.connect("hide", () => {
                        self.remove_css_class("active");
                        window.disconnect(connId);
                    });
                    window.show_from(self);
                }}
            >
                <box
                    cssClasses={["media-controls-button-content"]}
                    orientation={Gtk.Orientation.HORIZONTAL}
                    vexpand={true}
                >
                    <image iconName="emblem-music-symbolic" marginEnd={12} />
                    <box>
                        <label
                            cssClasses={["currently-playing"]}
                            label={mediaState().playerState.previewLabelText}
                            hexpand={true}
                            xalign={0.5}
                            maxWidthChars={0}
                            wrap={true}
                            wrapMode={Pango.WrapMode.CHAR}
                            ellipsize={Pango.EllipsizeMode.END}
                        />
                    </box>
                </box>
            </button>
        </box>
    );
}
