// next.config.mjs
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

/* recreate __dirname for ESM files */
const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        pathname: '/maps/api/**',
      },
    ],
  },

  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
  output: 'standalone',

  /* runtime alias: every `next/link` import → your LocaleLink wrapper */
  webpack(config) {
    config.resolve.alias['next/link'] = resolve(__dirname, 'src/link.ts');
    return config;
  },
};

export default nextConfig;
