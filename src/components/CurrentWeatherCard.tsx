'use client';

import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

type Props = {
  lat: number;
  lon: number;
};

type WeatherData = {
  temperature: number;
  condition: string;
  icon: keyof typeof Icons;
};

const iconMap: Record<string, keyof typeof Icons> = {
  clear: 'Sun',
  partlycloudy: 'CloudSun',
  cloudy: 'Cloud',
  rain: 'CloudRain',
  showers: 'CloudDrizzle',
  snow: 'Snowflake',
  thunderstorm: 'CloudLightning',
  fog: 'CloudFog',
  mist: 'CloudFog',
  default: 'Cloud',
};

export default function CurrentWeatherCard({ lat, lon }: Props) {
  const { lang } = useLanguage();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        const { temperature, weathercode } = json;
        const iconKey =
          iconMap[weathercode.toLowerCase()] || iconMap.default;

        setData({
          temperature,
          condition: weathercode,
          icon: iconKey,
        });
      } catch (e: unknown) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [lat, lon]);

  if (loading) return <div>{t[lang].loadingWeather}…</div>;
  if (error || !data)
    return <p className="text-red-600">{t[lang].errorLoadingWeather}</p>;

  const Icon = Icons[data.icon];

  return (
    <div className="p-4 bg-transparent rounded shadow flex items-center space-x-4 text-white">
      <Icon className="w-8 h-8 text-blue-400" />
      <div>
        <div className="text-sm text-white/80">{t[lang].currentWeatherLabel}</div>
        <div className="text-lg font-semibold">
          {data.temperature.toFixed(1)}°C · {data.condition}
        </div>
      </div>
    </div>
  );
}
