import { Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";
import { Accessor, createBinding, For } from "gnim";
import { CURSOR_POINTER } from "../../utils/gtk";
import Pango from "gi://Pango?version=1.0";
import { execAsync } from "ags/process";
import config from "../../config";
import { popdownParentMenuButton } from "../../utils/gtk";
import {
    audioInputState,
    audioOutputState,
    AudioState,
    onHideAudioPopover,
    onShowAudioPopover,
    volumeIconName,
} from "../../state/audio/audio_state";

function AudioDeviceItem({ endpoint }: { endpoint: Wp.Endpoint }) {
    return (
        <togglebutton
            cssClasses={["popover-tray-item"]}
            active={createBinding(endpoint, "is_default")}
            onClicked={() => endpoint.set_is_default(true)}
            cursor={CURSOR_POINTER}
        >
            <box orientation={Gtk.Orientation.HORIZONTAL} valign={Gtk.Align.CENTER}>
                <label
                    label={endpoint.description}
                    hexpand={true}
                    maxWidthChars={25}
                    xalign={0}
                    ellipsize={Pango.EllipsizeMode.END}
                />
                <image
                    iconName="checkmark-symbolic"
                    class="checkmark"
                    visible={createBinding(endpoint, "is_default")}
                    valign={Gtk.Align.CENTER}
                    halign={Gtk.Align.END}
                />
            </box>
        </togglebutton>
    );
}

function VolumeControlAndDefaultDeviceSelector({ state }: { state: AudioState }) {
    return (
        <box orientation={Gtk.Orientation.VERTICAL}>
            <box
                cssClasses={["volume-control-box"]}
                orientation={Gtk.Orientation.HORIZONTAL}
                hexpand={true}
                valign={Gtk.Align.CENTER}
            >
                <image iconName={state.iconName} valign={Gtk.Align.CENTER} cursor={CURSOR_POINTER}>
                    <Gtk.GestureSingle
                        button={1}
                        onEnd={() => {
                            const endpoint = state.defaultEndpoint.get();
                            endpoint.set_mute(!endpoint.get_mute());
                        }}
                    />
                </image>
                <slider
                    max={1}
                    min={0}
                    value={state.volume}
                    step={0.01}
                    hexpand={true}
                    sensitive={state.muted.as((m) => !m)}
                    onChangeValue={(self) => {
                        state.defaultEndpoint.get().set_volume(self.value);
                    }}
                />
            </box>
            <box
                orientation={Gtk.Orientation.VERTICAL}
                cssClasses={["popover-tray"]}
                overflow={Gtk.Overflow.HIDDEN}
                marginStart={24}
                marginEnd={24}
            >
                <For each={state.endpoints}>{(endpoint: Wp.Endpoint) => <AudioDeviceItem endpoint={endpoint} />}</For>
            </box>
        </box>
    );
}

function AudioControlsPopover() {
    return (
        <glassypopover widthRequest={400} onShow={() => onShowAudioPopover()} onHide={() => onHideAudioPopover()}>
            <box cssClasses={["popover-standard-inner"]} orientation={Gtk.Orientation.VERTICAL} hexpand={true}>
                <box orientation={Gtk.Orientation.HORIZONTAL} cssClasses={["popover-title"]} hexpand={true}>
                    <image iconName="sound-wave-symbolic" halign={Gtk.Align.START} valign={Gtk.Align.CENTER} />
                    <label label="Audio" xalign={0} valign={Gtk.Align.CENTER} hexpand={true} />
                    <button
                        onClicked={(self) => {
                            execAsync(config.audioControls.audioSettingsCommand);
                            popdownParentMenuButton(self);
                        }}
                        cursor={CURSOR_POINTER}
                        valign={Gtk.Align.CENTER}
                        label="Audio settings"
                    />
                </box>
                <box orientation={Gtk.Orientation.VERTICAL} hexpand={true} marginBottom={24}>
                    <VolumeControlAndDefaultDeviceSelector state={audioOutputState} />
                    <VolumeControlAndDefaultDeviceSelector state={audioInputState} />
                </box>
            </box>
        </glassypopover>
    );
}

export default function AudioControls() {
    return (
        <menubutton widthRequest={90} cssClasses={["audio-controls", "bar-button"]} cursor={CURSOR_POINTER}>
            <box orientation={Gtk.Orientation.HORIZONTAL} hexpand={true}>
                <image iconName={volumeIconName} />
                <label
                    label={audioOutputState.volume.as((v) => `${(v * 100).toFixed(0)}%`)}
                    hexpand={true}
                    halign={Gtk.Align.END}
                />
            </box>
            <AudioControlsPopover />
        </menubutton>
    );
}
