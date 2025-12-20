/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  
  // ADD THIS WEBPACK CONFIG
  webpack: (config) => {
    // Skip processing Leaflet CSS files
    config.module.rules.push({
      test: /\.css$/,
      include: /node_modules\/leaflet/,
      use: ['ignore-loader']
    });
    
    return config;
  },

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
