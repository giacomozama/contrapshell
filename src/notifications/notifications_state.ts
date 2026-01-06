import { Gtk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { Accessor, createBinding, createEffect, createRoot, createState } from "gnim";
import { timeout, Timer } from "ags/time";
import app from "ags/gtk4/app";

export type NotificationsState = {
    notifications: Accessor<AstalNotifd.Notification[]>;
    popupNotifs: Accessor<AstalNotifd.Notification[]>;
    lockNotifsPopup: () => void;
    unlockNotifsPopup: () => void;
    dismissNewNotificationWindow: () => void;
};

let notificationsStateInstance: NotificationsState | null = null;

function createNotificationsState() {
    const notifd = AstalNotifd.get_default();

    let notifsPopupLocked = false;

    function lockNotifsPopup() {
        notifsPopupLocked = true;
        setPopupNotifs([]);
    }

    function unlockNotifsPopup() {
        notifsPopupLocked = false;
    }

    let latestNotificationTimestamp = Date.now();

    const [popupNotifs, setPopupNotifs] = createState<AstalNotifd.Notification[]>([]);

    const notifications = createBinding(notifd, "notifications").as((ns) => ns.sort((a, b) => b.time - a.time));

    createEffect(() => {
        const notifs = notifications();
        if (!notifs.length) return;

        if (notifsPopupLocked) {
            latestNotificationTimestamp = notifs[0].time;
            return;
        }

        const newNotifs = [];
        for (const notif of notifs) {
            if (notif.time <= latestNotificationTimestamp) break;
            newNotifs.push(notif);
        }

        latestNotificationTimestamp = notifs[0].time;

        for (const notif of newNotifs) {
            if (notif.soundFile) {
                Gtk.MediaFile.new_for_filename(notif.soundFile).play();
            } else if (!notif.suppressSound) {
                // DEFAULT_NOTIFICATION_SOUND.play();
            }
        }

        setPopupNotifs([...popupNotifs.peek(), ...newNotifs]);
    });

    let showTimer: Timer | undefined;
    let hideTimer: Timer | undefined;

    function dismissNewNotificationWindow() {
        const window = app.get_window("new-notification");
        if (!window) return;

        hideTimer?.cancel();
        hideTimer = undefined;

        showTimer?.cancel();
        showTimer = undefined;

        window.hide();
        hideTimer = timeout(300, () => {
            const newNotifs = popupNotifs.peek().slice(1);
            setPopupNotifs(newNotifs);
            if (newNotifs.length) {
                window.show();
                showNewNotificationWindow();
            }
        });
    }

    function showNewNotificationWindow() {
        const window = app.get_window("new-notification");
        if (!window || window.visible) return;
        window.show();
        showTimer = timeout(5000, dismissNewNotificationWindow);
    }

    createEffect(() => {
        popupNotifs(); // track popupNotifs
        showNewNotificationWindow();
    });

    notificationsStateInstance = {
        notifications,
        popupNotifs,
        lockNotifsPopup,
        unlockNotifsPopup,
        dismissNewNotificationWindow,
    };

    return notificationsStateInstance;
}

export function notificationsState() {
    return notificationsStateInstance ?? createRoot(createNotificationsState);
}
