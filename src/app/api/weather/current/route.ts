// src/app/api/weather/current/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat/lon' }, { status: 400 });
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Open-Meteo API returned ${res.status}` },
        { status: 502 }
      );
    }

    const json = await res.json();
    const { current_weather } = json;

    if (!current_weather) {
      return NextResponse.json(
        { error: 'No current_weather in response' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      temperature: current_weather.temperature,
      weathercode: mapWeatherCode(current_weather.weathercode),
    });

  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch Open-Meteo data' },
      { status: 500 }
    );
  }
}

// Translate Open-Meteo weather codes to keywords used in iconMap
function mapWeatherCode(code: number): string {
  if ([0].includes(code)) return 'clear';
  if ([1, 2, 3].includes(code)) return 'partlycloudy';
  if ([45, 48].includes(code)) return 'fog';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'thunderstorm';
  return 'cloudy';
}
