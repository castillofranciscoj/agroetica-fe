// src/components/PasswordStrengthBar.tsx
import clsx from 'clsx';

type Props = { password?: string };  // allow undefined

const score = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-4
};

export default function PasswordStrengthBar({ password = '' }: Props) {   // default to empty string
  const s = score(password);

  return (
    <div className="h-2 w-full bg-gray-200 rounded">
      <div
        className={clsx(
          'h-full rounded transition-all',
          s === 0 && 'w-0',
          s === 1 && 'w-1/4 bg-red-500',
          s === 2 && 'w-2/4 bg-yellow-500',
          s === 3 && 'w-3/4 bg-blue-500',
          s === 4 && 'w-full bg-green-600'
        )}
      />
    </div>
  );
}
