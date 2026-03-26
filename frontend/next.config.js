/** @type {import('next').NextConfig} */
const proxyTarget =
  process.env.CRUISE_API_PROXY_TARGET
  || (process.env.NEXT_PUBLIC_API_BASE_URL && /^https?:\/\//.test(process.env.NEXT_PUBLIC_API_BASE_URL)
    ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:8080')

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
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
