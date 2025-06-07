import { useQuery } from '@apollo/client';
import { GET_USER_FIELDS_FILTERED } from '@/graphql/operations';

export default function useFields(userId: string, farmId: string | null) {
  const { data, loading, error } = useQuery(GET_USER_FIELDS_FILTERED, {
    skip: !userId,
    variables: { userId, farmId },
    fetchPolicy: 'cache-and-network',
  });
  return { fields: data?.fields ?? [], loading, error };
}
