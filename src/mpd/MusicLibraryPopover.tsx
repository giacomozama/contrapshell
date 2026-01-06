import { Gtk } from "ags/gtk4";
import { Album, Song } from "./types";
import { CURSOR_POINTER } from "../utils/gtk";
import { Accessor, createComputed, createEffect, createState, For, onCleanup } from "gnim";
import Pango from "gi://Pango?version=1.0";
import { mpdState } from "./mpd_state";
import config from "../config";
import giCairo from "cairo";
import AstalMpris from "gi://AstalMpris?version=0.1";

const width = 550;
const padding = 24;
const spacing = 12;
const cols = 4;
const coverArtSize = (width - padding * 2 - spacing * (cols - 1)) / cols;

function PlaylistList({
    flowBoxVadjustment,
    setSelectedAlbum,
    setCurrentPage,
}: {
    flowBoxVadjustment: Gtk.Adjustment;
    setSelectedAlbum: (album: Album) => void;
    setCurrentPage: (page: string) => void;
}) {
    return (
        <scrolledwindow $type="named" name="library" vexpand={true} vadjustment={flowBoxVadjustment}>
            <Gtk.FlowBox
                cssClasses={["mpd-flow-box"]}
                orientation={Gtk.Orientation.HORIZONTAL}
                activateOnSingleClick={true}
                maxChildrenPerLine={cols}
                minChildrenPerLine={cols}
                selectionMode={Gtk.SelectionMode.NONE}
                valign={Gtk.Align.START}
                rowSpacing={spacing}
                columnSpacing={spacing}
                marginBottom={24}
            >
                <For each={mpdState().mpdMusicLibrary}>
                    {(album) => (
                        <button
                            cssClasses={["mpd-album-button"]}
                            widthRequest={coverArtSize}
                            label={album.title}
                            halign={Gtk.Align.START}
                            valign={Gtk.Align.START}
                            overflow={Gtk.Overflow.HIDDEN}
                            cursor={CURSOR_POINTER}
                            onClicked={() => {
                                setSelectedAlbum(album);
                                setCurrentPage("album");
                            }}
                        >
                            <box layoutManager={new Gtk.BinLayout()} vexpand={true} hexpand={true}>
                                <box orientation={Gtk.Orientation.VERTICAL}>
                                    <box
                                        css={`
                                            background-image: url("file://${album.coverArtPath}");
                                        `}
                                        widthRequest={coverArtSize}
                                        heightRequest={coverArtSize}
                                        cssClasses={["mpd-album-thumb"]}
                                    />
                                    <label
                                        class="title"
                                        label={album.title}
                                        ellipsize={Pango.EllipsizeMode.END}
                                        marginBottom={4}
                                        xalign={0}
                                    />
                                    <label
                                        class="artist"
                                        label={album.artist}
                                        ellipsize={Pango.EllipsizeMode.END}
                                        xalign={0}
                                    />
                                </box>
                                <box cssClasses={["mpd-album-gloss"]} hexpand={true} vexpand={true} />
                            </box>
                        </button>
                    )}
                </For>
            </Gtk.FlowBox>
        </scrolledwindow>
    );
}

function AlbumList({
    flowBoxVadjustment,
    setSelectedAlbum,
    setCurrentPage,
}: {
    flowBoxVadjustment: Gtk.Adjustment;
    setSelectedAlbum: (album: Album) => void;
    setCurrentPage: (page: string) => void;
}) {
    return (
        <scrolledwindow $type="named" name="library" vexpand={true} vadjustment={flowBoxVadjustment}>
            <Gtk.FlowBox
                cssClasses={["mpd-flow-box"]}
                orientation={Gtk.Orientation.HORIZONTAL}
                activateOnSingleClick={true}
                maxChildrenPerLine={cols}
                minChildrenPerLine={cols}
                selectionMode={Gtk.SelectionMode.NONE}
                valign={Gtk.Align.START}
                rowSpacing={spacing}
                columnSpacing={spacing}
                marginBottom={24}
            >
                <For each={mpdState().mpdMusicLibrary}>
                    {(album) => (
                        <button
                            cssClasses={["mpd-album-button"]}
                            widthRequest={coverArtSize}
                            label={album.title}
                            halign={Gtk.Align.START}
                            valign={Gtk.Align.START}
                            overflow={Gtk.Overflow.HIDDEN}
                            cursor={CURSOR_POINTER}
                            onClicked={() => {
                                setSelectedAlbum(album);
                                setCurrentPage("album");
                            }}
                        >
                            <box layoutManager={new Gtk.BinLayout()} vexpand={true} hexpand={true}>
                                <box orientation={Gtk.Orientation.VERTICAL}>
                                    <box
                                        css={`
                                            background-image: url("file://${album.coverArtPath}");
                                        `}
                                        widthRequest={coverArtSize}
                                        heightRequest={coverArtSize}
                                        cssClasses={["mpd-album-thumb"]}
                                    />
                                    <label
                                        class="title"
                                        label={album.title}
                                        ellipsize={Pango.EllipsizeMode.END}
                                        marginBottom={4}
                                        xalign={0}
                                    />
                                    <label
                                        class="artist"
                                        label={album.artist}
                                        ellipsize={Pango.EllipsizeMode.END}
                                        xalign={0}
                                    />
                                </box>
                                <box cssClasses={["mpd-album-gloss"]} hexpand={true} vexpand={true} />
                            </box>
                        </button>
                    )}
                </For>
            </Gtk.FlowBox>
        </scrolledwindow>
    );
}

function SongList({
    selectedAlbum,
    setCurrentPage,
}: {
    selectedAlbum: Accessor<Album | null>;
    setCurrentPage: (page: string) => void;
}) {
    return (
        <scrolledwindow $type="named" name="album" vexpand={true}>
            <box class="popover-control-list" orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.START}>
                <button
                    class="popover-control-list-item"
                    cursor={CURSOR_POINTER}
                    onClicked={() => setCurrentPage("library")}
                >
                    <box>
                        <image class="popover-control-list-item-icon" iconName="go-previous-symbolic" />
                        <label label="Go back" />
                    </box>
                </button>
                <box cssClasses={["popover-control-list-item", "mpd-album-title-box"]} valign={Gtk.Align.START}>
                    <box>
                        <box
                            layoutManager={new Gtk.BinLayout()}
                            widthRequest={120}
                            heightRequest={120}
                            marginEnd={24}
                            halign={Gtk.Align.START}
                            valign={Gtk.Align.CENTER}
                        >
                            <box
                                css={selectedAlbum.as((a) => `background-image: url("file://${a?.coverArtPath}");`)}
                                cssClasses={["mpd-album-thumb"]}
                                widthRequest={120}
                                heightRequest={120}
                            />
                            <box cssClasses={["mpd-album-gloss"]} />
                        </box>
                    </box>
                    <box
                        orientation={Gtk.Orientation.VERTICAL}
                        halign={Gtk.Align.START}
                        valign={Gtk.Align.CENTER}
                        hexpand={true}
                    >
                        <label
                            class="title"
                            label={selectedAlbum.as((a) => a?.title ?? "")}
                            ellipsize={Pango.EllipsizeMode.END}
                            lines={2}
                            wrap={true}
                            xalign={0}
                            hexpand={true}
                            halign={Gtk.Align.START}
                        />
                        <label
                            class="artist"
                            label={selectedAlbum.as((a) => a?.artist ?? "")}
                            ellipsize={Pango.EllipsizeMode.END}
                            lines={2}
                            wrap={true}
                            xalign={0}
                            hexpand={true}
                            halign={Gtk.Align.START}
                        />
                    </box>
                </box>
                <For each={selectedAlbum.as((a) => a?.songs ?? [])}>
                    {(song: Song, index) => (
                        <button
                            cssClasses={["mpd-song-button", "popover-control-list-item"]}
                            cursor={CURSOR_POINTER}
                            valign={Gtk.Align.START}
                            onClicked={() => mpdState().mpdPlayAlbum(selectedAlbum.peek()!, index.peek())}
                        >
                            <box>
                                <label class="track" label={`${index.peek() + 1}`} widthChars={2} xalign={0} />
                                <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} marginEnd={18}>
                                    <label
                                        class="title"
                                        label={song.title}
                                        xalign={0}
                                        ellipsize={Pango.EllipsizeMode.END}
                                    />
                                    <label
                                        class="artist"
                                        label={song.artist}
                                        xalign={0}
                                        ellipsize={Pango.EllipsizeMode.END}
                                        visible={song.artist != selectedAlbum.peek()?.artist}
                                    />
                                </box>
                                <NowPlayingAnimatedIcon
                                    visible={createComputed(() => {
                                        const f = mpdState().mpdCurrentSongFile();
                                        const p = mpdState().mpdPlaybackStatus();
                                        return f === song.file && p === AstalMpris.PlaybackStatus.PLAYING;
                                    })}
                                />
                                <box hexpand={true} />
                                {song.time && <label class="time" label={song.time} />}
                            </box>
                        </button>
                    )}
                </For>
            </box>
        </scrolledwindow>
    );
}

const nowPlayingAnimatedIconGradient = (() => {
    const gradient = new giCairo.LinearGradient(0, 0, 32, 32);
    let { red: red1, green: green1, blue: blue1 } = config.colors.accent1;
    gradient.addColorStopRGB(0, red1, green1, blue1);
    let { red: red2, green: green2, blue: blue2 } = config.colors.accent2;
    gradient.addColorStopRGB(1, red2, green2, blue2);
    return gradient;
})();

function NowPlayingAnimatedIcon({ visible }: { visible: Accessor<boolean> }) {
    let lastFrame = 0;
    const strokeWidth = 6;
    const hStrokeWidth = strokeWidth / 2;

    return (
        <drawingarea
            visible={visible}
            widthRequest={32}
            heightRequest={32}
            valign={Gtk.Align.CENTER}
            onMap={(self) => {
                self.add_tick_callback((_, clock) => {
                    const now = clock.get_frame_time();
                    if (now - lastFrame > 20_000) {
                        lastFrame = now;
                        self.queue_draw();
                    }
                    return self.get_mapped();
                });
            }}
            $={(self) => {
                self.set_draw_func((area, cr, _, height) => {
                    const t = area.get_frame_clock()!.get_frame_time() / 110_000;
                    const a = 4 + ((1 + Math.cos(t + Math.PI / 2)) / 2) * (height - 8 - hStrokeWidth);
                    const b = 4 + ((1 + Math.cos(t + Math.PI)) / 2) * (height - 8 - hStrokeWidth);
                    const c = 4 + ((1 + Math.cos(t)) / 2) * (height - 8 - hStrokeWidth);

                    cr.moveTo(hStrokeWidth, height / 2 - a / 2);
                    cr.lineTo(hStrokeWidth, height / 2 + a / 2);

                    cr.moveTo(hStrokeWidth * 4, height / 2 - b / 2);
                    cr.lineTo(hStrokeWidth * 4, height / 2 + b / 2);

                    cr.moveTo(hStrokeWidth * 7, height / 2 - c / 2);
                    cr.lineTo(hStrokeWidth * 7, height / 2 + c / 2);

                    cr.setSource(nowPlayingAnimatedIconGradient);
                    cr.setLineWidth(strokeWidth);
                    cr.setLineCap(giCairo.LineCap.ROUND);
                    cr.stroke();

                    cr.$dispose();
                });
            }}
        />
    );
}

export default function MusicLibraryPopoverWindow() {
    const [currentPage, setCurrentPage] = createState("library");
    const [selectedAlbum, setSelectedAlbum] = createState<Album | null>(null);

    const flowBoxVadjustment = new Gtk.Adjustment();

    return (
        <contrapshellpopoverwindow
            name={"music-library"}
            anchoredToDock={true}
            widthRequest={width}
            heightRequest={678}
            onHide={() => {
                flowBoxVadjustment.set_value(0);
                setCurrentPage("library");
                setSelectedAlbum(null);
            }}
        >
            <box
                orientation={Gtk.Orientation.VERTICAL}
                widthRequest={width}
                cssClasses={["popover-standard-inner", "mpd"]}
            >
                <box orientation={Gtk.Orientation.HORIZONTAL} cssClasses={["popover-title"]} valign={Gtk.Align.START}>
                    <image iconName={"emblem-music"} halign={Gtk.Align.START} />
                    <label label={"Music"} xalign={0} hexpand={true} />
                    {/* <button
                        label={currentPage.as((p) => (p === "library" ? "Playlists" : "Albums"))}
                        cursor={CURSOR_POINTER}
                        visible={currentPage.as((p) => p !== "album")}
                        marginEnd={8}
                    /> */}
                    <button
                        cursor={CURSOR_POINTER}
                        valign={Gtk.Align.CENTER}
                        onClicked={mpdState().mpdShufflePlayAll}
                        // sensitive={currentPage.as((p) => p !== "album")}
                    >
                        <box spacing={12}>
                            <image iconName="media-playlist-shuffle-symbolic" />
                            <label label="Shuffle all" />
                        </box>
                    </button>
                </box>
                <stack
                    transitionType={Gtk.StackTransitionType.CROSSFADE}
                    transitionDuration={100}
                    $={(self) => createEffect(() => self.set_visible_child_name(currentPage()))}
                >
                    <AlbumList
                        flowBoxVadjustment={flowBoxVadjustment}
                        setSelectedAlbum={setSelectedAlbum}
                        setCurrentPage={setCurrentPage}
                    />
                    <SongList selectedAlbum={selectedAlbum} setCurrentPage={setCurrentPage} />
                    {/* <PlaylistList /> */}
                </stack>
            </box>
        </contrapshellpopoverwindow>
    );
}
