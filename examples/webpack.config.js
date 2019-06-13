const webpack = require("webpack");
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");

const mode = process.env.NODE_ENV || "development";

const lp = (...p) => path.join(path.resolve(__dirname), ...p);

module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "[name].[contenthash].js",
    path: lp("build"),
    publicPath: "/",
  },

  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },

  devServer: {
    contentBase: lp("build"),
    compress: true,
    port: 9002,
    historyApiFallback: true,
  },

  watchOptions: {
    ignored: /node_modules/,
    poll: true,
  },

  mode: mode,
  devtool: mode === "development" ? "inline-source-map" : "",

  resolve: {
    modules: [
      lp("node_modules"),
      lp("src"),
    ],
    extensions: [".ts", ".tsx", ".js", ".json"],
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(mode),
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: "public/index.html",
    }),
  ],

  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  },
};
