import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Pósters servidos por el CDN público de imágenes de TMDB (no requiere API key).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
