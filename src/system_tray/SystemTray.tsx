import { Gtk } from "ags/gtk4";
import AstalTray from "gi://AstalTray?version=0.1";
import { createBinding, For, With } from "gnim";
import { CURSOR_POINTER } from "../utils/gtk";
import { trayItems } from "../system_tray/system_tray_state";
import { BarDivider } from "../bar/BarDivider";

export function MenuTrayItem({ item }: { item: AstalTray.TrayItem }) {
    return (
        <menubutton cursor={CURSOR_POINTER} tooltipText={createBinding(item, "tooltipText")}>
            <image pixelSize={16} valign={Gtk.Align.CENTER} gicon={createBinding(item, "gicon")} />
            <contrapshellpopovermenu
                menuModel={createBinding(item, "menu_model")}
                $={(self) => {
                    self.insert_action_group("dbusmenu", item.actionGroup);
                }}
            />
            {/* <ContrapshellMenu menuModel={createBinding(item, "menuModel")} /> */}
        </menubutton>
    );
}

function ButtonTrayItem({ item }: { item: AstalTray.TrayItem }) {
    return (
        <button cursor={CURSOR_POINTER} tooltipText={createBinding(item, "tooltipText")} onClicked={() => {}}>
            <image pixelSize={16} valign={Gtk.Align.CENTER} gicon={createBinding(item, "gicon")} />
        </button>
    );
}

export default function SystemTray() {
    return (
        <box class="bar-group" overflow={Gtk.Overflow.HIDDEN}>
            <box orientation={Gtk.Orientation.HORIZONTAL} vexpand={true} visible={trayItems.as((ti) => !!ti.length)}>
                <box visible={trayItems.as((ti) => !!ti.length)}>
                    <BarDivider />
                </box>
                <For each={trayItems}>
                    {(trayItem) => (
                        <box cssClasses={["tray-icon", "bar-button"]}>
                            {trayItem.menuModel ? <MenuTrayItem item={trayItem} /> : <ButtonTrayItem item={trayItem} />}
                        </box>
                    )}
                </For>
            </box>
        </box>
    );
}
