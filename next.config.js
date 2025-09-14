module.exports = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  // 添加以下配置解决 public/_app 问题
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false
    };
    return config;
  },
  // 禁用不必要的静态文件检查
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true
};
