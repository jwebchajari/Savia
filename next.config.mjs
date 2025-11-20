/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    externalDir: true,
  },
  // 👇 ESTA ES LA CLAVE
  srcDir: 'src',
};

export default nextConfig;
