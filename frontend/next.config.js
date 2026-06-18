/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    return [
      {
        source: '/api/predict',
        destination: `${backendUrl}/predict`,
      },
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['pg', 'pg-pool'],
  },
}

module.exports = nextConfig
