import { Gtk } from "ags/gtk4";
import AstalTray from "gi://AstalTray?version=0.1";
import { createBinding, createRoot, For } from "gnim";
import { CURSOR_POINTER } from "../../utils/gtk";
import { trayItems } from "../../state/system_tray/system_tray_state";

export function MenuTrayItem({ item }: { item: AstalTray.TrayItem }) {
    return (
        <menubutton
            cursor={CURSOR_POINTER}
            tooltipText={createBinding(item, "tooltipText")}
            popover={createBinding(item, "menu_model").as(
                (model) =>
                    createRoot((dispose) => (
                        <glassymenu
                            onNotifyParent={(self) => {
                                if (!self.get_parent()) {
                                    dispose();
                                }
                            }}
                            $={(self) => {
                                self.insert_action_group("dbusmenu", item.actionGroup);
                                self.set_menu_model(model);
                            }}
                        />
                    )) as Gtk.Popover
            )}
        >
            <image pixelSize={16} valign={Gtk.Align.CENTER} gicon={createBinding(item, "gicon")} />
        </menubutton>
    );
}

function ButtonTrayItem({ item }: { item: AstalTray.TrayItem }) {
    return createRoot((dispose) => (
        <button
            cursor={CURSOR_POINTER}
            tooltipText={createBinding(item, "tooltipText")}
            onUnmap={dispose}
            onClicked={() => {}}
        >
            <image pixelSize={16} valign={Gtk.Align.CENTER} gicon={createBinding(item, "gicon")} />
        </button>
    ));
}

export default function SystemTray() {
    return (
        <box>
            <box
                orientation={Gtk.Orientation.HORIZONTAL}
                cssClasses={["bar-chip", "system-tray"]}
                vexpand={true}
                visible={trayItems.as((ti) => ti.length > 0)}
                overflow={Gtk.Overflow.HIDDEN}
            >
                <For each={trayItems}>
                    {(trayItem) => (
                        <box cssClasses={["tray-icon"]}>
                            {trayItem.menuModel ? <MenuTrayItem item={trayItem} /> : <ButtonTrayItem item={trayItem} />}
                        </box>
                    )}
                </For>
            </box>
        </box>
    );
}
