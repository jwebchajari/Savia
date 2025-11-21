/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    externalDir: true,
  },

  srcDir: "src",

  // 👇 Configuración para permitir imágenes externas
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "gstatic.com",
      },
      {
        protocol: "https",
        hostname: "*.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      }
    ],
  },
};

export default nextConfig;
