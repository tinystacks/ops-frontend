const path = require('path');
// const fs = require('fs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    const { resolve = {} } = config || {};
    const { alias = [], modules = [] } = resolve;
    
    const dependenciesPath = path.resolve(__dirname, '../dependencies/node_modules/')

    modules.push(dependenciesPath);
    resolve.modules = modules;

    const newConfig = {
      ...config,
      resolve
    };

    // fs.writeFileSync('./next-webpack-config.js', JSON.stringify(
    //   newConfig,
    //   (key, value) => {
    //     return typeof value === "bigint" ? value.toString() + "n" : value;
    //   },
    //   2
    // ));

    return newConfig;
  }
}

module.exports = nextConfig
