const CompressionPlugin = require('compression-webpack-plugin');
const config = require('./webpack.config.common');

const devConfig = { ...config, mode: 'production' };
devConfig.plugins.push(new CompressionPlugin({test: /(\.css|\.js)$/i,}));

module.exports = devConfig;
