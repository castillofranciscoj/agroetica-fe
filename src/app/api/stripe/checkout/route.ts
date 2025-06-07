// src/app/api/stripe/checkout/route.ts
export const runtime = 'nodejs';        // 👈  put this before ANY other code
export const dynamic = 'force-dynamic'; // optional: disables file-system cache

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { getOrganisationByUser, setStripeCustomerId } from '@/lib/keystone';
import { keystoneFetch } from '@/lib/keystoneFetch';
import {
  FIND_ACTIVE_PRICE_BY_KEY,
  CREATE_SUBSCRIPTION,
} from '@/graphql/operations';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});



export async function POST(req: NextRequest) {
  try {
    /* 1. body ----------------------------------------------------------------*/
    const { priceKey } = await req.json<{ priceKey?: string }>();
    if (!priceKey) return jsonErr('Missing priceKey', 400);
    console.log('[checkout] priceKey:', priceKey);

    /* 2. auth ----------------------------------------------------------------*/
    const token = await auth(req);
    if (!token) return jsonErr('Unauthenticated', 401);
    const userId = (token as any).sub ?? (token as any).id;
    console.log('[checkout] user:', userId);

    /* 3. organisation ------------------------------------------------------- */
    const org = await getOrganisationByUser(userId);
    console.log('[checkout] org:', org.id, org.name);

    /* 4. customer ----------------------------------------------------------- */
    let customerId = org.stripeCustomerId;
    if (!customerId) {
      console.log('[checkout] creating Stripe customer…');
      const customer = await stripe.customers.create({
        email: token.email,
        metadata: { organisationId: org.id },
      });
      customerId = customer.id;
      await setStripeCustomerId(org.id, customerId);
      console.log('[checkout] new customerId:', customerId);
    }

    /* 5. active price ------------------------------------------------------- */
    const { plan } = await keystoneFetch(FIND_ACTIVE_PRICE_BY_KEY, {
      key: priceKey,
    });
    if (!plan?.activePrice)
      return jsonErr(`No active price for plan "${priceKey}"`, 400);

    const stripePriceId = plan.activePrice.stripePriceId;
    console.log('[checkout] found price', stripePriceId);

    /* 6. create Checkout Session ------------------------------------------- */
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${req.nextUrl.origin}/portal/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url : `${req.nextUrl.origin}/portal/checkout/cancel`,
      expand: ['subscription'],
    });

    console.log('[checkout] session:', session.id, 'sub:', session.subscription);

    /* 7. placeholder record ------------------------------------------------- */
    const tempSubId = session.subscription ?? `pending-${session.id}`;
    await keystoneFetch(CREATE_SUBSCRIPTION, {
      data: {
        organisation: { connect: { id: org.id } },
        plan:         { connect: { id: plan.id } },
        price:        { connect: { id: plan.activePrice.id } },
        status:       'incomplete',
        startDate:    new Date(session.created * 1000).toISOString(),
        stripeSubscriptionId: tempSubId,
      },
    });
    console.log('[checkout] placeholder sub stored with id', tempSubId);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('❌  /api/stripe/checkout', err);
    return jsonErr((err as Error).message, 500);
  }
}

/* helper */
function jsonErr(msg: string, status: number) {
  console.warn('[checkout] error:', msg);
  return NextResponse.json({ error: msg }, { status });
}
