/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        tls: false
      };
    }

    return config;
  },
  async rewrites() {
    return [
      {
        source: '/dashboards',
        destination: '/',
      },
      {
        source: '/dashboards/:any*',
        destination: '/',
      },
    ];
  }
}

module.exports = nextConfig