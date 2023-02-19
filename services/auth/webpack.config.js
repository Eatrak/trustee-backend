const path = require('path');
const slsw = require('serverless-webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  stats: 'summary',
  resolve: {
    fullySpecified: false,
    extensions: ['.ts', ".js", ".mjs"],
    plugins: [new TsconfigPathsPlugin({
      baseUrl: path.resolve(__dirname, '.'),
      configFile: path.resolve(__dirname, './tsconfig.json'),
        extensions: ['.ts', '.js', ".mjs"]
    })]
  },
  target: 'node',
  module: {
    noParse: /@typedorm\/[core|common|testing]/,
    rules: [
      {
        test: /\.(ts?)$/,
        loader: 'ts-loader',
        exclude: [
          [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, '.serverless'),
            path.resolve(__dirname, '.webpack'),
          ],
        ],
      },
    ],
  },
};