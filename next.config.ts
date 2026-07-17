import type { NextConfig } from "next";
import dns from "node:dns";
 
// En algunas máquinas Windows, Node (via undici/fetch) intenta resolver
// dominios por IPv6 primero y falla con ENOTFOUND aunque el DNS del sistema
// operativo resuelva bien por IPv4. Esto rompe el proxy de optimización de
// imágenes (/_next/image) cuando busca las imágenes en Supabase Storage.
// Forzamos que Node pruebe IPv4 primero para evitarlo.
dns.setDefaultResultOrder("ipv4first");
 
const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
 
export default nextConfig;