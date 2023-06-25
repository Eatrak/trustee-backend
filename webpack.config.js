const path = require('path');
const serverlessWebpack = require('serverless-webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  devtool: 'inline-cheap-module-source-map',
  entry: serverlessWebpack.lib.entries,
  mode: 'production',
  module: {
    rules: [{
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          // disable type checker - we will use it in fork plugin
          transpileOnly: true
        }
      }
    ],
  },
  node: false,
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        keep_classnames: true,
        keep_fnames: true,
      }
    }
    )],
  },
  resolve: {
    alias: {
      "@libs": path.resolve(__dirname, 'libs')
    },
    extensions: ['.mjs', '.ts', '.js']
  },
  target: 'node',
};
