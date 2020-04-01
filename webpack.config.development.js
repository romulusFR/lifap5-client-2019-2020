const config = require('./webpack.config.common');

const devConfig = { ...config, mode: 'development', devtool: 'inline-source-map' };

module.exports = devConfig;
