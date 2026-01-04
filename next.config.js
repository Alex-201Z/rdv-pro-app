/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force no caching for deployment debugging
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
