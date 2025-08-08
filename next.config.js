/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  webpack: (config, { isServer }) => {
    // Fix for Tailwind CSS module resolution issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
