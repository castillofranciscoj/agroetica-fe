import { keystoneFetch } from '@/lib/keystoneFetch';
import {
  FIND_ORG_BY_USER,
  CREATE_ORGANISATION,
} from '@/graphql/operations';

/**
 * Ensures the user belongs to an Organisation; creates one if needed.
 */
export async function ensureOrganisation(args: {
  id: string;          // User.id
  name: string;
  email: string;
}) {
  /* 1️⃣  try existing org via membership --------------------------- */
  const { user } = await keystoneFetch(FIND_ORG_BY_USER, { userId: args.id });
  const existing = user?.memberships?.[0]?.organisation;
  if (existing) return existing;

  /* 2️⃣  create new org with a unique placeholder customer ID ----- */
  const placeholder = `pending_${args.id}_${Date.now()}`;   // always unique

  const { createOrganisation: org } = await keystoneFetch(CREATE_ORGANISATION, {
    data: {
      name: args.name,
      stripeCustomerId: placeholder,            // ⬅︎ prevents duplicate ""
      memberships: {
        create: {
          role: 'admin',
          user: { connect: { id: args.id } },
        },
      },
    },
  });

  return org;
}
