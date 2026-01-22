
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'chelanranch.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'photos.app.goo.gl',
        port: '',
        pathname: '/**',
      },
    ],
  },
   experimental: {
    serverActions: {
      bodySizeLimit: '4mb', // Increase body size limit for file uploads
    },
  },
};

export default nextConfig;
