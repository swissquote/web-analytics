const path = require("path");
const webpack = require("webpack");
const glob = require("glob");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const globOpts = {
  cwd: __dirname,
  strict: true,
  absolute: true,
  ignore: ["**/node_modules/**"]
};

const alias = {};

// Deduplicate modules
glob.sync("packages/**/package.json", globOpts).forEach(result => {
  alias[require(path.normalize(result)).name] = path.normalize(
    path.dirname(result)
  );
});

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: "./lib/index.js",
  output: {
    filename: path.basename(process.cwd()).replace("-integration", "").replace(".js", "") + ".min.js",
    path: path.resolve(process.cwd(), "dist")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules|debug\/index.js|next-tick\/index.js/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@swissquote/swissquote",
                {
                  environment: "production",
                  deduplicateHelpers: true,
                  useESModules: true,
                  browsers: "> 0.25%, Firefox ESR, Edge >= 13, Safari >= 7.1, iOS >= 7.1, Chrome >= 32, Firefox >= 24, Opera >= 24, IE >= 9"
                }
              ]
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.DEBUG": JSON.stringify(false),
      "process.env.VERSION": JSON.stringify(
        require(path.join(process.cwd(), "package.json")).version
      )
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: "profile.json"
    })
  ],
  optimization: {
    //concatenateModules: false
  }
};
