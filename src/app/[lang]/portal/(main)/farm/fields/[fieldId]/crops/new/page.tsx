'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocaleRouter } from '@/lib/useLocaleRouter';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CROP_TYPES,
  CREATE_CROP,
  GET_CROPS,
} from '@/graphql/operations';

export default function NewCropPage() {
  const { landId } = useParams() as { landId: string };
const router = useLocaleRouter();
  const { data: typesData, loading: typesLoading } = useQuery(GET_CROP_TYPES);
  const [cropTypeId, setCropTypeId] = useState('');
  const [area, setArea] = useState('');
  const [createCrop, { loading, error }] = useMutation(CREATE_CROP, {
    refetchQueries: [{ query: GET_CROPS, variables: { landId } }],
  });

  if (typesLoading) return <p>Loading types…</p>;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCrop({
      variables: {
        landId,
        cropTypeId,
        cropAreaHectares: parseFloat(area),
      },
    });
    router.push(`/lands/${landId}/crops`);
  };

  return (
    <form onSubmit={onSubmit} className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">New Crop</h1>
      <select
        className="w-full border p-2"
        value={cropTypeId}
        onChange={e => setCropTypeId(e.target.value)}
        required
      >
        <option value="">Select type…</option>
        {typesData.cropTypes.map((t: unknown) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <input
        className="w-full border p-2"
        placeholder="Area (ha)"
        type="number"
        step="0.01"
        value={area}
        onChange={e => setArea(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Creating…' : 'Create Crop'}
      </button>
      {error && <p className="text-red-600">Error: {error.message}</p>}
    </form>
  );
}
