// src/app/api/admin/sync-products/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';

export async function POST(req: NextRequest) {
  const ses = await getServerSession(authOptions);
  if (!ses?.user?.isAdmin) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  /* -------- DEBUG: log the env ------------------ */
  const base = process.env.KEYSTONE_BASE_URL;
  console.log('KEYSTONE_BASE_URL =', base);

  if (!base) {
    return NextResponse.json(
      { ok: false, error: 'KEYSTONE_BASE_URL env var not set' },
      { status: 500 },
    );
  }

  /* absolute URL we will call */
  const target = `${base.replace(/\/$/, '')}/api/admin/sync-products`;
  console.log('Proxy →', target);

  /* safety: if we ended up pointing to ourselves, bail out */
  if (target.startsWith('http://localhost:3001')) {
    return NextResponse.json(
      { ok: false, error: 'Proxy URL points to frontend, not Keystone' },
      { status: 500 },
    );
  }

  const keystoneRes = await fetch(target, {
    method: 'POST',
    headers: {
      cookie: req.headers.get('cookie') ?? '',
    },
    credentials: 'include',
  });

  const isJson = (keystoneRes.headers.get('content-type') || '')
    .includes('application/json');

  const payload = isJson ? await keystoneRes.json()
                         : { ok: false, error: await keystoneRes.text() };

  return NextResponse.json(payload, { status: keystoneRes.status });
}
