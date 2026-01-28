import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets-in.bmscdn.com' },
      { protocol: 'https', hostname: 'in.bmscdn.com' },
      { protocol: 'https', hostname: 'images.lifestyleasia.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'hjmhubbufgaeqxefodoz.supabase.co' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'static.insider.in' },
      { protocol: 'https', hostname: 'insider.in' },
      { protocol: 'https', hostname: 'media-cdn.tripadvisor.com' },
      { protocol: 'https', hostname: 'dynamic-media-cdn.tripadvisor.com' },
    ],
  },
};

export default nextConfig;
