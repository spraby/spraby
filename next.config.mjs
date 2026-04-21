/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    LOGIN_URL: process.env.LOGIN_URL,
  },
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
