import { Accessor, createRoot } from "gnim";
import config from "../config";
import { createPollState } from "../utils/gnim";
import { HourlyWeatherData } from "./types";

export type WeatherState = {
    weatherData: Accessor<HourlyWeatherData[]>;
    refreshWeatherData: () => void;
};

let weatherStateInstance: WeatherState | null;

export function createWeatherState(): WeatherState {
    const [weatherData, setWeatherData] = createPollState(
        [],
        config.weather.updateInterval,
        config.weather.dataProvider
    );

    function refreshWeatherData() {
        config.weather.dataProvider().then(setWeatherData);
    }

    weatherStateInstance = {
        weatherData,
        refreshWeatherData,
    };

    return weatherStateInstance;
}

export function weatherState(): WeatherState {
    return weatherStateInstance ?? createRoot(createWeatherState);
}
