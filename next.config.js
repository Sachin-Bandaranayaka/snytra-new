const NextAxiosNetworkPlugin = require("next-axios-network/plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Add the Next-Axios-Network plugin for monitoring server-side requests
    config.plugins.push(
      NextAxiosNetworkPlugin({
        maxCaches: 100, // Increase the maximum cached requests for better debugging
      })
    );
    if (!isServer) {
      // Don't resolve 'fs', 'net', 'dns', and other Node.js built-ins on the client
      config.resolve.fallback = {
        fs: false,
        net: false,
        dns: false,
        tls: false,
        path: false,
        child_process: false,
        os: false,
        stream: false,
        crypto: false
      };
    }
    return config;
  },
  images: {
    domains: ['uploadthing.com', 'fonts.gstatic.com', 'randomuser.me', 'utfs.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      }
    ],
  },
  // Optional: Adjust the output structure
  output: 'standalone',
  // ... any other existing config
}

module.exports = nextConfig 