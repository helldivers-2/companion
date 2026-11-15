import path from "node:path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

export default {
  entry: { main: ["./src/js/main.js", "./src/scss/main.scss"] },
  output: { path: path.resolve("_site/assets"), filename: "[name].js" },
  module: {
    rules: [
      { test: /\.s?css$/, use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"] },
      { test: /\.woff2?$/, type: "asset/resource", generator: { filename: "fonts/[name][ext]" } },
    ],
  },
  plugins: [new MiniCssExtractPlugin({ filename: "[name].css" })],
  devtool: false,
};
