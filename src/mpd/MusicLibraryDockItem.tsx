import { Gtk } from "ags/gtk4";
import { CURSOR_POINTER } from "../utils/gtk";
import { Squircle } from "../misc/Squircle";
import { mpdState } from "./mpd_state";
import config from "../config";
import app from "ags/gtk4/app";

export default function MusicLibraryDockItem({ iconName }: { iconName: string }) {
    return (
        <button
            cssClasses={["dock-item", "mpd"]}
            widthRequest={config.dock.itemSize}
            heightRequest={config.dock.itemSize}
            tooltipText={"Music"}
            sensitive={mpdState().mpdMusicLibrary.as((ml) => !!ml.length)}
            valign={Gtk.Align.CENTER}
            cursor={CURSOR_POINTER}
            onClicked={(self) => {
                self.add_css_class("active");
                const window = app.get_window("music-library") as GlassyWidgets.ContrapshellPopoverWindow;
                const connId = window.connect("hide", () => {
                    self.remove_css_class("active");
                    window.disconnect(connId);
                });
                window.show_from(self);
            }}
        >
            <Squircle>
                <image pixelSize={config.dock.iconSize} iconName={iconName} />
            </Squircle>
        </button>
    );
}
