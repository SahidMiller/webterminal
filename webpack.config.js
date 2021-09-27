const NodePolyfillPlugin = require("node-stackify/plugin");
const path = require("path");
const webpack = require("webpack");
const { ModuleFederationPlugin } = webpack.container;
const HtmlWebpackPlugin = require("html-webpack-plugin");

const mainApp = {
  entry: "./src/App.js",
  output: {
    path: path.resolve("./dist"),
  },
  mode: "development",
  target: "web",
  module: {
    rules: [
      {
        test: /\.m?js(x?)$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules[\/\\](?!tessreact)[\/\\].+/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",
                {
                  pragma: "h",
                  pragmaFrag: "Fragment",
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|woff2|woff|mp3|ttf|svg|eot)$/,
        loader: "file-loader",
        options: {
          esModule: false,
        },
      },
    ],
  },
  resolve: {
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json", ".cjs"],
    modules: ["node_modules"],
    fallback: {
      "term.js": false,
      "pty.js": false,
    },
    alias: {
      superstring: require.resolve("vimjs/polyfills/superstring"),
      grim: require.resolve("vimjs/polyfills/grim.js"),
      pkginfo: require.resolve("vimjs/polyfills/pkginfo.js"),

      tty: require.resolve("./polyfills/tty.js"),
      process: require.resolve("./polyfills/process.js"),

      pathwatcher: false,
      "fs-admin": "fs",
      winattr: false,
      promzard: false,
      "graceful-fs": "fs",
      "node-clap": false,
      fs: false,

      //React
      //Proper alias if using npm/yarn link
      react: require.resolve("preact/compat"),
      "react-dom": "preact/compat",
      // Not necessary unless you consume a module using `createClass`
      "create-react-class": "preact/compat/lib/create-react-class",
      // Not necessary unless you consume a module requiring `react-dom-factories`
      "react-dom-factories": "preact/compat/lib/react-dom-factories",
    },
  },
  plugins: [
    new NodePolyfillPlugin({
      excludeAliases: ["process", "tty", "fs"],
    }),
    new webpack.ProvidePlugin({
      process: require.resolve("./polyfills/process.js"),
      Buffer: ["buffer", "Buffer"],
      global: require.resolve("./polyfills/global.js"),
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "./index.html"),
      filename: "index.html",
      inject: "body",
      publicPath: "./",
    }),
    new webpack.NormalModuleReplacementPlugin(
      /\.\/platform\/openbsd/,
      (resource) => {
        resource.request = "./platform/linux";
      }
    ),
    // new webpack.NormalModuleReplacementPlugin(/marker-index/, (resource) => {
    //   resource.request = "marker-index/src/js/marker-index.js"
    // })
  ],
};

const serviceWorker = {
  entry: "./src/sw/remote/index.js",
  output: {
    path: path.resolve("./dist"),
    filename: "service-worker.js",
  },
  mode: "development",
  target: "webworker",
  resolve: {
    fallback: {
      "term.js": false,
      "pty.js": false,
    },
    alias: {
      superstring: require.resolve("vimjs/polyfills/superstring"),
      grim: require.resolve("vimjs/polyfills/grim.js"),
      pkginfo: require.resolve("vimjs/polyfills/pkginfo.js"),

      child_process: require.resolve("./polyfills/child_process.js"),
      tty: require.resolve("./polyfills/tty.js"),
      process: require.resolve("./polyfills/process.js"),

      pathwatcher: false,
      "fs-admin": "fs",
      winattr: false,
      promzard: false,
      "graceful-fs": "fs",
      "node-clap": false,

      "preact/compat": require.resolve("tng-hooks"),
      "preact/hooks": require.resolve("tng-hooks"),
    },
  },
  plugins: [
    new NodePolyfillPlugin({
      excludeAliases: ["process", "tty"],
    }),
    new webpack.ProvidePlugin({
      process: require.resolve("./polyfills/process.js"),
      Buffer: ["buffer", "Buffer"],
      global: require.resolve("./polyfills/global.js"),
    }),
    new webpack.NormalModuleReplacementPlugin(
      /\.\/platform\/openbsd/,
      (resource) => {
        resource.request = "./platform/linux";
      }
    ),
  ],
};

const nodeWorker = {
  entry: "./src/worker/bootstrap-proxy-fs.js",
  output: {
    path: path.resolve("./dist"),
    filename: "node-worker.js",
  },
  mode: "development",
  target: "webworker",
  resolve: {
    fallback: {
      "term.js": false,
      "pty.js": false,
    },
    alias: {
      superstring: require.resolve("vimjs/polyfills/superstring"),
      grim: require.resolve("vimjs/polyfills/grim.js"),
      pkginfo: require.resolve("vimjs/polyfills/pkginfo.js"),

      child_process: require.resolve("./polyfills/child_process.js"),
      tty: require.resolve("./polyfills/tty.js"),
      process: require.resolve("./polyfills/process.js"),

      pathwatcher: false,
      "fs-admin": "fs",
      winattr: false,
      promzard: false,
      "graceful-fs": "fs",
      "node-clap": false,

      "preact/compat": require.resolve("tng-hooks"),
      "preact/hooks": require.resolve("tng-hooks"),

      fs: require.resolve("./polyfills/fs-manual-bootstrap"),
      zlib: require.resolve("./polyfills/zlib.js"),
      crypto: require.resolve("./polyfills/crypto.js")
    },
  },
  plugins: [
    new NodePolyfillPlugin({
      excludeAliases: ["process", "tty", "fs", "crypto", "zlib"],
    }),
    new webpack.ProvidePlugin({
      process: require.resolve("./polyfills/process.js"),
      Buffer: ["buffer", "Buffer"],
      global: require.resolve("./polyfills/global.js"),
    }),
    new webpack.NormalModuleReplacementPlugin(
      /\.\/platform\/openbsd/,
      (resource) => {
        resource.request = "./platform/linux";
      }
    ),
  ],
};

module.exports = [mainApp, serviceWorker, nodeWorker];
