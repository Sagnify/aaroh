/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.ibb.co', 'via.placeholder.com'],
  },
  // Enable SWC minification for faster builds
  swcMinify: true,
  // Optimize production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig
