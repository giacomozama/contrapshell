import app from "ags/gtk4/app";
import { Astal, Gtk } from "ags/gtk4";
import { Accessor } from "gnim";
import { firstNonFullscreenMonitor } from "../../utils/monitors";
import MediaControls from "../media/MediaControls";
import AudioControls from "../audio/AudioControls";
import SystemTray from "../system_tray/SystemTray";
import CaffeineBarButton from "../caffeine/CaffeineBarButton";
import GradientBox from "../misc/GradientBox";
import DashMenuButton from "../dash/DashMenu";
import NotificationsBarButton from "../notifications/NotificationsBarButton";
import WeatherButton from "../weather/Weather";
import BluetoothBarButton from "../bluetooth/BluetoothBarButton";
import CalendarBarButton from "../calendar/CalendarBarButton";
import UpdatesBarButton from "../updates/UpdatesBarButton";
import GSConnectIndicator from "../gsconnect/GSConnectIndicator";
import EyeCandyBarButton from "../eye_candy/EyeCandyBarButton";
import NetworkBarButton from "../network/NetworkBarButton";
import { ResourceUsageDash } from "../resource_usage/ResourceUsage";

export default function Bar() {
    return (
        <window
            visible
            name="bar"
            class="Bar"
            gdkmonitor={firstNonFullscreenMonitor.as((m) => m.gdkMonitor)}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
            application={app}
        >
            <GradientBox cssName={"main"} animationSpeed={0} cornerRadius={12} thickness={1.4}>
                <box cssName="main-inner">
                    <centerbox heightRequest={32} valign={Gtk.Align.CENTER} hexpand={true} class={"BarContent"}>
                        <box $type="start" spacing={4}>
                            <DashMenuButton />
                            <ResourceUsageDash />
                            <WeatherButton />
                            <UpdatesBarButton />
                        </box>
                        <box $type="center" halign={Gtk.Align.CENTER}>
                            <MediaControls />
                        </box>
                        <box $type="end" spacing={4}>
                            <SystemTray />
                            <box class="bar-group" overflow={Gtk.Overflow.HIDDEN}>
                                <BluetoothBarButton />
                                <NetworkBarButton />
                                <CaffeineBarButton />
                                <GSConnectIndicator />
                                <EyeCandyBarButton />
                            </box>
                            <AudioControls />
                            <CalendarBarButton />
                            <NotificationsBarButton />
                        </box>
                    </centerbox>
                </box>
            </GradientBox>
        </window>
    );
}
