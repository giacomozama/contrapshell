import { createRoot, With } from "gnim";
import GradientBox from "../misc/GradientBox";
import { firstNonFullscreenMonitor } from "../../utils/monitors";
import { Astal, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { dismissNewNotificationWindow, notifsToShow } from "../../state/notifications/notifications_state";
import { NotificationItem } from "../notifications/NotificationItem";

export function NewNotificationWindow() {
    return createRoot(
        (dispose) =>
            (
                <window
                    name="new-notification"
                    cssClasses={["NewNotification"]}
                    gdkmonitor={firstNonFullscreenMonitor.as((m) => m.gdkMonitor)}
                    marginTop={58}
                    marginRight={4}
                    widthRequest={500}
                    defaultWidth={500}
                    exclusivity={Astal.Exclusivity.IGNORE}
                    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
                    application={app}
                    onDestroy={dispose}
                >
                    <GradientBox animationSpeed={1}>
                        <With value={notifsToShow}>
                            {(notifs) =>
                                notifs.length !== 0 && (
                                    <NotificationItem
                                        notification={notifs[0]}
                                        onDismiss={dismissNewNotificationWindow}
                                    />
                                )
                            }
                        </With>
                    </GradientBox>
                </window>
            ) as Gtk.Window
    );
}
