import { Gtk } from "ags/gtk4";
import { CURSOR_POINTER } from "../../utils/gtk";
import { Squircle } from "../misc/Squircle";
import MusicLibraryPopover from "./MusicLibraryPopover";
import { mpdMusicLibrary } from "../../state/mpd/mpd_state";

export default function MusicLibraryDockItem({ iconName }: { iconName: string }) {
    return (
        <menubutton
            cssClasses={["dock-item", "mpd"]}
            widthRequest={56}
            heightRequest={56}
            tooltipText={"Music"}
            sensitive={mpdMusicLibrary.as((ml) => !!ml.length)}
            valign={Gtk.Align.CENTER}
            cursor={CURSOR_POINTER}
        >
            <Squircle>
                <image pixelSize={42} widthRequest={48} heightRequest={48} iconName={iconName} />
            </Squircle>
            <MusicLibraryPopover />
        </menubutton>
    );
}
