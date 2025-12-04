import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path((?!auth).*)",
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
