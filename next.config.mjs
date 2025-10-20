const enableReactCompiler = process.env.NEXT_ENABLE_REACT_COMPILER === "true"
const enablePartialPrerendering = process.env.NEXT_ENABLE_PPR === "true"

const nextConfig = {
  // Next.js experimental features are gated behind explicit opt-in flags.
  experimental: {
    // Enable the React compiler only when React 19 is available in the runtime.
    ...(enableReactCompiler ? { reactCompiler: true } : {}),
    // Enable Turbopack for development
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
    // Enable partial prerendering when running on a Next.js canary build.
    ...(enablePartialPrerendering ? { ppr: true } : {}),
    // Enable server actions
    serverActions: {
      allowedOrigins: ["localhost:3000", "pizzakebab.com"],
    },
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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

  // Internationalization
  i18n: {
    locales: ["en", "fr", "de"],
    defaultLocale: "en",
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

  // Bundle analyzer (optional)
  ...(process.env.ANALYZE === "true" && {
    webpack: (config) => {
      config.plugins.push(
        new (require("@next/bundle-analyzer")({
          enabled: true,
        }))()
      )
      return config
    },
  }),
}

export default nextConfig
