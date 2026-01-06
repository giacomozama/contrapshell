import { Gtk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import Pango from "gi://Pango?version=1.0";
import { popdownParentWindow } from "../utils/gtk";
import { CURSOR_POINTER } from "../utils/gtk";
import GioUnix from "gi://GioUnix?version=2.0";

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    second: "2-digit",
};

function guessNotificationApp(notification: AstalNotifd.Notification) {
    if (notification.desktopEntry) {
        return GioUnix.DesktopAppInfo.new(`${notification.desktopEntry}.desktop`);
    }

    const entryName = GioUnix.DesktopAppInfo.search(notification.appName)[0]?.[0];
    if (entryName) {
        return GioUnix.DesktopAppInfo.new(entryName);
    }

    return undefined;
}

function formatNotificationDate(notification: AstalNotifd.Notification) {
    return new Date(notification.time * 1000).toLocaleString("default", TIME_FORMAT_OPTIONS);
}

export function NotificationItem({
    notification,
    onDismiss,
}: {
    notification: AstalNotifd.Notification;
    onDismiss?: () => void;
}) {
    return (
        <box cssClasses={["notif-bar-item"]} orientation={Gtk.Orientation.HORIZONTAL} valign={Gtk.Align.START}>
            <image
                valign={Gtk.Align.START}
                marginTop={4}
                pixelSize={32}
                $={(self) => {
                    if (notification.image) {
                        if (notification.image.startsWith("/")) {
                            self.set_from_file(notification.image);
                        } else {
                            self.set_from_icon_name(notification.image);
                        }
                        return;
                    }
                    if (notification.appIcon) {
                        self.set_from_icon_name(notification.appIcon);
                        return;
                    }
                    const gicon = guessNotificationApp(notification)?.get_icon();
                    if (gicon) {
                        self.set_from_gicon(gicon);
                        return;
                    }
                    self.set_from_icon_name("notification");
                }}
            />
            <box cssClasses={["notif-bar-item-text"]} orientation={Gtk.Orientation.VERTICAL} vexpand={true}>
                <box orientation={Gtk.Orientation.VERTICAL}>
                    <box orientation={Gtk.Orientation.HORIZONTAL} hexpand={true}>
                        <label
                            label={notification.summary}
                            cssClasses={["title"]}
                            xalign={Gtk.Align.START}
                            halign={Gtk.Align.START}
                            hexpand={true}
                            ellipsize={Pango.EllipsizeMode.END}
                        />
                        <label label={formatNotificationDate(notification)} cssClasses={["date"]} />
                    </box>
                    <label
                        label={notification.body}
                        cssClasses={["body"]}
                        xalign={Gtk.Align.START}
                        halign={Gtk.Align.START}
                        wrap={true}
                        maxWidthChars={0}
                        wrapMode={Pango.WrapMode.WORD_CHAR}
                        ellipsize={Pango.EllipsizeMode.END}
                        lines={4}
                    />
                    <Gtk.GestureSingle
                        button={1}
                        onBegin={(source) => {
                            const defaultAction = notification.actions.find((a) => a.id === "default");
                            if (defaultAction) {
                                notification.invoke(defaultAction.id);
                                popdownParentWindow(source.widget);
                            }
                        }}
                    />
                </box>
                <box orientation={Gtk.Orientation.HORIZONTAL} hexpand={true} cssClasses={["actions"]}>
                    <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        hexpand={true}
                        spacing={4}
                        cssClasses={["actions"]}
                        halign={Gtk.Align.START}
                    >
                        {notification.actions
                            .filter((a) => a.id !== "default" && a.label)
                            .map((action) => (
                                <button
                                    label={action.label}
                                    cssClasses={["action-button"]}
                                    cursor={CURSOR_POINTER}
                                    onClicked={(self) => {
                                        notification.invoke(action.id);
                                        popdownParentWindow(self);
                                    }}
                                >
                                    {notification.actionIcons ? (
                                        <image iconName={action.id} cssClasses={["action-icon"]} />
                                    ) : (
                                        <label label={action.label} />
                                    )}
                                </button>
                            ))}
                    </box>
                    <button
                        label="Dismiss"
                        cssClasses={["dismiss-button", "action-button"]}
                        halign={Gtk.Align.END}
                        cursor={CURSOR_POINTER}
                        onClicked={() => {
                            notification.dismiss();
                            onDismiss?.();
                        }}
                    />
                </box>
            </box>
        </box>
    );
}
