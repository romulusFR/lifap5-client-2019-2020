const webpack = require ('webpack'); 
const config = require('./webpack.config.common');
const pjson = require('./package.json')

const defines = new webpack.DefinePlugin({
  DEVELOPMENT: JSON.stringify(true),
  VERSION: JSON.stringify(pjson.version),
  NAME: JSON.stringify(pjson.name),
});

const devConfig = { ...config, mode: 'development', devtool: 'inline-source-map' };

devConfig.plugins.push(defines);

module.exports = devConfig;
