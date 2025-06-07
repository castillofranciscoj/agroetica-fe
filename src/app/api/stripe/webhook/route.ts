// ──────────────────────────────────────────────────────────
//  src/app/api/stripe/webhook/route.ts  (entire file)
// ──────────────────────────────────────────────────────────

export const runtime  = 'nodejs';
export const dynamic  = 'force-dynamic';

import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { keystoneFetch } from '@/lib/keystoneFetch';
import {
  FIND_ORG_BY_CUSTOMER,
  FIND_PLAN_BY_PRODUCT,
  UPDATE_SUBSCRIPTION,
  CREATE_SUBSCRIPTION,
} from '@/graphql/operations';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/* ────────────────────────────────────────────────────────── */
/*  Helper: upsert subscription row                           */
/* ────────────────────────────────────────────────────────── */
async function upsertSub(
  sub: Stripe.Subscription,
  productRaw: string | Stripe.Product,
  orgId: string,
) {
  /* 1️⃣  resolve product id ---------------------------------- */
  const productId =
    typeof productRaw === 'string' ? productRaw : productRaw.id;

  console.log('[webhook] upsert → sub:', sub.id, 'product:', productId);

  /* 2️⃣  find Plan + Price rows in Keystone ------------------ */
  const { plans } = await keystoneFetch(FIND_PLAN_BY_PRODUCT, { productId });
  const planRow = plans?.[0];
  if (!planRow) {
    console.warn('[webhook] no Plan matches product', productId);
    return;
  }

  const stripePriceId = sub.items.data[0].price.id;
  const priceRow = planRow.prices.find(
    (p: any) => p.stripePriceId === stripePriceId,
  );
  if (!priceRow) {
    console.warn('[webhook] plan found but price row missing for', stripePriceId);
    return;
  }

  console.log('[webhook] matched plan:', planRow.key, 'priceRow:', priceRow.id);

  /* 3️⃣  prepare variables for both mutations ---------------- */
  const vars = {
    orgId,
    stripeSubId: sub.id,
    planId:  planRow.id,
    priceId: priceRow.id,
    status:  sub.status,
    start:   new Date(sub.start_date * 1000).toISOString(),
    end:     (sub.current_period_end ?? sub.billing_cycle_anchor)
               ? new Date(
                   (sub.current_period_end ?? sub.billing_cycle_anchor) * 1000,
                 ).toISOString()
               : null,
  } as const;

  /* 4️⃣  try UPDATE first ------------------------------------ */
  try {
    const { updateSubscription } = await keystoneFetch(UPDATE_SUBSCRIPTION, vars);

    // Keystone returns null when no item matches `where`
    if (updateSubscription) {
      console.log('[webhook] updated sub', updateSubscription.id);
      return;
    }
  } catch (err: any) {
    // Keystone returns KS_ACCESS_DENIED for both access & not‑found
    const msg = err.message ?? '';
    const accessIssue =
      msg.includes('KS_ACCESS_DENIED') || msg.includes('Access denied');

    if (!accessIssue) {
      // genuine failure → re‑throw
      throw err;
    }
  }

  /* 5️⃣  nothing updated → CREATE instead -------------------- */
  const { createSubscription } = await keystoneFetch(CREATE_SUBSCRIPTION, vars);
  console.log('[webhook] created sub', createSubscription.id);
}

/* ────────────────────────────────────────────────────────── */
/*  Main handler                                              */
/* ────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const sig  = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature failed', err);
    return new NextResponse('Bad signature', { status: 400 });
  }

  console.log('▶ webhook event:', event.type);

  let sub: Stripe.Subscription | null = null;
  let customerId = '';

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      sub = event.data.object as Stripe.Subscription;
      customerId = sub.customer as string;
      console.log('[webhook] got subscription event for', sub.id);
      break;
    }

    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session;
      console.log('[webhook] checkout completed → session', s.id);

      if (s.mode === 'subscription' && s.subscription) {
        customerId = s.customer as string;
        sub = await stripe.subscriptions.retrieve(s.subscription as string, {
          expand: ['items.data.price.product'],
        });
        console.log('[webhook] pulled subscription', sub.id);
      }
      break;
    }
  }

  if (!sub) return NextResponse.json({ received: true });

  /*  find organisation  */
  const { organisations } = await keystoneFetch(FIND_ORG_BY_CUSTOMER, {
    custId: customerId,
  });
  const org = organisations?.[0];
  if (!org) {
    console.warn('[webhook] customer', customerId, 'has no organisation');
    return NextResponse.json({ received: true });
  }

  /*  upsert  */
  await upsertSub(
    sub,
    sub.items.data[0].price.product,
    org.id,
  );

  return NextResponse.json({ received: true });
}
