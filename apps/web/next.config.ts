import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "res.cloudinary.com",
  },
  {
    protocol: "https",
    hostname: "entry.reactbd.com",
  },
  {
    protocol: "https",
    hostname: "*.supabase.co",
  },
  // Cloudflare R2's default public dev domain
  {
    protocol: "https",
    hostname: "*.r2.dev",
  },
];

// R2_PUBLIC_URL may be a custom domain that doesn't match the patterns
// above — add its hostname explicitly once it's set.
if (process.env.R2_PUBLIC_URL) {
  try {
    remotePatterns.push({
      protocol: "https",
      hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
    });
  } catch {
    // ignore invalid R2_PUBLIC_URL at build time
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
