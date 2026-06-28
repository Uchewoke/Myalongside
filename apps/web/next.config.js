const path = require("path");

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  // Keep tracing scoped to this monorepo root.
  outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self \"https://meet.jit.si\"), microphone=(self \"https://meet.jit.si\"), display-capture=(self \"https://meet.jit.si\"), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://meet.jit.si;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
