export function formatSecondsToMMSS(seconds: number) {
    if (seconds > 100_000_000_000) return "∞";
    const h = seconds / 3600;
    seconds %= 3600;
    const hStr = h >= 1 ? `${h.toFixed(0)}:` : "";
    let mStr = (seconds / 60).toFixed(0);
    if (h >= 1) mStr = mStr.padStart(2, "0");
    return `${hStr}${mStr}:${(seconds % 60).toFixed(0).padStart(2, "0")}`;
}
