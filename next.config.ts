import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kullanıcıların yüklediği görseller sıkıştırılmış data URL olarak gelebilir.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
