import { CURSOR_POINTER } from "../utils/gtk";
import { caffeineState } from "./caffeine_state";

export default function CaffeineBarButton() {
    return (
        <box class="bar-chip">
            <button
                cursor={CURSOR_POINTER}
                onClicked={() => {
                    caffeineState().toggleInhibitor();
                }}
                iconName={caffeineState().isInhibitorActive.as((isActive) =>
                    isActive ? "my-caffeine-on-symbolic" : "my-caffeine-off-symbolic"
                )}
            />
        </box>
    );
}
