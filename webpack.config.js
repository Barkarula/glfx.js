const webpack = require("webpack");

module.exports = (env, argv) => {
  return {
    entry: ["./src/index.js"],
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: ["babel-loader"]
        }
      ]
    },
    devtool: argv.mode === "production" ? false : "cheap-module-source-map",
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
    plugins:
      argv.mode === "production"
        ? []
        : [new webpack.HotModuleReplacementPlugin()],
    devServer: {
      contentBase: __dirname + "/tests",
      hot: true
    }
  };
};
