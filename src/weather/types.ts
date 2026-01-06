export enum WeatherType {
    ClearDay,
    ClearNight,
    FewCloudsDay,
    FewCloudsNight,
    CloudsDay,
    CloudsNight,
    Overcast,
    Rain,
    RainDay,
    RainNight,
    RainScattered,
    RainScatteredDay,
    RainScatteredNight,
    FreezingRain,
    Hail,
    Storm,
    StormDay,
    StormNight,
    Snow,
    SnowRain,
    Mist,
    Fog,
    Tornado,
    Unknown,
}

export enum WindDirection {
    E,
    E_SE,
    SE,
    S_SE,
    S,
    S_SW,
    SW,
    W_SW,
    W,
    W_NW,
    NW,
    N_NW,
    N,
    N_NE,
    NE,
    E_NE,
}

export type HourlyWeatherData = {
    time: Date;
    weatherType: WeatherType;
    temperature: number;
    rainProbability: number;
    humidity?: number;
    windDirection?: WindDirection;
    windSpeed?: number;
};
