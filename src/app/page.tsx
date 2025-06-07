// src/app/page.tsx  (⩽ 20 LoC unchanged, only marked lines are new)
import { redirect } from 'next/navigation';
import { cookies }  from 'next/headers';                // ← already there

export default async function Root() {                  // ← async
  /* ↓↓↓ NEW – await cookies() in Next 15 */
  const cookieLang = (await cookies()).get('lang')?.value;
  const target     = cookieLang === 'it' || cookieLang === 'es' ? cookieLang : 'en';

  redirect(`/${target}`);
}
