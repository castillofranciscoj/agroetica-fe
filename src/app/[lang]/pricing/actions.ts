'use server';

import stripe from '@/lib/stripe';
import { ensureOrganisation } from '@/lib/ensureOrg';
import { auth } from '@/auth';
import { keystoneFetch } from '@/lib/keystoneFetch';
import {
  FIND_PLAN_PRICE_ID,
  SET_ORG_CUSTOMER_ID,
} from '@/graphql/operations';

/* ------------------------------------------------------------------ */
/*  Server Action called from <PricingTable>                          */
/* ------------------------------------------------------------------ */
export async function subscribePlan(
  planKey: 'free' | 'starter' | 'pro',
): Promise<string> {
  console.log('──────────────────────────────────────────');
  console.log('[action] ► subscribePlan start –', planKey);

  /* ---------- 1. Auth ---------- */
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorised');
  const { id: userId, name, email } = session.user;
  console.log('[action] user:', userId, email);

  /* ---------- 2. Resolve active Stripe price ---------- */
  const { plan } = await keystoneFetch(FIND_PLAN_PRICE_ID, { key: planKey });
  console.log('[action] plan query result:', JSON.stringify(plan, null, 2));

  if (planKey === 'free') {
    console.log('[action] free plan – skipping Stripe, redirecting to /portal');
    return '/portal';
  }

  if (!plan?.activePrice?.stripePriceId)
    throw new Error(`Plan "${planKey}" is not purchasable`);

  const priceId = plan.activePrice.stripePriceId;
  console.log('[action] stripePriceId:', priceId);

  /* ---------- 3. Ensure organisation ---------- */
  const org = await ensureOrganisation({
    id: userId,
    name: name ?? email,
    email,
  });
  console.log('[action] org:', org.id, org.name);

  /* ---------- 4. Ensure Stripe customer ---------- */
  let customerId = org.stripeCustomerId;
  if (!customerId || customerId.startsWith('pending_')) {
    console.log('[action] creating Stripe customer…');
    const customer = await stripe.customers.create({
      email,
      name: org.name,
      metadata: { orgId: org.id },
    });
    customerId = customer.id;
    console.log('[action] new customerId:', customerId);

    await keystoneFetch(SET_ORG_CUSTOMER_ID, {
      orgId: org.id,
      custId: customerId,
    });
    console.log('[action] saved customerId to org');
  } else {
    console.log('[action] re-using existing customerId:', customerId);
  }

  /* ---------- 5. Create Checkout session ---------- */
  const base = process.env.NEXT_PUBLIC_APP_URL;   // e.g. https://app.yoursaas.com
  console.log('[action] creating Checkout Session…');
  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/portal/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${base}/portal/checkout/cancel`,
    metadata: { orgId: org.id },
  });

  console.log('[action] session created:', checkout.id);
  console.log('[action] session URL:', checkout.url);
  console.log('[action] ► subscribePlan end');
  console.log('──────────────────────────────────────────');

  return checkout.url!;
}
