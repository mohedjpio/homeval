/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output bundles only what's needed to run — smaller Docker image
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
}
module.exports = nextConfig
