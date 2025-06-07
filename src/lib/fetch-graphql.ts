// src/lib/fetch-graphql.ts
import { print, type DocumentNode } from 'graphql';

const isServer = typeof window === 'undefined';

function resolveEndpoint(): string {
  const ep =
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ??
    (process.env.KEYSTONE_BASE_URL
      ? `${process.env.KEYSTONE_BASE_URL.replace(/\/+$/, '')}/api/graphql`
      : '');

  if (!ep) {
    throw new Error(
      '❌ GraphQL endpoint missing.  Set NEXT_PUBLIC_GRAPHQL_ENDPOINT or KEYSTONE_BASE_URL.',
    );
  }
  return ep;
}

export async function fetchGraphQL<T = unknown>(
  query: DocumentNode,
  variables?: Record<string, unknown>,
  init?: RequestInit,
): Promise<T> {
  const endpoint = resolveEndpoint();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
  };
  if (isServer && process.env.KEYSTONE_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.KEYSTONE_API_TOKEN}`;
  }

  const res = await fetch(endpoint, {
    method:      'POST',
    headers,
    body:        JSON.stringify({ query: print(query), variables }),
    credentials: 'include',
    cache:       'no-store',
    ...init,
  });

  const raw = await res.text();
  if (!res.ok) throw new Error(`GraphQL ${res.status}: ${raw.slice(0, 200)}`);

  const { data, errors } = JSON.parse(raw);
  if (errors?.length) throw new Error(errors.map((e: any) => e.message).join('\n'));
  return data as T;
}
