// src/app/api/power/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }                               // ← no explicit type
) {
  const { type } = params as { type: string }; // cast *inside* if you want
  const url  = new URL(request.url);
  const lat  = url.searchParams.get('lat');
  const lon  = url.searchParams.get('lon');
  const date = url.searchParams.get('date');   // daily only
  const year = url.searchParams.get('year');   // monthly only

  if (!lat || !lon)
    return NextResponse.json({ error: 'Missing lat/lon' }, { status: 400 });

  /* ---------- build NASA POWER API URL ---------- */
  let target: string;
  if (type === 'daily') {
    if (!date)
      return NextResponse.json({ error: 'Missing date for daily' }, { status: 400 });

    target =
      'https://power.larc.nasa.gov/api/temporal/daily/point' +
      '?parameters=T2M,PRECTOTCORR,RH2M' +
      '&community=AG' +
      `&latitude=${lat}&longitude=${lon}` +
      `&start=${date}&end=${date}` +
      '&format=JSON';
  } else if (type === 'monthly') {
    if (!year)
      return NextResponse.json({ error: 'Missing year for monthly' }, { status: 400 });

    target =
      'https://power.larc.nasa.gov/api/temporal/monthly/point' +
      '?parameters=T2M,PRECTOTCORR,RH2M' +
      '&community=AG' +
      `&latitude=${lat}&longitude=${lon}` +
      `&start=${year}&end=${year}` +
      '&format=JSON';
  } else {
    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  }

  /* ---------- proxy request ---------- */
  const res = await fetch(target);
  if (!res.ok)
    return NextResponse.json(
      { error: `NASA API returned ${res.status}` },
      { status: 502 },
    );

  const data = await res.json();
  return NextResponse.json(data);
}
