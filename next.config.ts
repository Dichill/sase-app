import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
    distDir: "dist",
    output: "export",
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
};

export default nextConfig;
