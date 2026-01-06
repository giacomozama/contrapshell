import { Gtk } from "ags/gtk4";
import { CURSOR_POINTER } from "../utils/gtk";
import { createEffect, For, onCleanup, With } from "gnim";
import { HourlyWeatherData, WeatherType, WindDirection } from "./types";
import { weatherState } from "./weather_state";

const HOURLY_ITEM_HEIGHT = 85;

function windDirectionAngle(windDirection: WindDirection) {
    return (windDirection / 8) * Math.PI;
}

function weatherTypeIconName(weatherType: WeatherType) {
    switch (weatherType) {
        case WeatherType.ClearDay:
            return "weather-clear";
        case WeatherType.ClearNight:
            return "weather-clear-night";
        case WeatherType.FewCloudsDay:
            return "weather-clouds";
        case WeatherType.FewCloudsNight:
            return "weather-clouds-night";
        case WeatherType.Overcast:
            return "weather-overcast";
        case WeatherType.RainScattered:
            return "weather-showers-scattered";
        case WeatherType.Rain:
            return "weather-showers";
        case WeatherType.RainDay:
            return "weather-showers-day";
        case WeatherType.RainNight:
            return "weather-showers-night";
        case WeatherType.Storm:
            return "weather-storm";
        case WeatherType.StormDay:
            return "weather-storm-day";
        case WeatherType.StormNight:
            return "weather-storm-night";
        case WeatherType.SnowRain:
            return "weather-snow-rain";
        case WeatherType.Snow:
            return "weather-snow";
        case WeatherType.Mist:
            return "weather-mist";
        case WeatherType.Fog:
            return "weather-fog";
        case WeatherType.Tornado:
            return "weather-tornado";
        case WeatherType.CloudsDay:
            return "weather-few-clouds";
        case WeatherType.CloudsNight:
            return "weather-few-clouds-night";
        case WeatherType.RainScatteredDay:
            return "weather-showers-scattered-day";
        case WeatherType.RainScatteredNight:
            return "weather-showers-scattered-night";
        case WeatherType.FreezingRain:
            return "weather-freezing-rain";
        case WeatherType.Hail:
            return "weather-hail";
        default:
            return "weather-none-available";
    }
}

const previewHourlyItem = weatherState().weatherData.as((data) => {
    const now = Date.now();
    return data.find((h) => h.time.getTime() + 3_600_000 >= now);
});

const previewIcon = previewHourlyItem.as((h) => weatherTypeIconName(h?.weatherType ?? WeatherType.Unknown));

function WindIndicator({ direction, speed, size }: { direction: WindDirection; speed: number; size: number }) {
    return (
        <box widthRequest={size} heightRequest={size} class={"wind-indicator"}>
            <image
                iconName={"arrow4-right-symbolic"}
                css={`
                    transform: rotate(${windDirectionAngle(direction)}rad);
                `}
                pixelSize={size}
            />
        </box>
    );
}

function HourlyWeatherItem({ data }: { data: HourlyWeatherData }) {
    const day = data.time.getDate().toString().padStart(2, "0");
    const month = (data.time.getMonth() + 1).toString().padStart(2, "0");
    const formattedDate = `${day}/${month}`;
    const formattedTime = `${data.time.getHours().toString().padStart(2, "0")}:00`;

    return (
        <box
            cssClasses={["hourly-weather-item"]}
            valign={Gtk.Align.CENTER}
            hexpandSet={true}
            heightRequest={HOURLY_ITEM_HEIGHT}
        >
            <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} widthRequest={55}>
                <label label={formattedDate} cssClasses={["date"]} />
                <label label={formattedTime} cssClasses={["time"]} />
            </box>
            <image
                cssClasses={["weather-type-icon"]}
                iconName={weatherTypeIconName(data.weatherType)}
                widthRequest={80}
            />
            <box class="weather-data" valign={Gtk.Align.CENTER} halign={Gtk.Align.END} hexpandSet={true}>
                <box orientation={Gtk.Orientation.VERTICAL} widthRequest={80}>
                    <box halign={Gtk.Align.START} hexpand={true}>
                        <image iconName={"temperature"} marginEnd={8} />
                        <label class="temperature-label" label={`${data.temperature.toFixed(0)} °C`} hexpand={true} />
                    </box>
                    <box halign={Gtk.Align.START} hexpand={true}>
                        <image iconName={"rain-symbolic"} marginEnd={8} />
                        <label class="temperature-label" label={`${data.humidity}%`} hexpand={true} />
                    </box>
                </box>
                <box orientation={Gtk.Orientation.VERTICAL} hexpand={true}>
                    <box class="rain" halign={Gtk.Align.START} hexpand={true}>
                        <image iconName={"umbrella"} marginEnd={8} />
                        <label label={`${data.rainProbability}%`} hexpand={true} />
                    </box>
                    <box class="wind" halign={Gtk.Align.START} hexpand={true} valign={Gtk.Align.CENTER} spacing={6}>
                        <WindIndicator direction={data?.windDirection ?? 0} speed={data?.windSpeed ?? 0} size={18} />
                        <label
                            class={"wind-speed"}
                            label={`${data?.windSpeed ?? "-"} km/h`}
                            valign={Gtk.Align.CENTER}
                            hexpand={true}
                        />
                    </box>
                </box>
            </box>
        </box>
    );
}

function CurrentWeather() {
    return (
        <box class="current-weather" hexpand={true} vexpand={true}>
            <box
                orientation={Gtk.Orientation.VERTICAL}
                hexpand={true}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
            >
                <image
                    cssClasses={["weather-type-icon"]}
                    iconName={previewIcon}
                    marginStart={8}
                    marginBottom={18}
                    pixelSize={100}
                    halign={Gtk.Align.CENTER}
                />
                <box class={"temp"} halign={Gtk.Align.CENTER} marginEnd={18}>
                    <image iconName={"temperature"} pixelSize={48} valign={Gtk.Align.CENTER} />
                    <label
                        label={previewHourlyItem.as((d) => (d?.temperature ?? "-") + "°C")}
                        valign={Gtk.Align.CENTER}
                    />
                </box>
                <box spacing={24} halign={Gtk.Align.CENTER} class="rain-and-humidity">
                    <box class={"rain"} halign={Gtk.Align.CENTER}>
                        <image iconName={"umbrella"} marginEnd={12} pixelSize={35} />
                        <label
                            label={previewHourlyItem.as((d) => (d?.rainProbability ?? "-") + "%")}
                            valign={Gtk.Align.CENTER}
                        />
                    </box>
                    <box class={"humidity"} halign={Gtk.Align.CENTER}>
                        <image iconName={"rain-symbolic"} marginEnd={8} pixelSize={42} />
                        <label
                            label={previewHourlyItem.as((d) => (d?.humidity ?? "-") + "%")}
                            valign={Gtk.Align.CENTER}
                        />
                    </box>
                </box>
                <box halign={Gtk.Align.CENTER}>
                    <With value={previewHourlyItem}>
                        {(item) => (
                            <box spacing={8} class="wind">
                                <WindIndicator
                                    direction={item?.windDirection ?? 0}
                                    speed={item?.windSpeed ?? 0}
                                    size={48}
                                />
                                <label
                                    class={"wind-speed"}
                                    label={previewHourlyItem.as((d) => (d?.windSpeed ?? "-") + " km/h")}
                                    valign={Gtk.Align.CENTER}
                                />
                            </box>
                        )}
                    </With>
                </box>
            </box>
        </box>
    );
}

export function WeatherVisualizer() {
    const vadjustment = new Gtk.Adjustment();

    createEffect(() => {
        const data = weatherState().weatherData();
        const now = Date.now();

        let startIndex = 0;

        for (let i = 0; i < data.length; i++) {
            if (data[i].time.getTime() + 3_600_000 >= now) {
                startIndex = i;
                break;
            }
        }

        vadjustment.configure(
            HOURLY_ITEM_HEIGHT * startIndex,
            0,
            HOURLY_ITEM_HEIGHT * data.length,
            HOURLY_ITEM_HEIGHT,
            0,
            0
        );
    });

    return (
        <box
            cssClasses={["weather-panel"]}
            layoutManager={new Gtk.BinLayout()}
            hexpandSet={true}
            overflow={Gtk.Overflow.HIDDEN}
        >
            <box orientation={Gtk.Orientation.VERTICAL} hexpand={true}>
                <box orientation={Gtk.Orientation.HORIZONTAL} cssClasses={["popover-title"]} valign={Gtk.Align.START}>
                    <image iconName={previewIcon} halign={Gtk.Align.START} />
                    <label label="Weather" xalign={0} hexpand={true} />
                    <button cursor={CURSOR_POINTER} valign={Gtk.Align.CENTER} onClicked={() => weatherState().refreshWeatherData()}>
                        <box spacing={12}>
                            <image iconName="view-refresh-symbolic" />
                            <label label="Refresh" />
                        </box>
                    </button>
                </box>
                <box vexpand={true} hexpand={true}>
                    <CurrentWeather />
                    <box halign={Gtk.Align.END}>
                        <scrolledwindow widthRequest={350} vadjustment={vadjustment}>
                            <box class={"hourly-list"} orientation={Gtk.Orientation.VERTICAL}>
                                <For each={weatherState().weatherData}>{(data) => <HourlyWeatherItem data={data} />}</For>
                            </box>
                        </scrolledwindow>
                    </box>
                </box>
            </box>
            <box class={"gloss"} canFocus={false} canTarget={false} />
        </box>
    );
}
