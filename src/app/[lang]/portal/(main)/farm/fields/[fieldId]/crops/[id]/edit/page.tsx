'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useLocaleRouter } from '@/lib/useLocaleRouter';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CROP_TYPES,
  GET_CROP,
  UPDATE_CROP,
  DELETE_CROP,
  GET_CROPS,
} from '@/graphql/operations';

export default function EditCropPage() {
  const { landId, id } = useParams() as { landId: string; id: string };
const router = useLocaleRouter();

  const { data: typesData } = useQuery(GET_CROP_TYPES);
  const { data, loading, error } = useQuery(GET_CROP, { variables: { id } });

  const [cropTypeId, setCropTypeId] = useState('');
  const [area, setArea] = useState('');

  const [updateCrop, { loading: updating, error: updateError }] = useMutation(
    UPDATE_CROP,
    { refetchQueries: [{ query: GET_CROPS, variables: { landId } }] }
  );
  const [deleteCrop, { loading: deleting, error: deleteError }] = useMutation(
    DELETE_CROP,
    { refetchQueries: [{ query: GET_CROPS, variables: { landId } }] }
  );

  useEffect(() => {
    if (data?.crop) {
      setCropTypeId(data.crop.cropType.id);
      setArea(data.crop.cropAreaHectares.toString());
    }
  }, [data]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCrop({
      variables: { id, cropTypeId, cropAreaHectares: parseFloat(area) },
    });
    router.push(`/lands/${landId}/crops`);
  };

  const onDelete = async () => {
    if (confirm('Delete this crop?')) {
      await deleteCrop({ variables: { id } });
      router.push(`/lands/${landId}/crops`);
    }
  };

  return (
    <form onSubmit={onUpdate} className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Edit Crop</h1>
      <select
        className="w-full border p-2"
        value={cropTypeId}
        onChange={e => setCropTypeId(e.target.value)}
        required
      >
        <option value="">Select type…</option>
        {typesData?.cropTypes.map((t: unknown) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <input
        className="w-full border p-2"
        type="number"
        step="0.01"
        value={area}
        onChange={e => setArea(e.target.value)}
        required
      />
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={updating}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {updating ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={onDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
      {(updateError || deleteError) && (
        <p className="text-red-600">
          Error: {updateError?.message || deleteError?.message}
        </p>
      )}
    </form>
  );
}
