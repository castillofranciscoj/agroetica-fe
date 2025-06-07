'use client';
import { motion } from 'framer-motion';
import React from 'react';

interface Props {
  title:   string;
  subtitle: string;
}

export default function LoginHeroVideo({ title, subtitle }: Props) {
  return (
    <div className="relative hidden md:block md:w-1/2">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/img/AdobeStock_423364592.mov"
        autoPlay loop muted playsInline
        poster="/img/hero-poster.jpg"
      />
      <div className="absolute inset-0 bg-black/40" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
      >
        <h2 className="text-white text-3xl font-extrabold md:text-4xl lg:text-5xl max-w-lg leading-tight">
          {title}
        </h2>
        <p className="text-white/90 mt-4 max-w-md">{subtitle}</p>
      </motion.div>
    </div>
  );
}
