const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/colors',
    '@ant-design/cssinjs'
  ],
  modularizeImports: {
    antd: {
      transform: 'antd/lib/{{ kebabCase member }}',
    },
  },
  experimental: {
    optimizePackageImports: ['antd'],
  }
};
 
module.exports = withNextIntl(nextConfig);