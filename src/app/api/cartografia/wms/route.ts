// src/app/api/cartografia/wms/route.ts
import { NextResponse } from 'next/server';

/* ------------------------------------------------------------------ */
/*  ADE WMS proxy  – caching + throttling + grace-period re-draw       */
/* ------------------------------------------------------------------ */
const WMS_BASE =
  'https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php';

/* headers we forward unchanged */
const FORWARD_HEADERS = new Set([
  'referer',
  'user-agent',
  'accept',
  'authorization',
]);

/* query-string keys we allow callers to override */
const ALLOWED = new Set([
  'SERVICE', 'VERSION', 'REQUEST',
  'LAYERS', 'STYLES',  'FORMAT',
  'TRANSPARENT', 'CRS', 'BBOX',
  'WIDTH', 'HEIGHT',
  'LANGUAGE', 'DEBUG',
]);

/* ADE-flavoured defaults (WMS 1.3.0 + EPSG:4258) */
const DEFAULTS: Record<string, string> = {
  SERVICE:     'WMS',
  VERSION:     '1.3.0',
  REQUEST:     'GetMap',
  FORMAT:      'image/png',
  TRANSPARENT: 'true',
  CRS:         'EPSG:4258',
  WIDTH:       '512',
  HEIGHT:      '512',
  LANGUAGE:    'ita',
};

/* ------------------------------------------------------------------ */
/*  ❶  very-small queue → ≤ 4 concurrent fetches                      */
/* ------------------------------------------------------------------ */
const MAX_PARALLEL = 4;
let   activeCalls  = 0;
const pending: (() => void)[] = [];

async function limitedFetch(url: string, init: RequestInit) {
  await new Promise<void>(resolve => {
    if (activeCalls < MAX_PARALLEL) {
      activeCalls++;
      resolve();
    } else {
      pending.push(resolve);
    }
  });

  try {
    return await fetch(url, init);
  } finally {
    activeCalls--;
    const next = pending.shift();
    if (next) next();
  }
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

/* ------------------------------------------------------------------ */
export async function GET(request: Request) {
  const url   = new URL(request.url);
  const debug = url.searchParams.get('debug')?.toLowerCase() === 'true';
  if (debug) url.searchParams.delete('debug');

  /* merge user params on top of defaults */
  const merged = new URLSearchParams();
  for (const k in DEFAULTS) merged.set(k, DEFAULTS[k]);
  for (const [k, v] of url.searchParams) {
    if (ALLOWED.has(k.toUpperCase())) merged.set(k, v);
  }

  /* WMS spec: BBOX is mandatory for GetMap */
  if (!merged.has('BBOX')) {
    return NextResponse.json(
      { error: 'Missing BBOX (latMin,lonMin,latMax,lonMax)' },
      { status: 400 },
    );
  }

  /* build query string; keep the slash inside image/png */
  const query = Array.from(merged)
    .map(([k, v]) =>
      k.toUpperCase() === 'FORMAT'
        ? `${k}=${encodeURIComponent(v).replace(/%2F/g, '/')}`
        : `${k}=${encodeURIComponent(v)}`
    )
    .join('&');

  const targetUrl = `${WMS_BASE}?${query}`;

  /* forward a minimal, ADE-friendly header set */
  const fwd: Record<string, string> = {};
  for (const [k, v] of request.headers) {
    if (FORWARD_HEADERS.has(k)) fwd[k] = v;
  }
  fwd.referer =
    'https://cartografia.agenziaentrate.gov.it/';
  fwd['user-agent'] =
    fwd['user-agent'] ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36';

  try {
    /* ❷ throttle with limitedFetch */
    let upstream = await limitedFetch(targetUrl, { headers: fwd });

    /* ------------------------------------------------------------------
       ❸ Grace-period re-draw: if ADE replies 5xx, wait 3 s and retry once
    ------------------------------------------------------------------ */
    if (upstream.status >= 500) {
      console.warn('[WMS proxy] 5xx from ADE – retrying in 3 s');
      await sleep(3000);
      upstream = await limitedFetch(targetUrl, { headers: fwd });
    }

    const status      = upstream.status;
    const contentType = upstream.headers.get('content-type') ?? '';

    /* ⬅️  NEW: don’t cache persistent 5xx replies */
    if (status >= 500) {
      const body = await upstream.arrayBuffer();
      return new NextResponse(body, {
        status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-store',
          'Vary': 'Accept, Referer',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    /* debug helper – echoes first 500 bytes of upstream body */
    if (debug) {
      const bodySnippet = await upstream.text().then(t => t.slice(0, 500));
      return NextResponse.json(
        { targetUrl, status, contentType, bodySnippet },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=60',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const buffer = await upstream.arrayBuffer();

    /* ❹ 2-level cache header for successful tiles */
    return new NextResponse(buffer, {
      status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Vary': 'Accept, Referer',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: unknown) {
    console.error('[WMS proxy error]', err);
    return NextResponse.json(
      { error: 'Upstream request failed', detail: err.message },
      { status: 502 }
    );
  }
}
