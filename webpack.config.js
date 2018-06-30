const webpack = require("webpack");

module.exports = {
  entry: ["./src/index.js"],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      }
    ]
  },
  devtool: "cheap-module-source-map",
  resolve: {
    extensions: ["*", ".js"]
  },
  output: {
    path: __dirname + "/dist",
    publicPath: "/",
    filename: "glfx.js",
    libraryTarget: "var",
    library: "fx"
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: __dirname + "/tests",
    hot: true
  }
};
