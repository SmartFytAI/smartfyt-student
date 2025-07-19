import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // PWA Configuration
  experimental: {
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
    // Enable Turbopack for faster development
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Development configuration
  devIndicators: {
    buildActivity: false,
  },

  // Webpack configuration to fix WASM hash issues
  webpack: (config, { isServer }) => {
    // Fix for WASM hash issues with Node.js 22
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }

    // Use a different hash function to avoid WASM issues
    config.output.hashFunction = 'xxhash64';
    config.output.hashDigest = 'hex';

    return config;
  },

  // Mobile Optimizations
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance
  compress: true,
  poweredByHeader: false,

  // Mobile-first headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Mobile manifest
  async rewrites() {
    return [
      {
        source: '/manifest.json',
        destination: '/api/manifest',
      },
    ];
  },
};

export default nextConfig;
