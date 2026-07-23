/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'gazetadealphaville.com.br' },
      { protocol: 'https', hostname: '*.ondigitalocean.app' },
    ],
  },
};

export default nextConfig;
