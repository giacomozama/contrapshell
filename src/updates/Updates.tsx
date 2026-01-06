import { Gtk } from "ags/gtk4";
import { CURSOR_POINTER } from "../utils/gtk";
import { popdownParentWindow } from "../utils/gtk";
import { For } from "gnim";
import Pango from "gi://Pango?version=1.0";
import { updatesState } from "./updates_state";
import app from "ags/gtk4/app";

export function UpdatesPopoverWindow() {
    return (
        <contrapshellpopoverwindow name={"updates"} widthRequest={500} heightRequest={650}>
            <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["popover-standard-inner"]}>
                <box orientation={Gtk.Orientation.HORIZONTAL} cssClasses={["popover-title"]} valign={Gtk.Align.START}>
                    <image iconName="software-update-available-symbolic" halign={Gtk.Align.START} />
                    <label label="Software updates" xalign={0} hexpand={true} />
                    <button
                        cursor={CURSOR_POINTER}
                        valign={Gtk.Align.CENTER}
                        onClicked={(self) => {
                            updatesState().onInstallClicked();
                            popdownParentWindow(self);
                        }}
                    >
                        <box spacing={12}>
                            <image iconName="system-software-install-symbolic" />
                            <label label="Install" />
                        </box>
                    </button>
                </box>
                <scrolledwindow overlayScrolling={true} vexpand={true}>
                    <box orientation={Gtk.Orientation.VERTICAL} class="popover-control-list">
                        <For each={updatesState().sortedUpdates}>
                            {(pkg) => {
                                const spaceIndex = pkg.indexOf(" ");
                                const pkgName = pkg.slice(0, spaceIndex);
                                const pkgVersion = pkg.slice(spaceIndex + 1);
                                const [oldVersion, newVersion] = pkgVersion.split(" -> ");

                                return (
                                    <box class="popover-control-list-item">
                                        <label
                                            label={pkgName}
                                            ellipsize={Pango.EllipsizeMode.END}
                                            xalign={0}
                                            hexpand={true}
                                        />
                                        <box marginStart={24}>
                                            <label
                                                class="subtext"
                                                label={oldVersion}
                                                ellipsize={Pango.EllipsizeMode.MIDDLE}
                                            />
                                            <label class="subtext" label={" -> "} />
                                            <label
                                                class="subtext"
                                                label={newVersion}
                                                ellipsize={Pango.EllipsizeMode.MIDDLE}
                                            />
                                        </box>
                                    </box>
                                );
                            }}
                        </For>
                    </box>
                </scrolledwindow>
            </box>
        </contrapshellpopoverwindow>
    );
}

export default function UpdatesBarButton() {
    return (
        <button
            cssClasses={["updates", "bar-button"]}
            halign={Gtk.Align.START}
            widthRequest={90}
            cursor={CURSOR_POINTER}
            sensitive={updatesState().sortedUpdates.as((u) => u.length > 0)}
            onClicked={(self) => {
                self.add_css_class("active");
                const window = app.get_window("updates") as GlassyWidgets.ContrapshellPopoverWindow;
                const connId = window.connect("hide", () => {
                    self.remove_css_class("active");
                    window.disconnect(connId);
                });
                window.show_from(self);
            }}
        >
            <box>
                <image iconName="software-update-available-symbolic" marginEnd={12} />
                <label label={updatesState().sortedUpdates.as((u) => `${u.length ? u.length : "-"}`)} xalign={0.5} hexpand={true} />
            </box>
        </button>
    );
}
