// src/components/NewsletterSignup.tsx
'use client';

import { useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/i18n';

import {
  GET_NEWSLETTER_SUBSCRIBER_BY_EMAIL,
  UPDATE_NEWSLETTER_SUBSCRIBER,
  CREATE_NEWSLETTER_SUBSCRIBER,
} from '@/graphql/operations';

export default function NewsletterSignup() {
  const { lang } = useLanguage();
  const client = useApolloClient();

  const [email, setEmail] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [formError, setFormError] = useState('');

  const [createSubscriber, { loading: creating }] =
    useMutation(CREATE_NEWSLETTER_SUBSCRIBER);
  const [updateSubscriber, { loading: updating }] =
    useMutation(UPDATE_NEWSLETTER_SUBSCRIBER);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmation('');
    setFormError('');

    const trimmed = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setFormError(t[lang].invalidEmailLabel);
      return;
    }

    try {
      const { data } = await client.query({
        query: GET_NEWSLETTER_SUBSCRIBER_BY_EMAIL,
        variables: { email: trimmed },
        fetchPolicy: 'network-only',
      });
      const existing = data.newsletterSubscribers[0];
      if (existing) {
        if (existing.isActive) {
          setFormError(t[lang].alreadySubscribedLabel);
        } else {
          await updateSubscriber({ variables: { id: existing.id, isActive: true } });
          setConfirmation(t[lang].resubscribedLabel);
          setEmail('');
        }
      } else {
        await createSubscriber({ variables: { email: trimmed } });
        setConfirmation(t[lang].newsletterSignupConfirmationLabel);
        setEmail('');
      }
    } catch {
      setFormError(t[lang].newsletterSignupErrorLabel);
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-4">{t[lang].newsletterSignupLabel}</h3>
      <form onSubmit={handleSubscribe} className="space-y-2">
        <input
          type="email"
          placeholder={t[lang].emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          disabled={creating || updating}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {t[lang].submitButtonLabel}
        </button>
      </form>
      {confirmation && <p className="mt-2 text-sm text-green-600">{confirmation}</p>}
      {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
    </div>
  );
}
