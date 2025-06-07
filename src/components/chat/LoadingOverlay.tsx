'use client';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <span className="h-6 w-6 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
    </div>
  );
}
