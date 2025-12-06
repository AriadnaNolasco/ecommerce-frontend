import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "hmperu.vtexassets.com" },
      { protocol: "https", hostname: "hmcolombia.vtexassets.com" },
      { protocol: "https", hostname: "lp2.hm.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      // 👇 Nuevo dominio agregado para Ripley
      { protocol: "https", hostname: "rimage.ripley.com.pe" },
    ],
  },
};

export default nextConfig;