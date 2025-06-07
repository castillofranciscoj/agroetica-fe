/* eslint-disable @typescript-eslint/consistent-type-imports */
import { NextRequest, NextResponse } from 'next/server';
import {
  GET_WEATHER_RECORDS,
  CREATE_WEATHER_RECORDS,
  type WeatherSummary,
} from '@/graphql/operations';

const { KEYSTONE_API_URL, KEYSTONE_API_TOKEN } = process.env;

// tiny helper – fetch GraphQL over HTTP ---------------------------------
async function keystoneFetch<T = unknown>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(KEYSTONE_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(KEYSTONE_API_TOKEN ? { Authorization: `Bearer ${KEYSTONE_API_TOKEN}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: unknown) => e.message).join('\n'));
  }
  return json.data;
}

// -----------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fieldId = searchParams.get('fieldId');
  const yearStr = searchParams.get('year');

  if (!fieldId || !yearStr) {
    return NextResponse.json(
      { error: 'Missing fieldId or year' },
      { status: 400 },
    );
  }
  const year = Number(yearStr);
  if (Number.isNaN(year)) {
    return NextResponse.json({ error: 'Bad year' }, { status: 400 });
  }

  const startISO = `${year}-01-01T00:00:00.000Z`;
  const endISO   = `${year}-12-31T23:59:59.999Z`;

  /* 1️⃣  ask Keystone for existing data --------------------------------*/
  type WeatherRecord = {
    id: string;
    date: string;
    temperature?: number;
    humidity?: number;
    precipitationMm?: number;
  };

  const data = await keystoneFetch<{ weatherRecords: WeatherRecord[] }>(
    GET_WEATHER_RECORDS,
    { fieldId, start: startISO, end: endISO },
  );

  let records = data.weatherRecords;
  if (records.length === 0) {
    /* 2️⃣  pull archive from Open-Meteo ------------------------------- */
    // first get field lat/lon from Keystone
    const { field } = await keystoneFetch<{ field: { location: unknown } }>(
      /* GraphQL inline for brevity */
      `
      query FieldLoc($id: ID!) {
        field(where: { id: $id }) { location }
      }
      `,
      { id: fieldId },
    );

    if (!field?.location) {
      return NextResponse.json({ error: 'Field has no location' }, { status: 400 });
    }

    const { latitude, longitude } = field.location;
    const api =
      `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}` +
      `&longitude=${longitude}&start_date=${year}-01-01&end_date=${year}-12-31` +
      `&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum` +
      `&timezone=UTC`;

    const meteo = await fetch(api).then(r => r.json());

    if (!meteo.daily?.time) {
      return NextResponse.json({ error: 'Open-Meteo bad response' }, { status: 502 });
    }

    const { time, temperature_2m_mean, relative_humidity_2m_mean, precipitation_sum } =
      meteo.daily;

    const bulkInput = time.map((iso: string, i: number) => ({
      field:          { connect: { id: fieldId } },
      date:           iso,
      temperature:     temperature_2m_mean[i],
      humidity:        relative_humidity_2m_mean[i],
      precipitationMm: precipitation_sum[i],
    }));

    /* 3️⃣  push them back to Keystone (one mutation) ------------------ */
    await keystoneFetch(CREATE_WEATHER_RECORDS, { data: bulkInput });

    records = bulkInput as WeatherRecord[];
  }

  /* 4️⃣  build and return the summary --------------------------------- */
  return NextResponse.json(toSummary(records));
}

/* ---------- helpers --------------------------------------------------- */
function mean(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}

function toSummary(recs: {
  date: string | Date;
  temperature?: number | null;
  humidity?: number | null;
  precipitationMm?: number | null;
}[]): WeatherSummary {
  const months = Array.from({ length: 12 }, () => ({
    t: [] as number[],
    h: [] as number[],
    p: 0,
  }));

  recs.forEach(r => {
    const m = new Date(r.date).getUTCMonth();
    if (r.temperature != null) months[m].t.push(r.temperature);
    if (r.humidity    != null) months[m].h.push(r.humidity);
    if (r.precipitationMm != null) months[m].p += r.precipitationMm;
  });

  const allT = months.flatMap(m => m.t);
  const allH = months.flatMap(m => m.h);

  const [minT, maxT] = [Math.min(...allT), Math.max(...allT)];
  const [minH, maxH] = [Math.min(...allH), Math.max(...allH)];

  return {
    avgTemperature:      mean(allT),
    avgHumidity:         mean(allH),
    totalPrecipitation:  months.reduce((sum, m) => sum + m.p, 0),

    minTemperature:      minT,
    maxTemperature:      maxT,
    minTemperatureMonth: months.findIndex(m => m.t.includes(minT)) + 1 || null,
    maxTemperatureMonth: months.findIndex(m => m.t.includes(maxT)) + 1 || null,

    minHumidity:         minH,
    maxHumidity:         maxH,
    minHumidityMonth:    months.findIndex(m => m.h.includes(minH)) + 1 || null,
    maxHumidityMonth:    months.findIndex(m => m.h.includes(maxH)) + 1 || null,
  };
}
