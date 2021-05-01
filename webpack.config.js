// https://softwarerecs.stackexchange.com/questions/38274

/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/Main.ts',
  devtool: 'inline-source-map',
  mode: 'development',
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.pegjs$/, use: 'raw-loader', exclude: /node_modules/ },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'atcoder-wt.user.js',
  },
  plugins: [
    new webpack.BannerPlugin({
      raw: true,
      banner: `// ==UserScript==
               // @author          akouryy
               // @copyright       akouryy 2021
               // @grant           none
               // @name            atcoder-wt
               // @namespace       https://github.com/akouryy/atcoder-wt.user.js
               // @match           https://atcoder.jp/contests/*/tasks/*
               // @match           https://atcoder.jp/contests/*/custom_test
               // @version         1.0.0
               // ==/UserScript==`.replace(/\n */gm, '\n')
    }),
  ],
}
