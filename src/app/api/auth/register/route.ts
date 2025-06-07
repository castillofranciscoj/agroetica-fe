// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { z }            from 'zod';
import apolloClient     from '@/lib/apolloClient';
import {
  REGISTER_USER_FULL,
  CREATE_REFERRAL_REDEMPTION,
  FIND_ACTIVE_REFERRAL_CAMPAIGN,
} from '@/graphql/operations';

/* ─────── request-body validation ───────────────────────────── */
const RegisterBody = z.object({
  email   : z.string().email(),
  password: z.string().min(8),

  givenName : z.string().min(1),
  familyName: z.string().min(1),
  country   : z.string().min(1),
  farmName  : z.string().min(1),

  acceptedTerms  : z.boolean(),
  acceptedPrivacy: z.boolean(),

  referralCode: z.string().trim().optional(),
});

/* ─────── helper for quick console debugging ────────────────── */
const dbg = (label: string, obj: unknown) =>
  console.log(`\n🔎  ${label}\n${JSON.stringify(obj, null, 2)}\n`);

/* ─────── POST /api/auth/register ───────────────────────────── */
export async function POST(req: Request) {
  /* 1 - validate input */
  let body: z.infer<typeof RegisterBody>;
  try {
    body = RegisterBody.parse(await req.json());
  } catch (err: any) {
    dbg('❌ Zod validation error', err);
    return NextResponse.json(
      { error: err.errors ?? err.message },
      { status: 400 },
    );
  }

  try {
    /* 2 - create Keystone user (+ 1st farm) */
    const nowIso = new Date().toISOString();

    dbg('📦 GraphQL variables going to REGISTER_USER_FULL', {
      email      : body.email,
      password   : '[redacted]',
      givenName  : body.givenName,
      familyName : body.familyName,
      country    : body.country,
      farmName   : body.farmName,
      acceptedTerms  : nowIso,
      acceptedPrivacy: nowIso,
    });

    const { data, errors } = await apolloClient.mutate({
      mutation : REGISTER_USER_FULL,
      variables: {
        email   : body.email,
        password: body.password,

        /* profile info */
        givenName : body.givenName,
        familyName: body.familyName,
        country   : body.country,
        farmName  : body.farmName,

        /* legal flags */
        acceptedTerms  : nowIso,
        acceptedPrivacy: nowIso,
      },
      errorPolicy: 'all',
    });

    if (errors?.length) dbg('❌ GraphQL errors from Keystone', errors);

    const userId = data?.createUser?.id;
    if (!userId) throw new Error('Registration failed (no ID returned)');

    /* 3 - optional referral handling */
    if (body.referralCode) {
      try {
        const code = body.referralCode.toUpperCase();
        const { data: camp } = await apolloClient.query({
          query      : FIND_ACTIVE_REFERRAL_CAMPAIGN,
          variables  : { code, now: nowIso },
          fetchPolicy: 'network-only',
        });

        const campaign = camp?.referralCampaigns?.[0];
        if (campaign) {
          await apolloClient.mutate({
            mutation : CREATE_REFERRAL_REDEMPTION,
            variables: {
              campaignId   : campaign.id,
              userId,
              signup       : nowIso,
              discountValue: campaign.discount_pct ?? 0,
            },
          });
        }
      } catch (e) {
        dbg('⚠️  Referral processing failed (non-fatal)', e);
      }
    }

    dbg('✅ User created', data.createUser);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    dbg('❌ Unexpected server error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
