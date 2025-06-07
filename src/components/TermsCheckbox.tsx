'use client';
import Link from 'next/link';
import React from 'react';

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  linkHref: string;
  linkLabel: string;
}

export default function TermsCheckbox({
  checked,
  onChange,
  label,
  linkHref,
  linkLabel,
}: Props) {
  return (
    <label className="flex items-start gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-1"
      />
      <span>
        {label}{' '}
        <Link href={linkHref} target="_blank" className="underline">
          {linkLabel}
        </Link>
      </span>
    </label>
  );
}
