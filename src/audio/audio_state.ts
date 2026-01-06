import { Gtk } from "ags/gtk4";
import { timeout, Timer } from "ags/time";
import AstalWp from "gi://AstalWp?version=0.1";
import { Accessor, createBinding, createComputed, createEffect, createRoot, createState } from "gnim";
import app from "ags/gtk4/app";

export type AudioState = {
    input: AudioIOState;
    output: AudioIOState;
    volumeIconName: Accessor<string>;
    onShowAudioPopover: () => void;
    onHideAudioPopover: () => void;
};

export type AudioIOState = {
    defaultEndpoint: Accessor<AstalWp.Endpoint>;
    volume: Accessor<number>;
    muted: Accessor<boolean>;
    iconName: Accessor<string>;
    endpoints: Accessor<AstalWp.Endpoint[]>;
};

let audioStateInstance: AudioState | null = null;

function createAudioState() {
    const wp = AstalWp.get_default();

    const defaultSpeaker = createBinding(wp, "defaultSpeaker");
    const defaultSpeakerVolume = createBinding(wp, "defaultSpeaker", "volume");
    const defaultSpeakerMuted = createBinding(wp, "defaultSpeaker", "mute");

    const defaultSpeakerIcon = createComputed(() => {
        const volume = defaultSpeakerVolume();
        const muted = defaultSpeakerMuted();
        return volume && !muted ? "audio-volume-headphones-symbolic" : "audio-volume-muted-headphones-symbolic";
    });

    const speakers = createBinding(wp, "audio", "speakers");

    const audioOutputState: AudioIOState = {
        defaultEndpoint: defaultSpeaker,
        volume: defaultSpeakerVolume,
        muted: defaultSpeakerMuted,
        iconName: defaultSpeakerIcon,
        endpoints: speakers,
    };

    const defaultMic = createBinding(wp, "defaultMicrophone");
    const defaultMicVolume = createBinding(wp, "defaultMicrophone", "volume");
    const defaultMicMuted = createBinding(wp, "defaultMicrophone", "mute");
    const defaultMicIcon = createComputed(() => {
        const volume = defaultMicVolume();
        const muted = defaultMicMuted();
        return volume && !muted ? "audio-input-microphone-symbolic" : "audio-input-microphone-muted-symbolic";
    });
    const microphones = createBinding(wp, "audio", "microphones");

    const audioInputState: AudioIOState = {
        defaultEndpoint: defaultMic,
        volume: defaultMicVolume,
        muted: defaultMicMuted,
        iconName: defaultMicIcon,
        endpoints: microphones,
    };

    let isAudioPopoverVisible = false;
    const [showVolumeChangedWindow, setShowVolumeChangedWindow] = createState(false);

    function onShowAudioPopover() {
        setShowVolumeChangedWindow(false);
        isAudioPopoverVisible = true;
    }

    function onHideAudioPopover() {
        isAudioPopoverVisible = false;
    }

    let skippedTicks = 2;
    let volumeChangedTimer: Timer | null = null;

    const VOLUME_CHANGE_SOUND = Gtk.MediaFile.new_for_filename(`${SRC}/resources/audio/click.ogg`);

    createEffect(() => {
        defaultSpeakerVolume(); // track the volume

        if (skippedTicks) {
            skippedTicks--;
            return;
        }

        if (isAudioPopoverVisible) {
            setShowVolumeChangedWindow(false);
            volumeChangedTimer?.cancel();
            volumeChangedTimer = null;
            return;
        }

        setShowVolumeChangedWindow(true);

        volumeChangedTimer?.cancel();
        volumeChangedTimer = timeout(2000, () => {
            setShowVolumeChangedWindow(false);
            volumeChangedTimer = null;
        });

        VOLUME_CHANGE_SOUND.play();
    });

    const volumeIconName = createComputed(() => {
        const volume = defaultSpeakerVolume();
        const muted = defaultSpeakerMuted();
        if (muted || volume === 0) return "audio-volume-muted-symbolic";
        if (volume > 0.66) return "audio-volume-high-symbolic";
        if (volume > 0.33) return "audio-volume-medium-symbolic";
        return "audio-volume-low-symbolic";
    });

    createEffect(() => {
        const window = app.get_window("volume-change");
        if (showVolumeChangedWindow()) {
            window?.show();
        } else {
            window?.hide();
        }
    });

    audioStateInstance = {
        input: audioInputState,
        output: audioOutputState,
        volumeIconName,
        onShowAudioPopover,
        onHideAudioPopover,
    };

    return audioStateInstance;
}

export function audioState(): AudioState {
    return audioStateInstance ?? createRoot(createAudioState);
}
