import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import { Accessor, createBinding, createRoot } from "gnim";

export type BluetoothState = {
    devices: Accessor<AstalBluetooth.Device[]>;
};

let bluetoothStateInstance: BluetoothState | null = null;

function createBluetoothState(): BluetoothState {
    bluetoothStateInstance = {
        devices: createBinding(AstalBluetooth.get_default(), "devices"),
    };

    return bluetoothStateInstance;
}

export function bluetoothState(): BluetoothState {
    return bluetoothStateInstance ?? createRoot(createBluetoothState);
}
