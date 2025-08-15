const { override, adjustWebpackConfig } = require('customize-cra');

module.exports = override(
  adjustWebpackConfig((config) => {
    config.resolve = {
      ...config.resolve,
      fullySpecified: false, // Disable strict ES module resolution
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'], // Support .mjs files
    };
    return config;
  })
);