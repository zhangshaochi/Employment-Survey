module.exports = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false
    };
    return config;
  }
};
