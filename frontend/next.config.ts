import type { NextConfig } from "next";

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1");
const mascotImageHosts = new Set([apiUrl.hostname, "localhost", "127.0.0.1"]);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: Array.from(mascotImageHosts).map((hostname) => ({
      protocol: apiUrl.protocol.slice(0, -1) as "http" | "https",
      hostname,
      port: hostname === apiUrl.hostname ? apiUrl.port : "8000",
      pathname: "/storage/mascots/**",
    })),
  },
};

export default nextConfig;
