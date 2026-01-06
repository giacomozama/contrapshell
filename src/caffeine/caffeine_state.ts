import Gio from "gi://Gio?version=2.0";
import { Accessor, createRoot, createState } from "gnim";

const INTERFACE_XML = `
<node>
  <interface name="st.contraptioni.IdleInhibitor1">
    <method name="EnableInhibitor">
        <arg type="b" direction="out" name="did_enable"/>
    </method>
    <method name="DisableInhibitor">
        <arg type="b" direction="out" name="did_disable"/>
    </method>
    <method name="ToggleInhibitor">
        <arg type="b" direction="out" name="is_enabled"/>
    </method>
    <property name="IsInhibitorActive" type="b" access="read"/>
  </interface>
</node>
`;

export type CaffeineState = {
    isInhibitorActive: Accessor<boolean>;
    toggleInhibitor: () => void;
};

let caffeineStateInstance: CaffeineState | null = null;

function createCaffeineState() {
    const proxy = Gio.DBusProxy.makeProxyWrapper(INTERFACE_XML)(
        Gio.DBus.session,
        "st.contraptioni.IdleInhibitor",
        "/st/contraptioni/IdleInhibitor"
    );

    function toggleInhibitor() {
        proxy.call_sync("ToggleInhibitor", null, Gio.DBusCallFlags.NONE, -1, null);
    }

    const [isInhibitorActive, setIsInhibitorActive] = createState(proxy.IsInhibitorActive as boolean);

    proxy.connect("g-properties-changed", (proxy, _, __) => {
        setIsInhibitorActive(proxy.IsInhibitorActive as boolean);
    });

    caffeineStateInstance = {
        isInhibitorActive,
        toggleInhibitor,
    };

    return caffeineStateInstance;
}

export function caffeineState() {
    return caffeineStateInstance ?? createRoot(createCaffeineState);
}
