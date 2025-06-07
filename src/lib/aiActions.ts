//src/lib/aiActions.ts

import apolloClient from '@/lib/apolloClient';
import {
  GET_FARMS,
  GET_FIELDS,
  GET_LAND_PRACTICES,
  CREATE_SUSTAINABLE_PRACTICE_EVENT,
} from '@/graphql/operations';

/* ----- farms ----- */
export async function selectFarms(): Promise<FarmFromGQL[]> {
    const { data, errors } = await apolloClient.query({
      query: GET_FARMS
    });
    if (errors?.length) {
      console.error('Error fetching farms:', errors);
      throw new Error(errors.map(e => e.message).join(', '));
    }
    return data.farms;
  }

/* ----- lands ----- */
export async function selectLands(farmId: string) {
  const { data } = await apolloClient.query({
    query: GET_FIELDS,
    variables: { farmId },
  });
  return data.lands;
}

/* ----- sustainable practices ----- */
export async function listLandPractices(landId: string) {
  const { data } = await apolloClient.query({
    query: GET_LAND_PRACTICES,
    variables: { landId },
  });
  return data.sustainablePractices;
}

export async function adoptPracticeEvent({
  landId,
  practiceId,
}: {
  landId: string;
  practiceId: string;
}) {
  const appliedDate = new Date().toISOString();
  const { data, errors } = await apolloClient.mutate({
    mutation: CREATE_SUSTAINABLE_PRACTICE_EVENT,
    variables: {
      landId,
      practiceId,
      parameters: { Type: 'Practice adopted' },
      appliedDate,
    },
  });
  if (errors?.length) {
    console.error('Error creating practice event:', errors);
    throw new Error(errors.map(e => e.message).join(', '));
  }

  // return exactly the shape your UI expects
  return {
    id:           data.createSustainablePracticeEvent.id,
    landId:       data.createSustainablePracticeEvent.land.id,
    landName:     data.createSustainablePracticeEvent.land.name,
    practiceId:   data.createSustainablePracticeEvent.practice.id,
    practiceName: data.createSustainablePracticeEvent.practice.name,
    parameters:   data.createSustainablePracticeEvent.parameters,
    appliedDate:  data.createSustainablePracticeEvent.appliedDate,
  };
}
