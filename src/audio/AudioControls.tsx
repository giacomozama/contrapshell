import { Gtk } from "ags/gtk4";
import Wp from "gi://AstalWp";
import { Accessor, createBinding, For } from "gnim";
import { CURSOR_POINTER } from "../utils/gtk";
import Pango from "gi://Pango?version=1.0";
import { execAsync } from "ags/process";
import config from "../config";
import { popdownParentWindow } from "../utils/gtk";
import { audioState, AudioIOState } from "./audio_state";
import app from "ags/gtk4/app";

function AudioDeviceItem({ endpoint }: { endpoint: Wp.Endpoint }) {
    return (
        <togglebutton
            cssClasses={["popover-control-list-item"]}
            active={createBinding(endpoint, "is_default")}
            onClicked={() => endpoint.set_is_default(true)}
            cursor={CURSOR_POINTER}
        >
            <box orientation={Gtk.Orientation.HORIZONTAL} valign={Gtk.Align.CENTER}>
                <label
                    label={endpoint.description}
                    hexpand={true}
                    maxWidthChars={0}
                    wrap={true}
                    wrapMode={Gtk.WrapMode.CHAR}
                    lines={1}
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

function VolumeControlAndDefaultDeviceSelector({ state }: { state: AudioIOState }) {
    return (
        <box orientation={Gtk.Orientation.VERTICAL}>
            <box
                cssClasses={["popover-control-list-item"]}
                orientation={Gtk.Orientation.HORIZONTAL}
                hexpand={true}
                valign={Gtk.Align.CENTER}
            >
                <image
                    iconName={state.iconName}
                    valign={Gtk.Align.CENTER}
                    cursor={CURSOR_POINTER}
                    class="popover-control-list-item-icon"
                >
                    <Gtk.GestureSingle
                        button={1}
                        onEnd={() => {
                            const endpoint = state.defaultEndpoint.peek();
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
                        state.defaultEndpoint.peek().set_volume(self.value);
                    }}
                />
            </box>
            <For each={state.endpoints}>{(endpoint: Wp.Endpoint) => <AudioDeviceItem endpoint={endpoint} />}</For>
        </box>
    );
}

export function AudioControlsPopoverWindow() {
    return (
        <contrapshellpopoverwindow
            name={"audio-controls"}
            widthRequest={400}
            onShow={() => audioState().onShowAudioPopover()}
            onHide={() => audioState().onHideAudioPopover()}
        >
            <box cssClasses={["popover-standard-inner"]} orientation={Gtk.Orientation.VERTICAL} hexpand={true}>
                <box orientation={Gtk.Orientation.HORIZONTAL} cssClasses={["popover-title"]} hexpand={true}>
                    <image iconName="sound-wave-symbolic" halign={Gtk.Align.START} valign={Gtk.Align.CENTER} />
                    <label label="Audio" xalign={0} valign={Gtk.Align.CENTER} hexpand={true} />
                    <button
                        onClicked={(self) => {
                            execAsync(config.audioControls.audioSettingsCommand);
                            popdownParentWindow(self);
                        }}
                        cursor={CURSOR_POINTER}
                        valign={Gtk.Align.CENTER}
                    >
                        <box spacing={12}>
                            <image iconName="settings-symbolic" />
                            <label label="Audio settings" />
                        </box>
                    </button>
                </box>
                <box orientation={Gtk.Orientation.VERTICAL} hexpand={true} class={"popover-control-list"}>
                    <VolumeControlAndDefaultDeviceSelector state={audioState().output} />
                    <VolumeControlAndDefaultDeviceSelector state={audioState().input} />
                </box>
            </box>
        </contrapshellpopoverwindow>
    );
}

export default function AudioControls() {
    return (
        <button
            widthRequest={100}
            cssClasses={["audio-controls", "bar-button"]}
            cursor={CURSOR_POINTER}
            onClicked={(self) => {
                self.add_css_class("active");
                const window = app.get_window("audio-controls") as GlassyWidgets.ContrapshellPopoverWindow;
                const connId = window.connect("hide", () => {
                    self.remove_css_class("active");
                    window.disconnect(connId);
                });
                window.show_from(self);
            }}
        >
            <box orientation={Gtk.Orientation.HORIZONTAL} hexpand={true}>
                <image iconName={audioState().volumeIconName} />
                <label
                    label={audioState().output.volume.as((v) => `${(v * 100).toFixed(0)}%`)}
                    hexpand={true}
                    halign={Gtk.Align.END}
                />
            </box>
        </button>
    );
}
