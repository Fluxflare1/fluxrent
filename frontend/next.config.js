// frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // App Router is stable now, no need for experimental.appDir
  experimental: {
    typedRoutes: true, // optional, enables better TS checks
  },

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
