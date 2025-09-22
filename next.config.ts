import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    turbo: {
        devOverlay: false,
    },
    images: {
        unoptimized: true,
    },
    distDir: "dist",
    // output: "export", // Commented out for database integration
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
};

export default nextConfig;
