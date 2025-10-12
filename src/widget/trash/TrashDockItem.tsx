import { CURSOR_POINTER } from "../../utils/gtk";
import { Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { Squircle } from "../misc/Squircle";
import { GlassyMenu } from "../misc/GlassyPopover";
import { isTrashFull, trashActionGroup, trashMenu } from "../../state/trash/trash_state";

export default function TrashDockItem() {
    let isHovered = false;
    return (
        <menubutton
            cssClasses={["dock-item", "trash-icon"]}
            widthRequest={56}
            heightRequest={56}
            tooltipText={"Trash"}
            valign={Gtk.Align.CENTER}
            cursor={CURSOR_POINTER}
        >
            <Gtk.GestureSingle
                button={2}
                onEnd={(source) => {
                    if (!isHovered) return;
                    AstalHyprland.get_default().get_focused_client().kill();
                    source.set_state(Gtk.EventSequenceState.CLAIMED);
                }}
            />
            <Gtk.EventControllerMotion onEnter={() => (isHovered = true)} onLeave={() => (isHovered = false)} />
            <box layoutManager={new Gtk.BinLayout()}>
                <Squircle>
                    <image
                        pixelSize={42}
                        widthRequest={48}
                        heightRequest={48}
                        iconName={isTrashFull.as((f) => (f ? "trashcan_full" : "trashcan_empty"))}
                    />
                </Squircle>
            </box>
            <GlassyMenu
                $={(self) => {
                    self.set_menu_model(trashMenu);
                    self.insert_action_group("trash", trashActionGroup);
                }}
            />
        </menubutton>
    );
}
