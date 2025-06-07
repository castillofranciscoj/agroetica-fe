/**
 * Proxy-helper that fetches a QR from api.dub.co and streams it back.
 * Keeps your <img src="/api/qr?data=…"> totally origin-safe.
 *
 * REQUIRED QUERY:
 *   /api/qr?data=https://…                ← the final landing URL
 *
 * OPTIONAL:
 *   &size=1024                            ← forward pixel size **before** url
 */
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  /* ------------------------------------------------------------------ */
  /* required target URL (raw, NOT encoded)                             */
  /* ------------------------------------------------------------------ */
  const target = searchParams.get('data');              // use data, not url
  if (!target) {
    return NextResponse.json({ error: 'Missing data param' }, { status: 400 });
  }

  /* optional size */
  const size = searchParams.get('size');                // e.g. 1024

  /* ------------------------------------------------------------------ */
  /* build upstream URL – size **BEFORE** url                          */
  /* ------------------------------------------------------------------ */
  const qs = new URLSearchParams();
  if (size) qs.set('size', size);                       // 1️⃣ size first
  qs.append('url', target);                             // 2️⃣ then url
  const upstreamURL = `https://api.dub.co/qr?${qs.toString()}`;

  /* ------------------------------------------------------------------ */
  /* fetch QR from Dub                                                  */
  /* ------------------------------------------------------------------ */
  const upstream = await fetch(upstreamURL);
  if (!upstream.ok) {
    return NextResponse.json(
      { error: 'QR generation failed' },
      { status: 502 },
    );
  }

  const body   = await upstream.arrayBuffer();
  const type   = upstream.headers.get('content-type') ?? 'image/png';
  const maxAge = 60 * 60 * 24 * 30;                     // 30-day immutable cache

  return new NextResponse(body, {
    headers: {
      'Content-Type' : type,
      'Cache-Control': `public, max-age=${maxAge}, immutable`,
    },
  });
}
