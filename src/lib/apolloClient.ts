import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? '/api/graphql',
    credentials: 'include',                      // send cookies
    headers: { 'Content-Type': 'application/json' },
    useGETForQueries: false,                     // 🔑 POST **everything**
  }),
  cache: new InMemoryCache(),
});
export default client;
