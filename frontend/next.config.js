/** @type {import('next').NextConfig} */
const proxyTarget =
  process.env.CRUISE_API_PROXY_TARGET
  || (process.env.NEXT_PUBLIC_API_BASE_URL && /^https?:\/\//.test(process.env.NEXT_PUBLIC_API_BASE_URL)
    ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/?$/, '')
    : 'http://127.0.0.1:8080')

const isProductionBuild = process.env.NODE_ENV === 'production'

const nextConfig = {
  reactStrictMode: true,
  ...(isProductionBuild ? { output: 'standalone' } : {}),
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${proxyTarget}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
