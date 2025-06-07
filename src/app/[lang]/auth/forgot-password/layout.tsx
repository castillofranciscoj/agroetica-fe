// src/app/[lang]/portal/forgot-password/layout.tsx
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No <html>/<body> here – that’s already in the root layout.
  // No header, no extra providers: just render the login page.
  return <>{children}</>;
}
