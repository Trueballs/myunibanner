import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    '*': [
      './public/uk-universities/*/Bilder_HighRez/**',
      './public/norske-universiteter/*/Bilder_HighRez/**',
    ],
  },
  outputFileTracingIncludes: {
    '/api/brand': ['./src/data/cache/**/*.json'],
    '/api/full-logo': ['./src/data/cache/**/*.json'],
    '/api/logo': ['./src/data/cache/**/*.json'],
  },
};

export default nextConfig;
