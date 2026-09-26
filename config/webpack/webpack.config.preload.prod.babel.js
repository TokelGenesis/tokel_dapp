/**
 * Webpack config for the electron preload script (contextBridge).
 * Must be bundled separately from main and renderer.
 */

import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { merge } from 'webpack-merge';

import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../scripts/CheckNodeEnv';
import paths from '../scripts/paths';

CheckNodeEnv('production');

export default merge(baseConfig, {
  ...(process.env.DEBUG_PROD === 'true' ? { devtool: 'source-map' } : {}),
  mode: 'production',
  target: 'electron-preload',
  entry: paths.electronPreloadFile,

  output: {
    path: paths.electronBuildDir,
    filename: 'preload.js',
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
      }),
    ],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },
});
