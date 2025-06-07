/* lib/keystone.ts */
import { keystoneFetch } from '@/lib/keystoneFetch';   // you already have this
import {
  FIND_ORG_BY_USER,
  SET_ORG_CUSTOMER_ID,
  UPDATE_SUBSCRIPTION,
} from '@/graphql/operations';

export async function getOrganisationByUser(userId: string) {
  const data = await keystoneFetch(FIND_ORG_BY_USER, { userId });
  const org = data.user?.memberships[0]?.organisation;
  if (!org) throw new Error('No organisation linked to user');
  return org;
}

export async function setStripeCustomerId(orgId: string, custId: string) {
  await keystoneFetch(SET_ORG_CUSTOMER_ID, { orgId, custId });
}

export async function upsertSubscription(input: {
  orgId: string;
  stripeSubId: string;
  stripePriceId: string;
  status: string;
  start: Date;
  end: Date;
}) {
  await keystoneFetch(UPDATE_SUBSCRIPTION, {
    ...input,
    start: input.start.toISOString(),
    end:   input.end.toISOString(),
  });
}
