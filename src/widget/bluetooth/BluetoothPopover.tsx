import { Gtk } from "ags/gtk4";
import { CURSOR_POINTER } from "../../utils/gtk";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import { createBinding, For } from "gnim";
import Pango from "gi://Pango?version=1.0";
import { execAsync } from "ags/process";
import config from "../../config";
import { astalBluetooth, bluetoothDevices } from "../../state/bluetooth/bluetooth_state";

function BluetoothDeviceItem({ device }: { device: AstalBluetooth.Device }) {
    return (
        <box cssClasses={["popover-tray-item"]} orientation={Gtk.Orientation.HORIZONTAL} valign={Gtk.Align.CENTER}>
            <label
                label={device.name}
                hexpand={true}
                maxWidthChars={25}
                xalign={0}
                ellipsize={Pango.EllipsizeMode.END}
            />
            <switch
                active={createBinding(device, "connected")}
                sensitive={createBinding(device, "connecting").as((c) => !c)}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.END}
                cursor={CURSOR_POINTER}
                onStateSet={(self) => {
                    if (device.connected) {
                        device.disconnect_device((_, result) => {
                            try {
                                device.disconnect_device_finish(result);
                            } catch {
                                self.active = true;
                            }
                        });
                    } else {
                        device.connect_device((_, result) => {
                            try {
                                device.connect_device_finish(result);
                            } catch {
                                self.active = false;
                            }
                        });
                    }
                }}
            />
        </box>
    );
}

export function BluetoothPopover() {
    return (
        <glassypopover widthRequest={420}>
            <box
                orientation={Gtk.Orientation.VERTICAL}
                cssClasses={["popover-standard-inner"]}
                overflow={Gtk.Overflow.HIDDEN}
            >
                <box orientation={Gtk.Orientation.HORIZONTAL} cssClasses={["popover-title"]} valign={Gtk.Align.START}>
                    <image iconName={"bluetooth-symbolic"} halign={Gtk.Align.START} />
                    <label label={"Bluetooth"} xalign={0} hexpand={true} />
                    <button
                        label="Bluetooth settings"
                        cursor={CURSOR_POINTER}
                        onClicked={() => execAsync(config.bluetooth.bluetoothSettingsCommand)}
                    />
                </box>
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    cssClasses={["popover-tray"]}
                    overflow={Gtk.Overflow.HIDDEN}
                    marginTop={24}
                    marginStart={24}
                    marginEnd={24}
                >
                    <box
                        cssClasses={["popover-tray-item"]}
                        orientation={Gtk.Orientation.HORIZONTAL}
                        valign={Gtk.Align.CENTER}
                    >
                        <label label="Enabled" hexpand={true} xalign={0} />
                        <switch
                            active={createBinding(astalBluetooth.adapter, "powered")}
                            cursor={CURSOR_POINTER}
                            valign={Gtk.Align.CENTER}
                            halign={Gtk.Align.END}
                            onStateSet={() => {
                                const commandArg = astalBluetooth.adapter.powered ? "off" : "on";
                                execAsync(`bluetoothctl power ${commandArg}`);
                            }}
                        />
                    </box>
                </box>
                <label label="Devices" hexpand={true} marginTop={24} marginBottom={24} />
                <box
                    orientation={Gtk.Orientation.VERTICAL}
                    cssClasses={["popover-tray"]}
                    overflow={Gtk.Overflow.HIDDEN}
                    marginStart={24}
                    marginEnd={24}
                    marginBottom={24}
                >
                    <For each={bluetoothDevices}>{(device) => <BluetoothDeviceItem device={device} />}</For>
                </box>
            </box>
        </glassypopover>
    );
}
