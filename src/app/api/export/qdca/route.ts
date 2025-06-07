/**
 * /api/export/qdca?year=YYYY&farmId=<uuid>&format=pdf|xlsx
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import fetch from 'cross-fetch';

import { QDCA_EXPORT_QUERY } from '@/graphql/qdca/qdca';

function makeApollo(cookiesHeader: string | null) {
  const http = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
    fetch,
  });

  const auth = setContext((_, { headers }) => ({
    headers: { ...headers, cookie: cookiesHeader ?? '' },
  }));

  return new ApolloClient({
    link : auth.concat(http),
    cache: new InMemoryCache(),
    defaultOptions: { query: { fetchPolicy: 'no-cache' } },
  });
}

export async function GET(req: NextRequest) {
  const p       = new URL(req.url).searchParams;
  const year    = Number(p.get('year'));
  const farmId  = p.get('farmId');
  const format  = (p.get('format') ?? 'xlsx').toLowerCase();

  if (!year || !farmId)
    return NextResponse.json({ error: 'year & farmId are required' }, { status: 400 });

  const yearStart = new Date(`${year}-01-01T00:00:00.000Z`).toISOString();
  const yearEnd   = new Date(`${year}-12-31T23:59:59.999Z`).toISOString();

  console.log('[qdca] variables →', { farmId, yearStart, yearEnd });

  /* 1️⃣  fetch data --------------------------------------------------- */
  const apollo = makeApollo(req.headers.get('cookie'));
  let rows: any[] = [];                                         // ← single declaration

  try {
    const { data } = await apollo.query({
      query: QDCA_EXPORT_QUERY,
      variables: { farmId, yearStart, yearEnd },
    });
    rows = Array.isArray(data.activities) ? data.activities : [];
    console.log('[qdca] fetched', rows.length, 'rows');
  } catch (err: any) {
    console.error('[qdca] GQL error:', err?.networkError?.result ?? err);
    return NextResponse.json(
      { error: 'GraphQL query failed', detail: err?.message },
      { status: 500 },
    );
  }

  /* 2️⃣  build file (lazy-import heavy libs) ------------------------- */
  const { qdcaToExcel, qdcaToPdf } =
    await import('@/lib/exporters/qdca.server');

  const file =
    format === 'pdf' ? await qdcaToPdf(rows) : await qdcaToExcel(rows);

  const mime =
    format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  /* 3️⃣  send back ---------------------------------------------------- */
  return new NextResponse(file, {
    headers: {
      'Content-Type'       : mime,
      'Content-Disposition': `attachment; filename=QDCA_${year}.${format}`,
    },
  });
}
