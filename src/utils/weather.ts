export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  precipitationProbability: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  location: {
    latitude: number;
    longitude: number;
    cityName?: string;
  };
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  lastUpdated: string;
}

const WMO_CODES: { [code: number]: { description: string; icon: string; nightIcon: string } } = {
  0: { description: '晴', icon: '☀️', nightIcon: '🌙' },
  1: { description: '晴间多云', icon: '⛅', nightIcon: '☁️' },
  2: { description: '多云', icon: '⛅', nightIcon: '☁️' },
  3: { description: '阴', icon: '☁️', nightIcon: '☁️' },
  45: { description: '雾', icon: '🌫️', nightIcon: '🌫️' },
  48: { description: '雾凇', icon: '🌫️', nightIcon: '🌫️' },
  51: { description: '小毛毛雨', icon: '🌦️', nightIcon: '🌧️' },
  53: { description: '中毛毛雨', icon: '🌧️', nightIcon: '🌧️' },
  55: { description: '大毛毛雨', icon: '🌧️', nightIcon: '🌧️' },
  56: { description: '冻毛毛雨', icon: '🌨️', nightIcon: '🌨️' },
  57: { description: '强冻毛毛雨', icon: '🌨️', nightIcon: '🌨️' },
  61: { description: '小雨', icon: '🌧️', nightIcon: '🌧️' },
  63: { description: '中雨', icon: '🌧️', nightIcon: '🌧️' },
  65: { description: '大雨', icon: '🌧️', nightIcon: '🌧️' },
  66: { description: '冻雨', icon: '🌨️', nightIcon: '🌨️' },
  67: { description: '强冻雨', icon: '🌨️', nightIcon: '🌨️' },
  71: { description: '小雪', icon: '🌨️', nightIcon: '🌨️' },
  73: { description: '中雪', icon: '❄️', nightIcon: '❄️' },
  75: { description: '大雪', icon: '❄️', nightIcon: '❄️' },
  77: { description: '雪粒', icon: '🌨️', nightIcon: '🌨️' },
  80: { description: '小阵雨', icon: '🌦️', nightIcon: '🌦️' },
  81: { description: '中阵雨', icon: '🌧️', nightIcon: '🌧️' },
  82: { description: '大阵雨', icon: '⛈️', nightIcon: '⛈️' },
  85: { description: '小阵雪', icon: '🌨️', nightIcon: '🌨️' },
  86: { description: '大阵雪', icon: '❄️', nightIcon: '❄️' },
  95: { description: '雷暴', icon: '⛈️', nightIcon: '⛈️' },
  96: { description: '雷暴+小冰雹', icon: '⛈️', nightIcon: '⛈️' },
  99: { description: '雷暴+大冰雹', icon: '⛈️', nightIcon: '⛈️' },
};

export function getWeatherDescription(code: number): string {
  return WMO_CODES[code]?.description || '未知';
}

export function getWeatherIcon(code: number, isDay: boolean): string {
  const info = WMO_CODES[code];
  if (!info) return '❓';
  return isDay ? info.icon : info.nightIcon;
}

async function getIPLocation(): Promise<{ latitude: number; longitude: number; cityName?: string }> {
  try {
    const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('IP定位失败');
    const data = await response.json();
    if (data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        cityName: data.city || undefined,
      };
    }
    throw new Error('IP定位无数据');
  } catch {
    try {
      const response = await fetch('https://api.ip.sb/geoip', { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('IP定位失败');
      const data = await response.json();
      if (data.latitude && data.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          cityName: data.city || undefined,
        };
      }
      throw new Error('IP定位无数据');
    } catch {
      return { latitude: 39.9042, longitude: 116.4074, cityName: '北京' };
    }
  }
}

async function getBrowserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('定位权限被拒绝'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('无法获取位置信息'));
            break;
          case error.TIMEOUT:
            reject(new Error('定位请求超时'));
            break;
          default:
            reject(new Error('定位失败'));
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 600000,
      }
    );
  });
}

export async function getLocation(): Promise<{ latitude: number; longitude: number; cityName?: string }> {
  try {
    const pos = await getBrowserLocation();
    return pos;
  } catch {
    return getIPLocation();
  }
}

export async function fetchWeatherData(lat: number, lon: number, cityName?: string): Promise<WeatherData> {
  const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=4`;

  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('获取天气数据失败');
  }

  const data = await response.json();

  const currentTime = new Date();
  const currentHourIndex = currentTime.getHours();

  const hourly: HourlyForecast[] = [];
  const todayStart = currentHourIndex;
  for (let i = todayStart; i < Math.min(todayStart + 24, data.hourly.time.length); i++) {
    const time = new Date(data.hourly.time[i]);
    hourly.push({
      time: time.toISOString(),
      temperature: Math.round(data.hourly.temperature_2m[i]),
      weatherCode: data.hourly.weather_code[i],
      precipitationProbability: data.hourly.precipitation_probability?.[i] ?? 0,
    });
  }

  const daily: DailyForecast[] = [];
  for (let i = 0; i < Math.min(4, data.daily.time.length); i++) {
    daily.push({
      date: data.daily.time[i],
      maxTemp: Math.round(data.daily.temperature_2m_max[i]),
      minTemp: Math.round(data.daily.temperature_2m_min[i]),
      weatherCode: data.daily.weather_code[i],
      precipitationProbability: data.daily.precipitation_probability_max[i] || 0,
      sunrise: data.daily.sunrise?.[i] || '',
      sunset: data.daily.sunset?.[i] || '',
    });
  }

  return {
    location: { latitude: lat, longitude: lon, cityName },
    current: {
      temperature: Math.round(data.current.temperature_2m),
      apparentTemperature: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
    },
    hourly,
    daily,
    lastUpdated: new Date().toISOString(),
  };
}

export async function fetchWeatherWithLocation(): Promise<WeatherData> {
  const position = await getLocation();
  return fetchWeatherData(position.latitude, position.longitude, position.cityName);
}
