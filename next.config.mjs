/** @type {import('next').NextConfig} */
const distDir = process.env.NEXT_DIST_DIR || ".next";

const nextConfig = {
  reactStrictMode: false,
  distDir,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'spraby.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ]
  }
};

export default nextConfig;
