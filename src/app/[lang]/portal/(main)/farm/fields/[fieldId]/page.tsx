//src/app/portal/(main)/fields/[fieldId]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_FIELD } from '@/graphql/operations';
import FieldView, { Field } from '@/components/FieldView';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

export default function LandPage() {
  const { lang } = useLanguage();
  const { fieldId } = useParams();

  const { data, loading, error } = useQuery<{ field: Field }>(GET_FIELD, {
    variables: { id: fieldId },
    skip: !fieldId,
  });

  if (loading) return <p className="p-6">{t[lang].loading}…</p>;
  if (error) return <p className="p-6 text-red-600">{error.message}</p>;
  if (!data?.field) return <p className="p-6">{t[lang].notFound}</p>;

  return <FieldView field={data.field} />;
}
