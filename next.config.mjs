/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: '/rss.xml',
            destination: '/rss',
          },
        ];
      },
};

export default nextConfig;
