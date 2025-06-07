// src/components/Logo.tsx
'use client';

import Image from 'next/image';

/* Original PNG: 800 × 277 px  (≈ 2.886 : 1) */
const RATIO         = 800 / 277;
const DEFAULT_WIDTH = 210;

export default function Logo({ width = DEFAULT_WIDTH }: { width?: number }) {
  const h      = Math.round(width / RATIO);   // intrinsic PNG height
  const hillsH = Math.round(h * 0.35);        // hills band ≈ 35 % of logo
  const raise  = Math.round(hillsH * 0.40);   // lift hills 40 % of their own height

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ width, height: h }}
      draggable={false}
    >
      {/* ───────── rolling hills ───────── */}
      <svg
        viewBox="0 0 1200 120"
        width={width * 1.4}
        height={hillsH}
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ bottom: raise }}            /* hills stay where they are */
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 55  Q300 25 600 40  Q900 55 1200 35 L1200 120 L0 120 Z" fill="#8fcf56" />
        <path d="M0 70  Q250 40 550 60  Q850 80 1200 50 L1200 120 L0 120 Z" fill="#4f8c34" />
        <path d="M0 85  Q300 65 600 80  Q900 95 1200 70 L1200 120 L0 120 Z" fill="#2e662d" opacity="0.9" />
        <path d="M0 90  L0 120 L1200 120 L1200 80  Q900 95 600 80  Q300 65 0 90 Z" fill="#d7d245" />
      </svg>

      {/* ───────── word-mark (shifted 4 px down) ───────── */}
      <Image
        src="/img/agroetica-logo-web-png.png"
        alt="Agroetica"
        width={width}
        height={h}
        priority
        draggable={false}
        className="relative z-10 pointer-events-none"
        style={{ transform: 'translateY(7px)' }}   /* 👈 only change */
      />
    </div>
  );
}
