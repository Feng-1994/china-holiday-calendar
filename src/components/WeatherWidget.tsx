import { useState, useEffect, useRef, useCallback } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Moon, Wind, Droplets, MapPin, RefreshCw, AlertTriangle, Sunrise, Sunset } from 'lucide-react';
import { fetchWeatherWithLocation, getWeatherIcon, getWeatherDescription, type WeatherData, type HourlyForecast } from '@/utils/weather';

function WeatherIcon({ code, isDay, size = 'large' }: { code: number; isDay: boolean; size?: 'small' | 'large' }) {
  const sizeClass = size === 'large' ? 'text-5xl' : 'text-base';
  const emoji = getWeatherIcon(code, isDay);
  return <span className={`${sizeClass} leading-none`}>{emoji}</span>;
}

interface TooltipInfo {
  x: number;
  y: number;
  time: string;
  temp: number;
  precip: number;
}

function MiniWeatherChart({ hourly, isDay }: { hourly: WeatherData['hourly']; isDay: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const pointsRef = useRef<{ x: number; y: number; data: HourlyForecast }[]>([]);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || hourly.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const temps = hourly.map(h => h.temperature);
    const minTemp = Math.min(...temps) - 2;
    const maxTemp = Math.max(...temps) + 2;
    const tempRange = maxTemp - minTemp || 1;

    const padding = { top: 10, right: 10, bottom: 20, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const points = hourly.map((h, i) => ({
      x: padding.left + (i / (hourly.length - 1)) * chartWidth,
      y: padding.top + chartHeight - ((h.temperature - minTemp) / tempRange) * chartHeight,
      data: h,
    }));

    pointsRef.current = points;

    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    if (isDay) {
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
      gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    points.forEach((p) => {
      ctx.lineTo(p.x, p.y);
    });
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, i) => {
      if (i === 0) return;
      const prev = points[i - 1];
      const cpX = (prev.x + p.x) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, cpX, (prev.y + p.y) / 2);
    });
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = isDay ? '#FBBF24' : '#6366F1';
    ctx.lineWidth = 2;
    ctx.stroke();

    points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = isDay ? '#FBBF24' : '#6366F1';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (i % 3 === 0) {
        const hour = new Date(hourly[i].time).getHours();
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${hour}:00`, p.x, height - 4);
      }
    });
  }, [hourly, isDay]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const points = pointsRef.current;
    if (points.length === 0) return;

    let closest = points[0];
    let minDist = Infinity;
    for (const p of points) {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    }

    if (minDist < 20) {
      const hour = new Date(closest.data.time).getHours();
      setTooltip({
        x: closest.x,
        y: closest.y,
        time: `${hour}:00`,
        temp: closest.data.temperature,
        precip: closest.data.precipitationProbability,
      });
    } else {
      setTooltip(null);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <canvas
        ref={canvasRef}
        className="h-16 w-full"
        style={{ maxHeight: '64px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg px-2 py-1.5 shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y - 52,
            transform: 'translateX(-50%)',
            background: 'rgba(30, 30, 40, 0.92)',
            border: '1px solid rgba(255,255,255,0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="font-lxgw text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{tooltip.time}</div>
          <div className="font-lxgw text-xs font-bold" style={{ color: '#fff' }}>{tooltip.temp}°C</div>
          {tooltip.precip > 0 && (
            <div className="font-lxgw text-[10px]" style={{ color: '#60A5FA' }}>🌧 {tooltip.precip}%</div>
          )}
        </div>
      )}
    </div>
  );
}

function formatSunTime(isoStr: string): string {
  if (!isoStr) return '--:--';
  const date = new Date(isoStr);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherWithLocation();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
        <RefreshCw className="h-5 w-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
        <span className="ml-2 font-lxgw text-sm" style={{ color: 'var(--text-muted)' }}>正在获取天气...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border p-4" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)' }}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" style={{ color: '#EF4444' }} />
          <span className="font-lxgw text-xs" style={{ color: '#EF4444' }}>{error}</span>
        </div>
        <button
          onClick={loadWeather}
          className="mt-2 flex items-center gap-1 rounded-lg px-2 py-1 font-lxgw text-xs transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)', background: 'var(--bg-cell)' }}
        >
          <RefreshCw className="h-3 w-3" />
          重试
        </button>
      </div>
    );
  }

  if (!weather) return null;

  const today = weather.daily[0];
  const tomorrow = weather.daily[1];
  const afterTomorrow = weather.daily[2];

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-hover)' }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
          <span className="font-lxgw text-xs" style={{ color: 'var(--text-muted)' }}>
            {weather.location.cityName || '当前天气'}
          </span>
        </div>
        <button
          onClick={loadWeather}
          className="flex items-center gap-1 rounded-lg p-1 transition-colors hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
          title="刷新天气"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WeatherIcon code={weather.current.weatherCode} isDay={weather.current.isDay} size="large" />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-lxgw text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {weather.current.temperature}
              </span>
              <span className="font-lxgw text-lg" style={{ color: 'var(--text-muted)' }}>°C</span>
            </div>
            <span className="font-lxgw text-sm" style={{ color: 'var(--text-secondary)' }}>
              {getWeatherDescription(weather.current.weatherCode)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Droplets className="h-3 w-3" />
            <span className="font-lxgw text-xs">{weather.current.humidity}%</span>
          </div>
          <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Wind className="h-3 w-3" />
            <span className="font-lxgw text-xs">{weather.current.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      {today && (today.sunrise || today.sunset) && (
        <div className="mt-2 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <Sunrise className="h-3.5 w-3.5" style={{ color: '#FBBF24' }} />
            <span className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>日出</span>
            <span className="font-lxgw text-xs font-medium" style={{ color: '#FBBF24' }}>{formatSunTime(today.sunrise)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sunset className="h-3.5 w-3.5" style={{ color: '#F97316' }} />
            <span className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>日落</span>
            <span className="font-lxgw text-xs font-medium" style={{ color: '#F97316' }}>{formatSunTime(today.sunset)}</span>
          </div>
        </div>
      )}

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-lxgw text-xs" style={{ color: 'var(--text-muted)' }}>今日温度趋势</span>
          <span className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            体感 {weather.current.apparentTemperature}°
          </span>
        </div>
        <MiniWeatherChart hourly={weather.hourly} isDay={weather.current.isDay} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[today, tomorrow, afterTomorrow].map((day, idx) => {
          if (!day) return null;
          const dayNames = ['今天', '明天', '后天'];
          const isToday = idx === 0;

          return (
            <div
              key={day.date}
              className="flex flex-col items-center rounded-xl p-2 text-center"
              style={{
                background: isToday ? 'var(--bg-cell)' : 'transparent',
                border: '1px solid var(--border-color)',
                borderColor: isToday ? 'var(--border-color)' : 'transparent',
              }}
            >
              <span className="font-lxgw text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {dayNames[idx]}
              </span>
              <div className="my-1">
                <WeatherIcon code={day.weatherCode} isDay={true} size="small" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-lxgw text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {day.maxTemp}°
                </span>
                <span className="font-lxgw text-xs" style={{ color: 'var(--text-muted)' }}>
                  {day.minTemp}°
                </span>
              </div>
              {day.precipitationProbability > 10 && (
                <div className="mt-0.5 flex items-center gap-0.5">
                  <Droplets className="h-2.5 w-2.5" style={{ color: '#60A5FA' }} />
                  <span className="font-lxgw text-[9px]" style={{ color: '#60A5FA' }}>
                    {day.precipitationProbability}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
