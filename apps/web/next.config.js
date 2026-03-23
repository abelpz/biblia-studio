/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@biblia-studio/door43",
    "@biblia-studio/editing",
    "@biblia-studio/formats",
  ],
  // NodeNext-style `.js` imports in `packages/door43` resolve to `.ts` sources (see `tsconfig`).
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
