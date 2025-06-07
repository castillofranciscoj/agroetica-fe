// src/lib/auth/options.ts
import type { AuthOptions, DefaultSession, DefaultUser } from 'next-auth';
import CredentialsProvider  from 'next-auth/providers/credentials';
import GoogleProvider       from 'next-auth/providers/google';
import FacebookProvider     from 'next-auth/providers/facebook';
import NextAuth             from 'next-auth';
import client               from '@/lib/apolloClient';

import {
  UPSERT_USER,
  AUTH_MUTATION,
  FIND_USER,
  CREATE_USER,
} from '@/graphql/operations';

/* ─────────────  Type augmentation  ───────────── */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: DefaultUser & { id?: string; isAdmin?: boolean };
  }
  interface User extends DefaultUser {
    id?: string;
    isAdmin?: boolean;
  }
}

/* ─────────────  Auth options  ───────────── */
export const authOptions: AuthOptions = {
  /* ----------  Providers  ---------- */
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile: async google => {
        const { email, name } = google;
        const { data: find } = await client.query({
          query: FIND_USER,
          variables: { email },
          fetchPolicy: 'no-cache',
        });
        let user = find.users[0];
        if (!user) {
          const { data: create } = await client.mutate({
            mutation : CREATE_USER,
            variables: { email, name },
          });
          user = create.createUser;
        }
        return { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
      },
    }),

    FacebookProvider({
      clientId:     process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      profile: async fb => {
        const { email, name } = fb;
        const { data: find } = await client.query({
          query: FIND_USER,
          variables: { email },
          fetchPolicy: 'no-cache',
        });
        let user = find.users[0];
        if (!user) {
          const { data: create } = await client.mutate({
            mutation : CREATE_USER,
            variables: { email, name },
          });
          user = create.createUser;
        }
        return { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
      },
    }),

    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email:    { label: 'Email',    type: 'text'     },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(cred) {
        const { data } = await client.mutate({
          mutation : AUTH_MUTATION,
          variables: { email: cred!.email, password: cred!.password },
        });
        const result = data.authenticateUserWithPassword;
        if (!result || !('item' in result)) return null;
        const u = result.item;
        return { id: u.id, name: u.name, email: u.email, isAdmin: u.isAdmin };
      },
    }),
  ],

  /* ----------  Core config  ---------- */
  session: { strategy: 'jwt' },
  secret : process.env.NEXTAUTH_SECRET,
  pages  : { signIn: '/login' },

/* ----------  Host & cookie patch  ---------- */
...(process.env.NODE_ENV === 'production'
  ? {
      trustHost: true,
      cookies: {
        sessionToken: {
          name: '__Secure-next-auth.session-token',
          options: {
            domain:
              process.env.APP_TIER === 'demo'
                ? '.demo.agroetica.com'
                : '.agroetica.com',
            sameSite: 'none',
            secure  : true,
            path    : '/',
          },
        },
      },
    }
  : {}),

  /* ----------  Callbacks  ---------- */
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          await client.mutate({
            mutation : UPSERT_USER,
            variables: { email: user.email!, name: user.name! },
          });
        } catch (err: unknown) {
          if (!/Unique constraint/.test((err as Error).message)) {
            console.error('[NextAuth] Keystone upsert failed:', err);
          }
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) token.isAdmin = (user as { isAdmin: boolean }).isAdmin;
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id      = token.sub!;
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Optional direct handler export                                    */
/* ------------------------------------------------------------------ */
export const authHandler = NextAuth(authOptions);
