import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { CURSOR_POINTER } from "../../utils/gtk";
import app from "ags/gtk4/app";
import config from "../../config";
import { popdownParentMenuButton } from "../../utils/gtk";
import ShutdownWindow from "../roots/ShutdownWindow";
import { AppearanceWindow } from "../appearance_settings/AppearanceWindow";

function ShortcutsPanel() {
    const createButton = (iconName: string, label: string, command: string | (() => void)) => (
        <button
            onClicked={(self) => {
                if (typeof command === "string") {
                    execAsync(command);
                } else {
                    command();
                }
                popdownParentMenuButton(self);
            }}
            hexpand={true}
            cursor={CURSOR_POINTER}
            cssClasses={["popover-button-list-item"]}
        >
            <box orientation={Gtk.Orientation.HORIZONTAL}>
                <image iconName={iconName} class="popover-button-list-item-icon" />
                <label label={label} />
            </box>
        </button>
    );

    return (
        <box cssClasses={["popover-button-list"]} orientation={Gtk.Orientation.VERTICAL} hexpand={true}>
            {createButton("draw-brush-symbolic", "Appearance", () =>
                (app.get_window("appearance") ?? AppearanceWindow()).show()
            )}
            {config.dash.shortcuts.map((s) => createButton(s.iconName, s.label, s.command))}
            <button
                cssClasses={["open-shutdown-dialog-button", "popover-button-list-item"]}
                onClicked={() => ShutdownWindow().show()}
                cursor={CURSOR_POINTER}
                hexpand={true}
            >
                <box>
                    <image iconName={"system-shutdown-symbolic"} class={"popover-button-list-item-icon"} />
                    <label label={"Shutdown"} />
                </box>
            </button>
        </box>
    );
}

function DashMenu() {
    return (
        <glassypopover widthRequest={500}>
            <box
                orientation={Gtk.Orientation.VERTICAL}
                cssClasses={["popover-standard-inner"]}
                overflow={Gtk.Overflow.HIDDEN}
            >
                <box
                    cssClasses={["user-box-container"]}
                    layoutManager={new Gtk.BinLayout()}
                    hexpand={true}
                    vexpand={true}
                    overflow={Gtk.Overflow.HIDDEN}
                >
                    <box
                        cssClasses={["user-box-background"]}
                        css={`
                            background-image: url("file://${config.dash.avatarPath}");
                        `}
                        hexpand={true}
                        vexpand={true}
                        overflow={Gtk.Overflow.HIDDEN}
                    />
                    <box orientation={Gtk.Orientation.VERTICAL}>
                        <box orientation={Gtk.Orientation.HORIZONTAL} cssClasses={["popover-title"]}>
                            <image iconName="arch-logo" halign={Gtk.Align.START} />
                            <label label={config.dash.hostname} xalign={0} hexpand={true} />
                        </box>
                        <box
                            orientation={Gtk.Orientation.HORIZONTAL}
                            cssClasses={["user-box"]}
                            vexpand={true}
                            hexpand={true}
                            valign={Gtk.Align.CENTER}
                            spacing={24}
                        >
                            <box layoutManager={new Gtk.BinLayout()} widthRequest={64}>
                                <image
                                    file={config.dash.avatarPath}
                                    cssClasses={["avatar"]}
                                    pixelSize={84}
                                    halign={Gtk.Align.START}
                                    overflow={Gtk.Overflow.HIDDEN}
                                />
                                <box
                                    cssClasses={["gloss"]}
                                    widthRequest={84}
                                    heightRequest={84}
                                    halign={Gtk.Align.START}
                                />
                            </box>
                            <label
                                label={config.dash.username}
                                cssClasses={["username"]}
                                hexpand={true}
                                xalign={0}
                                valign={Gtk.Align.CENTER}
                            />
                        </box>
                    </box>
                    <box cssClasses={["user-box-gloss"]} hexpand={true} vexpand={true} overflow={Gtk.Overflow.HIDDEN} />
                </box>
                <ShortcutsPanel />
            </box>
        </glassypopover>
    );
}

export default function DashMenuButton() {
    return (
        <menubutton
            $type="start"
            cssClasses={["dash-menu-button", "bar-button"]}
            cursor={CURSOR_POINTER}
            vexpand={false}
            halign={Gtk.Align.START}
        >
            <image iconName="arch-logo" halign={Gtk.Align.CENTER} />
            <DashMenu />
        </menubutton>
    );
}
