/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,

  async rewrites() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "fluxrent.com" }],
        destination: "/landing/:path*",
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "checkalist.com" }],
        destination: "/listings/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
