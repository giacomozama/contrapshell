import { Gtk } from "ags/gtk4";
import { CURSOR_POINTER, popdownParentWindow } from "../utils/gtk";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import { createBinding, For } from "gnim";
import Pango from "gi://Pango?version=1.0";
import { execAsync } from "ags/process";
import config from "../config";
import { bluetoothState } from "./bluetooth_state";

function BluetoothDeviceItem({ device }: { device: AstalBluetooth.Device }) {
    return (
        <box class="popover-control-list-item" orientation={Gtk.Orientation.HORIZONTAL} valign={Gtk.Align.CENTER}>
            <image class="popover-control-list-item-icon" iconName={`${device.icon}-symbolic`} />
            <label
                label={device.name}
                hexpand={true}
                maxWidthChars={0}
                wrap={true}
                wrapMode={Gtk.WrapMode.CHAR}
                lines={1}
                xalign={0}
                ellipsize={Pango.EllipsizeMode.END}
            />
            <switch
                active={createBinding(device, "connected")}
                sensitive={createBinding(device, "connecting").as((c) => !c)}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.END}
                cursor={CURSOR_POINTER}
            >
                <Gtk.GestureClick
                    button={1}
                    onBegin={() => {
                        if (device.connected) {
                            device.disconnect_device((_, result) => {
                                try {
                                    device.disconnect_device_finish(result);
                                } catch {
                                }
                            });
                        } else if (!device.connected) {
                            device.connect_device((_, result) => {
                                try {
                                    device.connect_device_finish(result);
                                } catch {
                                }
                            });
                        }
                    }}
                />
            </switch>
        </box>
    );
}

export function BluetoothPopoverWindow() {
    return (
        <contrapshellpopoverwindow name="bluetooth" widthRequest={420}>
            <box
                orientation={Gtk.Orientation.VERTICAL}
                cssClasses={["popover-standard-inner"]}
                overflow={Gtk.Overflow.HIDDEN}
            >
                <box orientation={Gtk.Orientation.HORIZONTAL} cssClasses={["popover-title"]} valign={Gtk.Align.START}>
                    <image iconName={"bluetooth-symbolic"} halign={Gtk.Align.START} />
                    <label label={"Bluetooth"} xalign={0} hexpand={true} />
                    <button
                        cursor={CURSOR_POINTER}
                        valign={Gtk.Align.CENTER}
                        onClicked={(self) => {
                            execAsync(config.bluetooth.bluetoothSettingsCommand);
                            popdownParentWindow(self);
                        }}
                    >
                        <box spacing={12}>
                            <image iconName="settings-symbolic" />
                            <label label="Bluetooth settings" />
                        </box>
                    </button>
                </box>
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    cssClasses={["popover-control-list"]}
                    overflow={Gtk.Overflow.HIDDEN}
                >
                    <box
                        class="popover-control-list-item"
                        orientation={Gtk.Orientation.HORIZONTAL}
                        valign={Gtk.Align.CENTER}
                    >
                        <label label="Enabled" hexpand={true} xalign={0} />
                        <switch
                            active={createBinding(AstalBluetooth.get_default().adapter, "powered")}
                            cursor={CURSOR_POINTER}
                            valign={Gtk.Align.CENTER}
                            halign={Gtk.Align.END}
                            onStateSet={() => {
                                const commandArg = AstalBluetooth.get_default().adapter.powered ? "off" : "on";
                                execAsync(`${config.path.bluetoothctl} power ${commandArg}`);
                            }}
                        />
                    </box>
                    <label
                        label="Devices"
                        cssClasses={["popover-control-list-item", "header"]}
                        hexpand={true}
                        xalign={0}
                    />
                    <For each={bluetoothState().devices}>{(device) => <BluetoothDeviceItem device={device} />}</For>
                </box>
            </box>
        </contrapshellpopoverwindow>
    );
}
