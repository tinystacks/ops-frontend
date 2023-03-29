const path = require('path');
// const fs = require('fs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    const {
      resolve = {},
      resolveLoader = {}
    } = config || {};
    const {
      modules: resolveModules = []
    } = resolve;
    const { modules: resolveLoaderModules = [] } = resolveLoader;
    
    const dependenciesPath = path.resolve(__dirname, '../dependencies/node_modules/')

    resolveModules.push(dependenciesPath);
    resolve.modules = resolveModules;
    
    resolveLoaderModules.push(dependenciesPath);
    resolveLoader.modules = resolveLoaderModules;

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
