import type { NextConfig } from 'next';
import type { Configuration as WebpackConfiguration } from 'webpack';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config: WebpackConfiguration, { isServer }) => {
    // Fix for "Module not found: Can't resolve 'async_hooks'"
    // This module is Node.js specific and not available in the browser.
    // We alias it to false for the client-side bundle to prevent the error.
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};

      // Ensure we're merging with an object, not an array or other type
      const existingAlias = (typeof config.resolve.alias === 'object' && !Array.isArray(config.resolve.alias))
        ? config.resolve.alias
        : {};

      config.resolve.alias = {
        ...existingAlias,
        'async_hooks': false,
      };
    }
    return config;
  },
};

export default nextConfig;
