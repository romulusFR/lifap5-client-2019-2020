const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const config = require('./webpack.config.common');
const pjson = require('./package.json');

const defines = new webpack.DefinePlugin({
  DEVELOPMENT: JSON.stringify(false),
  VERSION: JSON.stringify(pjson.version),
  NAME: JSON.stringify(pjson.name),
});

const prodConfig = { ...config, mode: 'production' };

prodConfig.plugins.push(new CompressionPlugin({ test: /(\.css|\.js)$/i }));
prodConfig.plugins.push(defines);

module.exports = prodConfig;
