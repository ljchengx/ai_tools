import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // 允许同一局域网中的设备访问开发服务器资源。
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.33.7"],
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
