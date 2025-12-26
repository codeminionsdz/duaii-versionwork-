/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['nbdytzfnzccwshagzpeu.supabase.co'],
  },
  // Keep source maps in production builds to aid Sentry debugging (upload maps to Sentry for best results)
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
