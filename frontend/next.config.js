/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Update: Use the stable version instead of experimental
  typedRoutes: true,

  async rewrites() {
    return [
      // FluxRent.com → landing app
      {
        source: "/:path*",
        has: [{ type: "host", value: "fluxrent.com" }],
        destination: "/landing/:path*",
      },
      // Checkalist.com → listings app
      {
        source: "/:path*",
        has: [{ type: "host", value: "checkalist.com" }],
        destination: "/listings/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
