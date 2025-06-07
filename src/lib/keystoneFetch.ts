// src/lib/keystoneFetch.ts
import { print, type DocumentNode } from 'graphql';

/* --- env (unchanged) --------------------------------------------------- */
const {
  NEXT_PUBLIC_GRAPHQL_ENDPOINT,  // public
  KEYSTONE_BASE_URL,             // private
  KEYSTONE_API_TOKEN,            // private
} = process.env;

const isServer = typeof window === 'undefined';

/* --- resolve the endpoint *only when needed* --------------------------- */
function resolveEndpoint(): string {
  const ep =
    NEXT_PUBLIC_GRAPHQL_ENDPOINT ??
    (KEYSTONE_BASE_URL
      ? `${KEYSTONE_BASE_URL.replace(/\/+$/, '')}/api/graphql`
      : '');

  if (!ep) {
    throw new Error(
      '❌ GraphQL endpoint missing.  Set NEXT_PUBLIC_GRAPHQL_ENDPOINT or KEYSTONE_BASE_URL.',
    );
  }
  return ep;
}

/* --- lightweight fetcher ------------------------------------------------ */
export async function keystoneFetch<T = unknown>(
  query: string | DocumentNode,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const endpoint = resolveEndpoint();
  const queryStr = typeof query === 'string' ? query : print(query);

  /* headers */
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (isServer && KEYSTONE_API_TOKEN) {
    headers.Authorization = `Bearer ${KEYSTONE_API_TOKEN}`;
  }

  const res = await fetch(endpoint, {
    method:      'POST',
    headers,
    body:        JSON.stringify({ query: queryStr, variables }),
    credentials: 'include',
    cache:       'no-store',
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: any) => e.message).join('\n'));
  }
  return json.data;
}
