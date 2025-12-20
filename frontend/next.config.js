/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  
  // CRITICAL: Disable CSS processing for problematic modules
  webpack: (config, { isServer }) => {
    // Find and modify the CSS rule
    const cssRule = config.module.rules.find(
      rule => rule.test && rule.test.toString().includes('.css')
    );
    
    if (cssRule) {
      cssRule.exclude = /node_modules\/leaflet/;
    }
    
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
