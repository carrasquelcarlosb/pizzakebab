/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 features
  experimental: {
    // Remove reactCompiler until you install babel-plugin-react-compiler
    // reactCompiler: true,

    // Remove ppr - only available in canary versions
    // ppr: true,

    // Server actions configuration
    serverActions: {
      allowedOrigins: ["localhost:3000", "pizzakebab.com"],
    },
  },


  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placeholder.svg",
      },
    ],
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ]
  },

  // Webpack configuration for custom loaders like SVGR
  webpack: (config) => {
    // SVGR configuration
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Bundle analyzer (optional)
    if (process.env.ANALYZE === "true") {
      config.plugins.push(
        new (require("@next/bundle-analyzer")({
          enabled: true,
        }))()
      )
    }

    return config
  },
}

export default nextConfig