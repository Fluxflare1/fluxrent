// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // FluxRent (main platform landing)
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "fluxrent.com", // production domain
          },
        ],
        destination: "/(landing)/:path*",
      },

      // Checkalist (listings hub)
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "checkalist.com", // secondary domain
          },
        ],
        destination: "/(listings)/:path*",
      },
    ]
  },
}

module.exports = nextConfig
